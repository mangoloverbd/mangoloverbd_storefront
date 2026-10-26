import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "wouter";

import { apiRequest } from "@/lib/queryClient";
import { trackMerchantSuiteEvent } from "@/lib/merchant-suite";
import { currentLandingPagePath } from "@/lib/landing-page-attribution";
import { OrderProtectionError } from "@/lib/order-protection-errors";
import { useCheckoutProtectionSignals } from "@/lib/order-protection";
import { OrderProtectionMessage } from "@/components/order-protection-message";
import { OrderHoldConfirmation } from "@/components/order-hold-confirmation";
import { TurnstileChallenge } from "@/components/turnstile-challenge";
import { readAbandonedCartCampaign } from "@/lib/abandoned-cart-capture";
import { useAbandonedCartCapture } from "@/hooks/use-abandoned-cart-capture";
import { toGoogleAnalyticsItem, trackGoogleEcommerceEvent } from "@/lib/google-analytics";
import { normalizeBdMobile } from "../../../../shared/bd-phone";
import { MAX_LINE_QUANTITY } from "../../../../shared/order-limits";
import {
  DELIVERY_POLICY,
  KHEJUR_ASSET,
  KHEJUR_PHONE_HREF,
  KHEJUR_PHONE_NUMBER,
  KHEJUR_PRODUCTS,
  KHEJUR_THANK_YOU_PATH,
  KHEJUR_WHATSAPP_HREF,
  deliveryWindowLabel,
  formatTaka,
  toBanglaDigits,
} from "./content";
import {
  buildKhejurConfirmation,
  buildKhejurOrderPayload,
  calculateKhejurTotals,
  displayProductName,
  getKhejurLines,
  writeKhejurConfirmation,
  type KhejurLine,
  type KhejurSelection,
} from "./order";
import type { StorefrontProduct } from "@/lib/storefront-products";

type FieldErrors = Partial<Record<"name" | "phone" | "address" | "items", string>>;
type Status = "loading" | "ready" | "unavailable";

const AVAILABILITY_ERROR = "এই গুড়টি এখন অর্ডারের জন্য পাওয়া যাচ্ছে না। অন্যটি বেছে নিন বা আমাদের কল করুন।";
const FIELD_ORDER = ["items", "name", "phone", "address"] as const;
const FIELD_IDS: Record<(typeof FIELD_ORDER)[number], string> = { items: "km-packs", name: "km-name", phone: "km-phone", address: "km-address" };

function validate(selectionUnits: number, name: string, phone: string, address: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!selectionUnits) errors.items = "অন্তত একটি গুড় বেছে নিন।";
  if (name.trim().length < 2 || name.trim().length > 120) errors.name = "আপনার পুরো নাম কমপক্ষে ২ অক্ষরে লিখুন।";
  if (!normalizeBdMobile(phone)) errors.phone = "ইংরেজি সংখ্যায় ১১ সংখ্যার মোবাইল নম্বর লিখুন, যেমন 01712345678।";
  if (address.trim().length < 5 || address.trim().length > 300) errors.address = "সঠিক ডেলিভারি ঠিকানা লিখুন।";
  return errors;
}

const designFor = (slug: string) => KHEJUR_PRODUCTS.find((product) => product.slug === slug);
const analyticsItem = (line: KhejurLine, quantity: number) => toGoogleAnalyticsItem({ id: line.variantId, name: line.productName, variant: line.label, price: line.unitPrice, quantity });


