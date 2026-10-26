import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQueries } from "@tanstack/react-query";

import { generatedStorefrontProducts } from "@/lib/generated-storefront-products";
import {
  STOREFRONT_POLL_INTERVAL_MS,
  fetchStorefrontProduct,
  fetchStorefrontProductInventory,
  findGeneratedStorefrontProduct,
  mergeInventory,
  type StorefrontProduct,
} from "@/lib/storefront-products";
import { KHEJUR_ASSET, KHEJUR_PHONE_HREF, KHEJUR_PHONE_NUMBER, KHEJUR_PRODUCTS, KHEJUR_WHATSAPP_HREF, formatTaka, toBanglaDigits } from "@/features/khejurer-gur/content";
import { getKhejurLines } from "@/features/khejurer-gur/order";
import { KhejurCheckout } from "@/features/khejurer-gur/khejur-checkout";
import { Deco, GurRoad, Ribbon, RollWord, useRevealOnScroll } from "@/features/khejurer-gur/landing-parts";
import { MotionShape, Shape } from "@/features/khejurer-gur/shapes";
import { NutritionistBento } from "@/features/khejurer-gur/nutritionist";
import "@/features/khejurer-gur/landing.css";

const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Galada&family=Geist:wght@400..800&family=Noto+Serif+Bengali:wght@400..900&display=swap";

const HERO_TOP_COLOR = "#fde3c8";

// Mobile browsers tint their toolbar and overscroll area from theme-color and the root background;
// match them to the top of the hero while this page is open.
function useHeroChromeColor() {
  useEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.backgroundColor;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const created = !meta;
    const previousTheme = meta?.content ?? null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = HERO_TOP_COLOR;
    root.style.backgroundColor = HERO_TOP_COLOR;
    return () => {
      root.style.backgroundColor = previousBackground;
      if (created) meta?.remove();
      else if (meta && previousTheme !== null) meta.content = previousTheme;
    };
  }, []);
}

// The display fonts are only needed on this page, so load them when it mounts.
function usePageFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);
}

const PHONE_RING = "M8 3c.5 0 2.5 4.5 2.5 5 0 1-1.5 2-2 3s.5 2 1.5 3c.39.39 2 2 3 1.5s2-2 3-2c.5 0 5 2 5 2.5 0 2-1.5 3.5-3 4-1.5.5-2.5.5-4.5 0s-3.5-1-6-3.5S4.5 13 4 11s-.5-3 0-4.5S6 3 8 3Z";
const WHATSAPP_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