export function KhejurCheckout({ products, status, catalogSettled, refresh, addRequest }: {
  products: (StorefrontProduct | null)[];
  status: Status;
  catalogSettled: boolean;
  refresh: () => Promise<(StorefrontProduct | null)[]>;
  addRequest: { slug: string; at: number } | null;
}) {
  const [, setLocation] = useLocation();
  const capture = useAbandonedCartCapture("storefront");
  const lines = useMemo(() => getKhejurLines(products, KHEJUR_PRODUCTS.map(({ slug }) => slug)), [products]);
  const [selection, setSelection] = useState<KhejurSelection>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [announcement, setAnnouncement] = useState("");
  const [requestError, setRequestError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [protectionDecision, setProtectionDecision] = useState<"review" | "block" | null>(null);
  const [protectionRetryable, setProtectionRetryable] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const { formHandlers, trackPhoneCandidate, buildProtectionPayload, resetTurnstileSignal, resetTurnstile, setTurnstileToken } = useCheckoutProtectionSignals();
  const submittingRef = useRef(false);
  const beganCheckoutRef = useRef(false);
  const viewedRef = useRef(false);
  const preselectedRef = useRef(false);
  const railRef = useRef<HTMLDivElement>(null);
  const totals = useMemo(() => calculateKhejurTotals(lines, selection), [lines, selection]);
  const eta = useMemo(() => deliveryWindowLabel(), []);

  // Start with the first gur selected, like the paper memo did — once every product has loaded,
  // so whichever request finishes first doesn't decide the default.
  useEffect(() => {
    if (preselectedRef.current || !catalogSettled || !lines.length) return;
    preselectedRef.current = true;
    setSelection({ [lines[0].variantId]: 1 });
  }, [lines, catalogSettled]);

  useEffect(() => {
    if (viewedRef.current || status !== "ready" || !lines.length) return;
    viewedRef.current = true;
    trackGoogleEcommerceEvent("view_item", { pageType: "product", value: lines[0].unitPrice, items: lines.map((line) => analyticsItem(line, 1)) });
  }, [lines, status]);

  // "যোগ করুন" on a product card adds that gur to the memo.
  useEffect(() => {
    if (!addRequest) return;
    const line = lines.find((candidate) => candidate.slug === addRequest.slug);
    if (!line) return;
    setSelection((current) => (current[line.variantId] ? current : { ...current, [line.variantId]: 1 }));
    setErrors((current) => ({ ...current, items: undefined }));
    setAnnouncement(`${displayProductName(line.productName)} মেমোতে যোগ হয়েছে`);
    trackGoogleEcommerceEvent("add_to_cart", { pageType: "product", value: line.unitPrice, items: [analyticsItem(line, 1)] });
  }, [addRequest, lines]);

  const snapshot = () => totals.items.length ? {
    customerName: name,
    phone,
    address,
    items: totals.items.map(({ line, quantity }) => ({ productName: line.productName, variantName: line.label, quantity, unitPrice: line.unitPrice })),
    subtotal: totals.subtotal,
    deliveryRate: totals.deliveryCharge,
    total: totals.total,
    campaign: readAbandonedCartCampaign(window.location.search),
  } : null;
  const updateCapture = () => { const s = snapshot(); return s ? capture.capture(s) : null; };
  const flushCapture = () => { const s = snapshot(); if (s) void capture.flush(s); };
  useEffect(() => { updateCapture(); }, [address, name, phone, totals]);

  const beginCheckout = () => {
    if (beganCheckoutRef.current || status !== "ready" || !totals.items.length) return;
    beganCheckoutRef.current = true;
    trackMerchantSuiteEvent("checkout");
    trackGoogleEcommerceEvent("begin_checkout", { pageType: "checkout", value: totals.subtotal, items: totals.items.map(({ line, quantity }) => analyticsItem(line, quantity)) });
  };

  const setQuantity = (line: KhejurLine, quantity: number) => {
    beginCheckout();
    setSelection((current) => ({ ...current, [line.variantId]: Math.max(0, Math.min(MAX_LINE_QUANTITY, quantity)) }));
    setErrors((current) => ({ ...current, items: undefined }));
  };

  const focusFirstInvalid = (fieldErrors: FieldErrors) => {
    const first = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (first) requestAnimationFrame(() => document.getElementById(FIELD_IDS[first])?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const draftKey = updateCapture();
    flushCapture();
    const nextErrors = validate(totals.units, name, phone, address);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setRequestError(false);
      setAnnouncement(FIELD_ORDER.map((field) => nextErrors[field]).find(Boolean) ?? "অর্ডারের তথ্য আবার দেখুন।");
      focusFirstInvalid(nextErrors);
      return;
    }

    submittingRef.current = true;
    setIsPending(true);
    setProtectionDecision(null);
    const website = String(new FormData(event.currentTarget).get("hp_x7") || "");
    setErrors({});
    setRequestError(false);
    setAnnouncement("গুড়ের সর্বশেষ মূল্য ও স্টক যাচাই করা হচ্ছে।");

    try {
      // Re-read price and stock right before ordering; the Suite stays authoritative.
      const fresh = getKhejurLines(await refresh(), KHEJUR_PRODUCTS.map(({ slug }) => slug));
      const freshTotals = calculateKhejurTotals(fresh, selection);
      if (freshTotals.items.length !== totals.items.length) {
        setErrors({ items: AVAILABILITY_ERROR });
        setAnnouncement(AVAILABILITY_ERROR);
        focusFirstInvalid({ items: AVAILABILITY_ERROR });
        return;
      }
      const landingPagePath = currentLandingPagePath();
      const payload = buildKhejurOrderPayload({ totals: freshTotals, customerName: name, phone, address });
      const response = await apiRequest("POST", "/api/orders", {
        ...payload,
        ...buildProtectionPayload(website),
        ...(landingPagePath ? { landingPagePath } : {}),
        ...(draftKey ? { draftKey } : {}),
      });
      const result = await response.json() as { orderRef?: unknown; decision?: unknown };
      if (response.status === 202 && result.decision === "review") {
        setProtectionDecision("review");
        capture.clear();
        return;
      }
      if (response.status !== 201 || typeof result.orderRef !== "string" || !result.orderRef.trim()) throw new Error("unexpected-order-response");
      capture.clear();
      writeKhejurConfirmation(window.sessionStorage, buildKhejurConfirmation(result.orderRef, freshTotals, payload));
      trackMerchantSuiteEvent("purchased");
      setLocation(KHEJUR_THANK_YOU_PATH);
    } catch (error) {
      if (error instanceof OrderProtectionError) {
        setProtectionDecision("block");
        setProtectionRetryable(error.retryable);
        setAnnouncement(error.message);
        return;
      }
      setRequestError(true);
      setAnnouncement("অর্ডারটি পাঠানো যায়নি। আপনার তথ্য ঠিক আছে—আবার চেষ্টা করুন বা আমাদের সঙ্গে যোগাযোগ করুন।");
    } finally {
      submittingRef.current = false;
      setIsPending(false);
      resetTurnstile();
    }
  };

  if (protectionDecision === "review") return <OrderHoldConfirmation />;

  const slides = KHEJUR_PRODUCTS;
  const scrollToSlide = (index: number) => {
    const rail = railRef.current;
    if (rail) rail.scrollTo({ left: index * rail.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className="skx v1-memo"><div className="skx-main">
      <div className="skx-intro"><span className="skx-script">শীতের স্বাদ, ঘরে পৌঁছে দিই</span><p>আপনার পছন্দের খেজুরের গুড় এবার আপনার ঠিকানায়।</p></div>
      <div className="skx-paper-wrap">
        <svg className="paper-clip paper-clip-back" viewBox="0 0 28 76" aria-hidden="true"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 52 V14 A5 5 0 0 1 20 14" stroke="#5d6268" strokeWidth="2.5" /><path d="M10 52 V14 A5 5 0 0 1 20 14" stroke="#a7abb1" strokeWidth="1.6" /><path d="M10 52 V14 A5 5 0 0 1 20 14" stroke="#ffffff" strokeWidth=".55" opacity="0.55" transform="translate(-.35 -.4)" /></g></svg>
        <article className="skx-paper">
          <div className="skx-paper-head"><img className="km-mango" src={KHEJUR_ASSET("mango-mark.webp")} alt="" width={240} height={171} /><div><h2 id="km-heading" tabIndex={-1}>অর্ডার মেমো</h2><p>ম্যাংগো লাভার · রাজশাহী</p></div><span className="skx-serial" aria-hidden="true">খাতা নং<br /><b>০১</b></span></div>
          <div className="skx-order">
            <div className="v1-gal">
              <div className="v1-gal-rail" ref={railRef} role="region" aria-label="খেজুরের গুড়ের ছবি" tabIndex={0}
                onScroll={(event) => { const rail = event.currentTarget; setActiveSlide(Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1))); }}>
                {slides.map((slide) => <div key={slide.slug} className="v1-gal-slide"><img src={KHEJUR_ASSET(slide.sunImage)} alt={slide.short} width={900} height={900} draggable={false} /></div>)}
              </div>
              <div className="v1-gal-capsule">
                {slides.map((slide, i) => <button key={slide.slug} type="button" aria-label={`ছবি ${toBanglaDigits(i + 1)}`} aria-current={i === activeSlide} onClick={() => scrollToSlide(i)}><img src={KHEJUR_ASSET(slide.sunImage)} alt="" width={38} height={38} /></button>)}
              </div>
            </div>
            <p className="v1-memo-pick" id="km-packs-label"><span>গুড় ও পরিমাণ বেছে নিন</span></p>
            <p className="km-note">একাধিক বেছে নিতে পারেন</p>
            <div className="v1-memo-packs" id="km-packs" role="group" aria-labelledby="km-packs-label" tabIndex={-1} aria-describedby={errors.items ? "km-packs-error" : undefined}>
              {status === "loading" && !lines.length ? <p className="km-note" role="status">গুড়ের দাম লোড হচ্ছে…</p> : null}
              {lines.map((line) => {
                const quantity = selection[line.variantId] ?? 0;
                const design = designFor(line.slug);
                const percentOff = line.comparePrice ? Math.round((1 - line.unitPrice / line.comparePrice) * 100) : 0;
                return (
                  <div key={line.variantId} className="v1-memo-pack" data-checked={quantity > 0}>
                    <label>
                      <input className="sr-only" type="checkbox" checked={quantity > 0} onChange={(event) => setQuantity(line, event.target.checked ? 1 : 0)} />
                      <span className="dot" aria-hidden="true" />
                      <span className="lbl"><b>{displayProductName(line.productName)}</b> · {line.label}{percentOff > 0 ? <em className="off">{toBanglaDigits(percentOff)}% ছাড়</em> : null}<small>{design?.uses.join(" · ")}</small></span>
                    </label>
                    <div className="end">
                      <span className="pr">{formatTaka(line.unitPrice)}{line.comparePrice ? <s>{formatTaka(line.comparePrice)}</s> : null}</span>
                      {quantity ? (
                        <div className="skx-qty" role="group" aria-label={`${displayProductName(line.productName)} পরিমাণ`}>
                          <button type="button" aria-label="কমান" onClick={() => setQuantity(line, quantity - 1)}>−</button>
                          <output>{toBanglaDigits(quantity)}</output>
                          <button type="button" aria-label="বাড়ান" disabled={quantity >= MAX_LINE_QUANTITY} onClick={() => setQuantity(line, quantity + 1)}>+</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.items ? <p id="km-packs-error" className="skx-field-error">{errors.items}</p> : null}
            {status === "unavailable" ? (
              <p className="skx-field-error">গুড়ের তথ্য এখন লোড করা যাচ্ছে না। <a href={KHEJUR_PHONE_HREF}>কল করুন: {KHEJUR_PHONE_NUMBER}</a></p>
            ) : null}
          </div>

          <form className="skx-form" noValidate onSubmit={handleSubmit}
            onFocusCapture={(event) => { beginCheckout(); formHandlers.onFocusCapture(event); }}
            onPasteCapture={formHandlers.onPasteCapture} onBlurCapture={flushCapture}>
            <input name="hp_x7" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
            <section className="skx-section" aria-label="আপনার নাম, নম্বর ও ঠিকানা">
              <div className="skx-row">
                <div className="skx-field">
                  <label htmlFor="km-name">আপনার নাম<small>Full name</small></label>
                  <input id="km-name" name="name" type="text" autoComplete="name" maxLength={120} placeholder="আপনার সম্পূর্ণ নাম লিখুন" value={name} onChange={(event) => setName(event.target.value)}
                    aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "km-name-error" : undefined} />
                  {errors.name ? <span id="km-name-error" className="skx-field-error">{errors.name}</span> : null}
                </div>
                <div className="skx-field">
                  <label htmlFor="km-phone">মোবাইল নম্বর<small>Phone number</small></label>
                  <input id="km-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={20} placeholder="01XXXXXXXXX" value={phone}
                    onChange={(event) => { setPhone(event.target.value); trackPhoneCandidate(event.target.value); }}
                    aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? "km-phone-error" : "km-phone-hint"} />
                  {errors.phone ? <span id="km-phone-error" className="skx-field-error">{errors.phone}</span> : <span id="km-phone-hint" className="skx-field-hint">এই নম্বরেই অর্ডার কনফার্ম করব।</span>}
                </div>
              </div>
              <div className="skx-field">
                <label htmlFor="km-address">সম্পূর্ণ ঠিকানা<small>Delivery address</small></label>
                <textarea id="km-address" name="address" rows={3} maxLength={300} autoComplete="street-address" placeholder="বাড়ি / হোল্ডিং, রাস্তা, এলাকা" value={address} onChange={(event) => setAddress(event.target.value)}
                  aria-invalid={errors.address ? true : undefined} aria-describedby={errors.address ? "km-address-error" : undefined} />
                {errors.address ? <span id="km-address-error" className="skx-field-error">{errors.address}</span> : null}
              </div>
            </section>
            <section className="skx-payment" aria-label="পেমেন্ট ও ডেলিভারি"><div className="skx-stamp" aria-hidden="true">আগে অর্ডার<br /><b>পরে পেমেন্ট</b><small>ক্যাশ অন ডেলিভারি</small></div></section>
            <div className="skx-amounts">
              {totals.items.map(({ line, quantity }) => (
                <div key={line.variantId} className="km-item"><span>{displayProductName(line.productName)}<small>{line.label} × {toBanglaDigits(quantity)}</small></span><strong>{formatTaka(line.unitPrice * quantity)}</strong></div>
              ))}
              <div className="km-delivery">
                <span>ডেলিভারি চার্জ<small className="v1-eta">সম্ভাব্য ডেলিভারি <b>{eta}</b></small></span>
                <strong>{totals.units && !totals.deliveryCharge ? "ফ্রি" : formatTaka(totals.units ? totals.deliveryCharge : 100)}</strong>
              </div>
              <div className="skx-grand"><span>সর্বমোট<small>হাতে পেয়ে পরিশোধ করবেন</small></span><strong><span className="v1-roll">{totals.units ? formatTaka(totals.total) : "—"}</span></strong></div>
            </div>
            <TurnstileChallenge onToken={setTurnstileToken} resetSignal={resetTurnstileSignal} />
            <div className="km-live" aria-live="polite" aria-atomic="true">{announcement}</div>
            {protectionDecision === "block" ? <OrderProtectionMessage decision="block" retryable={protectionRetryable} /> : null}
            {requestError ? (
              <p className="skx-field-error">আপনার লেখা তথ্য রাখা হয়েছে। আবার চেষ্টা করুন অথবা <a href={KHEJUR_PHONE_HREF}>কল করুন</a> / <a href={KHEJUR_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">হোয়াটসঅ্যাপ</a>।</p>
            ) : null}
            <button type="submit" className="skx-submit" disabled={isPending || status !== "ready" || !totals.units}>
              <span>{isPending ? "অর্ডার পাঠানো হচ্ছে…" : requestError ? "আবার অর্ডার চেষ্টা করুন" : "অর্ডার নিশ্চিত করুন"}</span>
              <span className="skx-submit-end"><span>{totals.units ? formatTaka(totals.total) : "—"}</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7" /></svg></span>
            </button>
            <p className="v1-pay-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg><span><b>ক্যাশ অন ডেলিভারি</b> · পণ্য হাতে পেয়ে টাকা দেবেন</span></p>
            <p className="skx-submit-help">কনফার্ম করতে আমরা আপনাকে ফোন করব।</p>
            <p className="skx-terms">অর্ডার করে আপনি আমাদের <a href="/terms-and-conditions">শর্তাবলি</a> ও <a href="/refund-and-return-policy">রিটার্ন নীতিমালা</a> মেনে নিচ্ছেন।</p>
            <details className="skx-policy">
              <summary>ডেলিভারি ও ফেরত নীতি <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
              <ul>{DELIVERY_POLICY.map((item) => <li key={item}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg><span>{item}</span></li>)}</ul>
            </details>
            <div className="skx-signoff"><span>বিশ্বাসের সঙ্গে,</span><b>ম্যাংগো লাভার</b><img className="km-mango km-mango-sm" src={KHEJUR_ASSET("mango-mark.webp")} alt="" width={240} height={171} /></div>
          </form>
        </article>
        <svg className="paper-clip paper-clip-front" viewBox="0 0 28 76" aria-hidden="true"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14 V66 A8 8 0 0 1 4 66 V10 A10 10 0 0 1 24 10 V56" stroke="#6b7077" strokeWidth="2.5" /><path d="M20 14 V66 A8 8 0 0 1 4 66 V10 A10 10 0 0 1 24 10 V56" stroke="#c9cdd2" strokeWidth="1.6" /><path d="M20 14 V66 A8 8 0 0 1 4 66 V10 A10 10 0 0 1 24 10 V56" stroke="#ffffff" strokeWidth=".55" opacity="0.9" transform="translate(-.35 -.4)" /></g></svg>
      </div>
    </div></div>
  );
}