export default function KhejurerGurPage() {
  usePageFonts();
  useHeroChromeColor();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const orderRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [addRequest, setAddRequest] = useState<{ slug: string; at: number } | null>(null);
  const [barVisible, setBarVisible] = useState(false);
  useRevealOnScroll(rootRef);

  const productQueries = useQueries({
    queries: KHEJUR_PRODUCTS.map(({ slug }) => ({
      queryKey: ["merchant-suite-product", slug],
      queryFn: () => fetchStorefrontProduct(slug),
      initialData: findGeneratedStorefrontProduct(generatedStorefrontProducts, slug) ?? undefined,
      refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
    })),
  });
  const inventoryQueries = useQueries({
    queries: KHEJUR_PRODUCTS.map(({ slug }) => ({
      queryKey: ["merchant-suite-inventory", slug],
      queryFn: () => fetchStorefrontProductInventory(slug),
      refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
    })),
  });
  const products = productQueries.map((query, i) => mergeInventory(query.data, inventoryQueries[i].data?.inventory));
  const productsKey = JSON.stringify(products);
  const stableProducts = useMemo(() => products, [productsKey]);
  const lines = useMemo(() => getKhejurLines(stableProducts, KHEJUR_PRODUCTS.map(({ slug }) => slug)), [stableProducts]);
  const fromPrice = lines.length ? Math.min(...lines.map((line) => line.unitPrice)) : null;
  const catalogSettled = !productQueries.some((query) => query.isPending) && !inventoryQueries.some((query) => query.isPending);
  const status = lines.length ? "ready" : catalogSettled ? "unavailable" : "loading";

  const refresh = useCallback(async () => {
    const [productResults, inventoryResults] = await Promise.all([
      Promise.all(productQueries.map((query) => query.refetch())),
      Promise.all(inventoryQueries.map((query) => query.refetch())),
    ]);
    if (productResults.some((result) => result.isError) || inventoryResults.some((result) => result.isError)) throw new Error("refresh-failed");
    return productResults.map((result, i) => mergeInventory(result.data as StorefrontProduct | null | undefined, inventoryResults[i].data?.inventory));
  }, [productQueries, inventoryQueries]);

  const scrollToOrder = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    orderRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, []);
  const addToMemo = (slug: string) => setAddRequest({ slug, at: Date.now() });

  // Sticky order bar: shown once the hero has scrolled away, hidden while the memo or footer is on screen.
  useEffect(() => {
    const hero = heroRef.current, order = orderRef.current, footer = footerRef.current;
    if (!hero || !order || !footer) return;
    let heroGone = false, orderIn = false, footerIn = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === order) orderIn = entry.isIntersecting;
        else if (entry.target === footer) footerIn = entry.isIntersecting;
        else heroGone = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      });
      setBarVisible(heroGone && !orderIn && !footerIn);
    });
    io.observe(hero);
    io.observe(order);
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const goToOrder = (event: React.MouseEvent) => { event.preventDefault(); scrollToOrder(); };
  const fromLabel = fromPrice !== null ? formatTaka(fromPrice) : "—";

  return (
    <div className="sp" data-v="a" ref={rootRef}>
      <header className="top"><img className="top-logo" src={KHEJUR_ASSET("logo-stacked.webp")} alt="ম্যাংগো লাভার" width={295} height={320} /></header>
      <main>
        <section className="ha" data-hero data-io data-hv="1" ref={heroRef}>
          <Deco set="hero" />
          <p className="kick rise" style={{ "--d": "0ms" } as CSSProperties}>ম্যাংগো লাভার · শীতের প্রথম রস</p>
          <h1 className="rise" style={{ "--d": "80ms" } as CSSProperties}>খেজুরের<br /><img className="h1-gur" src={KHEJUR_ASSET("hero-gur.webp")} alt="গুড়" width={900} height={602} /></h1>
          <p className="ha-word rise" style={{ "--d": "160ms" } as CSSProperties}>আজ সকালের <RollWord /></p>
          <p className="lede rise" style={{ "--d": "240ms" } as CSSProperties}>এক রস, তিন রূপ — ঢেলে খাওয়ার ঝোলা, দানা দানা বীজ আর ভেঙে খাওয়ার পাটালি।</p>
          <div className="ha-art hv hv1">
            <span className="hv1-rays"><span><Shape name="rays" color="#f9b25e" /></span></span>
            <span className="arc a1" /><span className="arc a2" /><span className="arc a3" /><span className="arc a4" />
            <span className="deco pop" style={{ "--d": "900ms", left: "6%", top: "6%", width: "14%", height: "14%" } as CSSProperties}><MotionShape name="sparkle" color="blue" motion="twk" /></span>
            <span className="deco pop" style={{ "--d": "1000ms", right: "8%", top: "14%", width: "9%", height: "9%" } as CSSProperties}><MotionShape name="sparkle" color="coral" motion="twk" style={{ "--t": "3.2s" } as CSSProperties} /></span>
            <span className="hill" />
            <span className="hv-climb"><img src={KHEJUR_ASSET("hero-climbers.webp")} alt="সূর্যাস্তে খেজুর গাছে উঠছেন গাছিরা" width={493} height={760} /></span>
            <img className="hv-trio" src={KHEJUR_ASSET("trio.webp")} alt="কাচের বাটিতে বীজ গুড়, মাঝে পাটালি আর মাটির বাটিতে ঝোলা গুড়" width={1100} height={734} />
            {fromPrice !== null ? (
              <div className="sticker pop hv-price" style={{ "--d": "1350ms" } as CSSProperties}>
                <span className="spin" style={{ "--t": "24s", position: "absolute", inset: 0 } as CSSProperties}><Shape name="flower" color="coral" /></span>
                <span><small>শুরু মাত্র</small><span style={{ fontSize: 22 }}>{fromLabel}</span></span>
              </div>
            ) : null}
          </div>
          <div className="ha-cta rise" style={{ "--d": "900ms" } as CSSProperties}><a className="btn" href="#orderK" onClick={goToOrder}>এখনই অর্ডার করুন</a><span><b>ক্যাশ অন ডেলিভারি</b> · সারা দেশে ৳১০০</span></div>
        </section>

        <Ribbon />

        <section className="pa" data-io aria-labelledby="pa-h">
          <Deco set="products" />
          <div className="wrap">
            <p className="kick rise" style={{ textAlign: "center" }}>তিন রকম গুড়</p>
            <h2 className="t rise" id="pa-h" style={{ "--d": "80ms" } as CSSProperties}>কোনটা আপনার?</h2>
            <div className="pa-list">
              {KHEJUR_PRODUCTS.map((design, i) => {
                const line = lines.find((candidate) => candidate.slug === design.slug);
                return (
                  <article key={design.slug} className="pa-card rise" style={{ "--d": `${150 + i * 120}ms`, "--c": design.accent } as CSSProperties}>
                    <div className="pa-pic">
                      <span className="spin" style={{ position: "absolute", inset: 0, "--t": `${40 + i * 10}s` } as CSSProperties}><Shape name={design.shape} color={design.shapeColor} /></span>
                      <img src={KHEJUR_ASSET(design.image)} alt={design.short} loading="lazy" />
                    </div>
                    <div>
                      <small>০{toBanglaDigits(i + 1)} · {design.uses.join(" · ")}</small>
                      <h3>{design.short}</h3>
                      <p>{design.line}</p>
                      <div className="buy">
                        {line ? <><b className="num">{formatTaka(line.unitPrice)}</b><span>{line.label}</span><button type="button" className="btn sm" onClick={() => { addToMemo(design.slug); scrollToOrder(); }}>যোগ করুন</button></>
                          : <span>{status === "loading" ? "দাম লোড হচ্ছে…" : "এখন স্টকে নেই"}</span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <GurRoad onOrder={scrollToOrder} />

        <NutritionistBento />

        <div className="amsotto am-k in">
          <section className="v1-order" id="orderK" aria-labelledby="km-heading" ref={orderRef}>
            <KhejurCheckout products={stableProducts} status={status} catalogSettled={catalogSettled} refresh={refresh} addRequest={addRequest} />
          </section>
        </div>
      </main>

      <footer className="ftw" data-ft="1" ref={footerRef}>
        <div className="ft ft1" data-io>
          <div className="ft1-wave" aria-hidden="true"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 40 V18 C 50 0, 100 0, 150 16 S 250 34, 300 16 S 370 2, 400 14 V40Z" fill="#fbd772" /><path d="M0 18 C 50 0, 100 0, 150 16 S 250 34, 300 16 S 370 2, 400 14" fill="none" stroke="#f47b5c" strokeWidth="4" /></svg></div>
          <div className="ft1-in">
            <span className="ftd pop" style={{ "--d": "100ms", left: "4%", top: "8%", width: 44, height: 44 } as CSSProperties}><MotionShape name="burst" color="coral" motion="spin" style={{ "--t": "18s" } as CSSProperties} /></span>
            <span className="ftd pop" style={{ "--d": "200ms", right: "16%", top: "4%", width: 24, height: 24 } as CSSProperties}><MotionShape name="sparkle" color="yellow" motion="twk" /></span>
            <span className="ftd pop" style={{ "--d": "300ms", right: "5%", top: "6%", width: 30, height: 30 } as CSSProperties}><MotionShape name="flower" color="lilac" motion="spin r" style={{ "--t": "22s" } as CSSProperties} /></span>
            <span className="ft-badge">
              <span className="ft-badge-bg spin" style={{ "--t": "60s" } as CSSProperties}><Shape name="scallop" color="#fffaf2" /></span>
              <img className="ft-logo ft-logo-stacked" src={KHEJUR_ASSET("logo-stacked.webp")} alt="ম্যাংগো লাভার" width={295} height={320} loading="lazy" />
            </span>
            <p className="ft-tag">প্রকৃতির স্বাদ, যত্নের সঙ্গে পৌঁছে দিই আপনার ঘরে।</p>
            <div className="sg">
              <a className="sg-cell" href={KHEJUR_PHONE_HREF}><span className="sg-idx num">০১</span><span className="sg-ico sg-phone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className="ring" d={PHONE_RING} /></svg><i /></span><b>কল করুন</b><small className="num">{KHEJUR_PHONE_NUMBER}</small><svg className="sg-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
              <a className="sg-cell" href={KHEJUR_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer"><span className="sg-idx num">০২</span><span className="sg-ico sg-wa"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WHATSAPP_PATH} /></svg><i /></span><b>হোয়াটসঅ্যাপ</b><small>মেসেজে অর্ডার</small><svg className="sg-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
            </div>
            <p className="ft-trust"><b>ক্যাশ অন ডেলিভারি</b> · সারা বাংলাদেশে</p>
            <nav className="ft-pol" aria-label="নীতিমালা"><a href="/privacy-policy">Privacy Policy</a><a href="/refund-and-return-policy">Refund &amp; Return</a><a href="/terms-and-conditions">Terms &amp; Conditions</a></nav>
            <a className="ft-credit" href="https://www.arc-bangladesh.com/" target="_blank" rel="noopener noreferrer"><small>Designed &amp; Engineered by</small><i /><img src={KHEJUR_ASSET("arc-credit.webp")} alt="Arc Labs Corporation" width={188} height={72} loading="lazy" /></a>
            <p className="ft-copy">© <span className="num">২০২৬</span> ম্যাংগো লাভার · নওহাটা, পবা, রাজশাহী, বাংলাদেশ, <span className="num">৬২১৩</span></p>
          </div>
        </div>
      </footer>

      <div className={barVisible ? "bar show" : "bar"}>
        <p>খেজুরের গুড় · ৩ রকম<b className="num">{fromLabel} থেকে</b></p>
        <a className="btn sm y" href="#orderK" onClick={goToOrder}>অর্ডার করুন</a>
      </div>
    </div>
  );
}
