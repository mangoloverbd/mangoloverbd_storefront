# Homemade Pumpkin Bori Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/step/homemade-pumpkin-bori` campaign landing page with the same sections and styling as `/step/katimon-mango`, ordering through the shared Kalojira checkout.

**Architecture:** A standalone page file copied from the Katimon page structure, with bori copy and image-slot constants in a small content module. The shared `KalojiraCheckout` gets one extra slug branch so its in-checkout WhatsApp button carries the bori message. Katimon is not modified.

**Tech Stack:** React 18 + Vite + TypeScript, wouter routing (existing storefront router), TanStack Query, Tailwind, framer-motion, embla-carousel. Tests are source-level `node:test` files run with `npx tsx --test`.

**Spec:** `docs/superpowers/specs/2026-09-27-homemade-pumpkin-bori-landing-design.md`

**Repo / branch:** `mangoloverbd_storefront`, branch `feat/homemade-pumpkin-bori-landing` (already created from `origin/main`).

## Global Constraints

- Route: `/step/homemade-pumpkin-bori`. Product slug: `homemade-pumpkin-bori`.
- Page title: `কুমড়ো বড়ি | ম্যাংগো লাভার`.
- WhatsApp message: `হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই`, sent to `8801301636461`.
- Pack display prices: 500G `৳400`, struck-through `৳650`; 1KG `৳700`, struck-through `৳1,300`. Display only; checkout uses live variant prices.
- Delivery charge: `deliveryCharge={100}`.
- Do not modify `client/src/pages/katimon-mango.tsx` or `katimon-content.ts`. The existing `katimon-mango.test.ts` must keep passing.
- The storefront router is `wouter` (this repo's existing convention); import `Link` from `"wouter"` as Katimon does.
- Currency symbol is always `৳`.

## File Structure

| File | Responsibility |
|---|---|
| `client/src/features/kalojira-mixed/bori-content.ts` (create) | Bori WhatsApp message/href and all image-slot URLs |
| `client/src/features/kalojira-mixed/kalojira-checkout.tsx` (modify line 30 and line 143) | In-checkout WhatsApp href picks the bori message for the bori slug |
| `client/src/pages/homemade-pumpkin-bori.tsx` (create) | The landing page |
| `client/src/App.tsx` (modify lines 19, 32, 220-222) | Import, title, and route |
| `client/src/pages/homemade-pumpkin-bori.test.ts` (create) | Source-level tests for content, checkout branch, page, and route |

---

### Task 1: Bori content module and checkout WhatsApp branch

**Files:**
- Create: `client/src/features/kalojira-mixed/bori-content.ts`
- Modify: `client/src/features/kalojira-mixed/kalojira-checkout.tsx:30` and `:143`
- Test: `client/src/pages/homemade-pumpkin-bori.test.ts`

**Interfaces:**
- Produces (exports from `bori-content.ts`): `BORI_CAMPAIGN_WHATSAPP_MESSAGE: string`, `BORI_CAMPAIGN_WHATSAPP_HREF: string`, `BORI_PACK_500G_IMAGE: string`, `BORI_PACK_1KG_IMAGE: string`, `BORI_STRIP_IMAGE: string`, `BORI_QUOTE_IMAGE: string`, `BORI_BANNER_IMAGE: string`, `BORI_HERO_FALLBACK_IMAGE: string`.

- [ ] **Step 1: Write the failing tests**

Create `client/src/pages/homemade-pumpkin-bori.test.ts`:

```ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => {
  const url = new URL(path, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};
const contentSource = read("../features/kalojira-mixed/bori-content.ts");
const checkoutSource = read("../features/kalojira-mixed/kalojira-checkout.tsx");

test("bori WhatsApp href uses the exact Bengali order message", () => {
  assert.match(contentSource, /হোমমেড কুমড়ো বড়ি \| Homemade Pumpkin Bori অর্ডার করতে চাই/);
  assert.match(contentSource, /https:\/\/wa\.me\/8801301636461\?text=\$\{encodeURIComponent\(BORI_CAMPAIGN_WHATSAPP_MESSAGE\)\}/);
});

test("bori image slots are named constants", () => {
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_BANNER_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
    assert.match(contentSource, new RegExp(`export const ${name} =`));
  }
});

test("shared checkout uses the bori WhatsApp href for the bori product", () => {
  assert.match(checkoutSource, /import \{ BORI_CAMPAIGN_WHATSAPP_HREF \} from "\.\/bori-content";/);
  assert.match(checkoutSource, /product\?\.slug === "homemade-pumpkin-bori" \? BORI_CAMPAIGN_WHATSAPP_HREF/);
  assert.match(checkoutSource, /product\?\.slug === "katimon-mango" \? KATIMON_CAMPAIGN_WHATSAPP_HREF/);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx tsx --test client/src/pages/homemade-pumpkin-bori.test.ts`
Expected: 3 failing tests (content file missing, checkout branch missing).

- [ ] **Step 3: Create `bori-content.ts`**

```ts
export const BORI_CAMPAIGN_WHATSAPP_MESSAGE = "হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই";
export const BORI_CAMPAIGN_WHATSAPP_HREF =
  `https://wa.me/8801301636461?text=${encodeURIComponent(BORI_CAMPAIGN_WHATSAPP_MESSAGE)}`;

// Placeholder art: the product's own photos. Replace each URL with custom art when it is ready.
const BORI_PHOTO_BASE = "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/db9134d3-4771-4f66-960c-7fac1fb782e1";
const JAR_PACKSHOT = `${BORI_PHOTO_BASE}/b1d7185b-da63-4879-851e-cbddc95d3712/960.webp`;

export const BORI_PACK_500G_IMAGE = JAR_PACKSHOT;
export const BORI_PACK_1KG_IMAGE = JAR_PACKSHOT;
export const BORI_STRIP_IMAGE = `${BORI_PHOTO_BASE}/b4533922-8c5a-407c-a59a-ecbd20bc9e42/960.webp`;
export const BORI_QUOTE_IMAGE = `${BORI_PHOTO_BASE}/2fae2279-3268-4b51-8f8b-7b449234fac5/960.webp`;
export const BORI_BANNER_IMAGE = `${BORI_PHOTO_BASE}/5d991461-aeea-4ff7-8051-addf23c8f77a/960.webp`;
export const BORI_HERO_FALLBACK_IMAGE = JAR_PACKSHOT;
```

- [ ] **Step 4: Add the checkout branch**

In `client/src/features/kalojira-mixed/kalojira-checkout.tsx`, after line 30 (`import { KATIMON_CAMPAIGN_WHATSAPP_HREF } from "./katimon-content";`) add:

```ts
import { BORI_CAMPAIGN_WHATSAPP_HREF } from "./bori-content";
```

Replace line 143:

```ts
  const whatsappHref = product?.slug === "katimon-mango" ? KATIMON_CAMPAIGN_WHATSAPP_HREF : WHATSAPP_HREF;
```

with:

```ts
  const whatsappHref = product?.slug === "katimon-mango" ? KATIMON_CAMPAIGN_WHATSAPP_HREF : product?.slug === "homemade-pumpkin-bori" ? BORI_CAMPAIGN_WHATSAPP_HREF : WHATSAPP_HREF;
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npx tsx --test client/src/pages/homemade-pumpkin-bori.test.ts client/src/pages/katimon-mango.test.ts`
Expected: all pass (3 new, 24 Katimon).

- [ ] **Step 6: Commit**

```bash
git add client/src/features/kalojira-mixed/bori-content.ts client/src/features/kalojira-mixed/kalojira-checkout.tsx client/src/pages/homemade-pumpkin-bori.test.ts
git commit -m "feat: add pumpkin bori campaign content and checkout WhatsApp link"
```

---

### Task 2: Bori landing page and route

**Files:**
- Create: `client/src/pages/homemade-pumpkin-bori.tsx`
- Modify: `client/src/App.tsx:19`, `:32`, `:220-222`
- Test: `client/src/pages/homemade-pumpkin-bori.test.ts` (append)

**Interfaces:**
- Consumes: all exports of `bori-content.ts` from Task 1; existing `KalojiraCheckout`, `MobileOrderBar`, `resolveKalojiraCheckoutStatus`, `getKalojiraPackOptions`, `WhatsAppBrandIcon`, `KALOJIRA_CAMPAIGN_PHONE_HREF`, storefront-products helpers (same imports as `katimon-mango.tsx`).
- Produces: default export `HomemadePumpkinBoriPage` from `@/pages/homemade-pumpkin-bori`.

- [ ] **Step 1: Append failing tests**

Append to `client/src/pages/homemade-pumpkin-bori.test.ts`:

```ts
const pageSource = read("./homemade-pumpkin-bori.tsx");
const appSource = read("../App.tsx");

test("bori route and title are registered", () => {
  assert.match(appSource, /import HomemadePumpkinBoriPage from "@\/pages\/homemade-pumpkin-bori";/);
  assert.match(appSource, /"\/step\/homemade-pumpkin-bori": "কুমড়ো বড়ি \| ম্যাংগো লাভার"/);
  assert.match(appSource, /<Route path="\/step\/homemade-pumpkin-bori">\s*<PageTransition><HomemadePumpkinBoriPage \/><\/PageTransition>/);
});

test("bori page loads the bori product and checks out with ৳100 delivery", () => {
  assert.match(pageSource, /const slug = "homemade-pumpkin-bori";/);
  assert.match(pageSource, /deliveryCharge=\{100\}/);
});

test("every bori WhatsApp entry point uses the bori href", () => {
  assert.match(pageSource, /window\.open\(BORI_CAMPAIGN_WHATSAPP_HREF, "_blank"/);
  assert.match(pageSource, /<MobileOrderBar checkoutId="order" whatsappHref=\{BORI_CAMPAIGN_WHATSAPP_HREF\}/);
  assert.ok((pageSource.match(/href=\{BORI_CAMPAIGN_WHATSAPP_HREF\}/g) ?? []).length >= 2, "header and footer WhatsApp links");
  assert.doesNotMatch(pageSource, /KATIMON_CAMPAIGN_WHATSAPP_HREF|katimon-mango/);
});

test("bori hero and pack copy match the spec", () => {
  for (const text of ["ঐতিহ্যবাহী ঘরোয়া স্বাদ", "ঘরে তৈরি, রোদে শুকানো", "কুমড়ো বড়ি", "৳400", "৳650", "৳700", "৳1,300", "500G", "1KG", "ছোট পরিবারের জন্য উপযুক্ত", "বড় পরিবার বা উপহারের জন্য পারফেক্ট"]) {
    assert.ok(pageSource.includes(text), `missing: ${text}`);
  }
});

test("bori story, quote, and image slots are present", () => {
  for (const text of ["ঘরোয়া পদ্ধতিতে তৈরি", "বাছাই করা মাষকলাইয়ের ডাল", "টাটকা চালকুমড়ো", "রোদে শুকানো", "ঐতিহ্যবাহী বাঙালি স্বাদ", "কুমড়ো বড়ির স্বাদ ও রান্নার ধারণা", "— পুষ্টিবিদ মুরাদ পারভেজ"]) {
    assert.ok(pageSource.includes(text), `missing: ${text}`);
  }
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_BANNER_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
    assert.ok(pageSource.includes(name), `missing image slot: ${name}`);
  }
});

test("bori order CTAs scroll to checkout", () => {
  assert.ok((pageSource.match(/href="#order" onClick=\{handleOrderClick\}/g) ?? []).length >= 3);
});
```

- [ ] **Step 2: Run the tests and confirm the new ones fail**

Run: `npx tsx --test client/src/pages/homemade-pumpkin-bori.test.ts`
Expected: the 3 Task 1 tests pass; the 6 new tests fail (page and route missing).

- [ ] **Step 3: Create `client/src/pages/homemade-pumpkin-bori.tsx`**

```tsx
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { TextHighlighter } from "@/components/ui/text-highlighter";
import { ShiningText } from "@/components/ui/shining-text";

import mangoLoverLogo from "@assets/mango-lover-logo.avif";
import { WhatsAppBrandIcon } from "@/features/kalojira-mixed/campaign-layout";
import { KALOJIRA_CAMPAIGN_PHONE_HREF } from "@/features/kalojira-mixed/content";
import { BORI_BANNER_IMAGE, BORI_CAMPAIGN_WHATSAPP_HREF, BORI_HERO_FALLBACK_IMAGE, BORI_PACK_1KG_IMAGE, BORI_PACK_500G_IMAGE, BORI_QUOTE_IMAGE, BORI_STRIP_IMAGE } from "@/features/kalojira-mixed/bori-content";
import { KalojiraCheckout } from "@/features/kalojira-mixed/kalojira-checkout";
import { MobileOrderBar } from "@/features/kalojira-mixed/mobile-order-bar";
import { resolveKalojiraCheckoutStatus } from "@/features/kalojira-mixed/checkout-state";
import { getKalojiraPackOptions } from "@/features/kalojira-mixed/order";
import { generatedStorefrontProducts } from "@/lib/generated-storefront-products";
import { STOREFRONT_POLL_INTERVAL_MS, fetchStorefrontProduct, fetchStorefrontProductInventory, findGeneratedStorefrontProduct, getProductGallery, mergeInventory } from "@/lib/storefront-products";
import "@/features/kalojira-mixed/campaign.css";

const BENEFIT_BADGE = "relative flex size-9 shrink-0 rotate-[-6deg] items-center justify-center rounded-[47%_53%_51%_49%] border-2 border-[#b98500] text-sm font-bold text-[#b98500] after:absolute after:inset-[-3px] after:rotate-[13deg] after:rounded-[53%_47%_49%_51%] after:border after:border-[#b98500]/60 after:content-['']";
const BADGE_NUMERALS = ["১", "২", "৩", "৪"];

const PACKS = [
  { size: "500G", price: "৳400", comparePrice: "৳650", image: BORI_PACK_500G_IMAGE, imageAlt: "৫০০ গ্রাম কুমড়ো বড়ির প্যাকেজ", borderClass: "border-black/15", benefits: ["ছোট পরিবারের জন্য উপযুক্ত", "প্রথমবার স্বাদ নিতে আদর্শ", "হাতে তৈরি ও রোদে শুকানো", "পরিচ্ছন্ন প্যাকেজিং"] },
  { size: "1KG", price: "৳700", comparePrice: "৳1,300", image: BORI_PACK_1KG_IMAGE, imageAlt: "১ কেজি কুমড়ো বড়ির প্যাকেজ", borderClass: "border-[#b98500]/45", benefits: ["বেশি পরিমাণে, বেশি সাশ্রয়ী", "মাসজুড়ে রান্নার জন্য", "মাষকলাই ডাল ও চালকুমড়োর বড়ি", "বড় পরিবার বা উপহারের জন্য পারফেক্ট"] },
];

export default function HomemadePumpkinBoriPage() {
  const slug = "homemade-pumpkin-bori";
  const generatedProduct = findGeneratedStorefrontProduct(generatedStorefrontProducts, slug);
  const productQuery = useQuery({ queryKey: ["merchant-suite-product", slug], queryFn: () => fetchStorefrontProduct(slug), initialData: generatedProduct ?? undefined, refetchInterval: STOREFRONT_POLL_INTERVAL_MS });
  const inventoryQuery = useQuery({ queryKey: ["merchant-suite-inventory", slug], queryFn: () => fetchStorefrontProductInventory(slug), refetchInterval: STOREFRONT_POLL_INTERVAL_MS });
  const [activeImage, setActiveImage] = useState(0);
  const [galleryRef, galleryApi] = useEmblaCarousel({ align: "start", loop: false });
  const product = mergeInventory(productQuery.data, inventoryQuery.data?.inventory);
  const gallery = product ? getProductGallery(product) : [];
  const displayGallery = gallery.length ? gallery : [BORI_HERO_FALLBACK_IMAGE];
  useEffect(() => {
    if (!galleryApi) return;
    const syncActiveImage = () => setActiveImage(galleryApi.selectedScrollSnap());
    galleryApi.on("select", syncActiveImage);
    return () => {
      galleryApi.off("select", syncActiveImage);
    };
  }, [galleryApi]);
  const status = resolveKalojiraCheckoutStatus({ hasProduct: Boolean(product), hasOrderablePacks: product ? getKalojiraPackOptions(product).length > 0 : false, productIsPending: productQuery.isPending, productIsError: productQuery.isError, inventoryIsError: inventoryQuery.isError, inventoryIsFetched: inventoryQuery.isFetched, hasInventory: Boolean(inventoryQuery.data?.inventory) });
  const scrollToOrder = useCallback(() => {
    const target = document.getElementById("order");
    const heading = document.getElementById("kalojira-checkout-heading");
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => heading?.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }, []);
  const handleOrderClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.className.includes("border-[#25d366]")) {
      event.preventDefault();
      window.open(BORI_CAMPAIGN_WHATSAPP_HREF, "_blank", "noopener,noreferrer");
      return;
    }
    event.preventDefault();
    scrollToOrder();
  }, [scrollToOrder]);

  if (productQuery.isPending) return <div className="flex min-h-screen items-center justify-center bg-white" aria-busy="true"><span className="sr-only">পণ্য লোড হচ্ছে…</span><span aria-hidden="true" className="size-8 animate-pulse rounded-full bg-[#eab308]/50" /></div>;
  if (!product) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center"><h1 className="text-2xl font-bold">পণ্যটি পাওয়া যায়নি</h1><Link href="/products" className="rounded-full bg-black px-5 py-3 text-sm text-white">সব পণ্য দেখুন</Link></div>;

  return <motion.div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-[#19382d]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}>
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur"><div className="relative mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:h-[76px] sm:px-6"><Link href="/step/homemade-pumpkin-bori" aria-label="ম্যাংগো লাভার কুমড়ো বড়ি পেজ" className="absolute left-1/2 flex -translate-x-1/2 items-center"><img src={mangoLoverLogo} alt="ম্যাংগো লাভার" className="h-8 w-auto sm:h-9" decoding="async" /></Link><a href={KALOJIRA_CAMPAIGN_PHONE_HREF} aria-label="ফোনে অর্ডার করুন" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[4px] border border-black/15 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-black hover:text-white"><Phone className="size-4" strokeWidth={2} aria-hidden="true" /><span className="hidden sm:inline">কল করুন</span></a><nav aria-label="যোগাযোগ" className="ml-auto flex items-center"><a href={BORI_CAMPAIGN_WHATSAPP_HREF} aria-label="WhatsApp-এ অর্ডার করুন" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[4px] border border-[#25d366]/50 bg-[#f4fff7] px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#168a45] transition-colors hover:bg-[#25d366] hover:text-white"><WhatsAppBrandIcon className="size-4" /><span className="hidden sm:inline">WhatsApp</span></a></nav></div></header>
    <main className="w-full max-w-full overflow-x-hidden">
      <section className="mx-auto grid max-w-6xl gap-8 px-0 pb-16 pt-0 md:grid-cols-2 md:items-center md:px-5 md:pt-16">
        <div className="order-2 px-5 text-center md:order-1 md:px-0 md:text-left">
          <p className="text-sm font-bold tracking-[0.2em] text-[#b98500]">ঐতিহ্যবাহী ঘরোয়া স্বাদ</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
            <span className="font-black">ঘরে তৈরি, রোদে শুকানো</span>
            <br />
            <button type="button" className="katimon-hero-button" onClick={scrollToOrder} aria-label="কুমড়ো বড়ি অর্ডার করুন">
              <span className="katimon-hero-button__shadow" aria-hidden="true" />
              <span className="katimon-hero-button__edge" aria-hidden="true" />
              <span className="katimon-hero-button__front"><ShiningText text="কুমড়ো বড়ি" className="font-extrabold" /></span>
            </button>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#19382d]/70">বাছাই করা মাষকলাইয়ের ডাল ও টাটকা চালকুমড়োয় হাতে তৈরি—মাছ, শাক আর তরকারিতে পরিচিত বাঙালি স্বাদ।</p>
          <div className="mt-8 flex flex-nowrap justify-center gap-2 md:justify-start"><a href="#order" onClick={handleOrderClick} className="inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[4px] bg-[#eab308] px-2 py-3 text-[14px] font-extrabold text-[#19382d] sm:px-5 sm:py-4 sm:text-base">এখনই অর্ডার করুন</a><a href="#order" onClick={handleOrderClick} className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[4px] border border-[#25d366]/50 bg-[#f4fff7] px-2 py-3 text-[14px] font-bold text-[#168a45] transition-colors hover:bg-[#25d366] hover:text-white sm:gap-2 sm:px-5 sm:py-4 sm:text-base"><WhatsAppBrandIcon className="size-5" />এখনই অর্ডার করুন</a></div>
        </div>
        <div className="order-1 bg-white p-[10px] shadow-sm md:order-2 md:rounded-[8px] md:p-4"><div className="relative mx-auto aspect-square w-full max-w-[1080px] overflow-hidden rounded-[8px] bg-white"><div ref={galleryRef} className="h-full cursor-grab overflow-hidden active:cursor-grabbing"><div className="flex h-full touch-pan-y">{displayGallery.map((url) => <div key={url} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"><img src={url} alt={product.name} draggable={false} className="absolute inset-0 h-full w-full select-none object-cover object-center" /></div>)}</div></div>{displayGallery.length > 1 && <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">{displayGallery.map((url, idx) => <button key={url} type="button" onClick={() => galleryApi?.scrollTo(idx)} aria-label={`কুমড়ো বড়ির ছবি ${idx + 1}`} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border-2 bg-white shadow-md transition-all ${activeImage === idx ? "border-black opacity-100" : "border-white/70 opacity-70 hover:opacity-100"}`}><img src={url} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover object-center" /></button>)}</div>}</div></div>
      </section>
      <section aria-labelledby="bori-packages" className="mx-auto max-w-6xl min-w-0 overflow-hidden px-3 pb-12 sm:px-5 md:overflow-visible md:pb-16">
        <div className="mb-5 px-2 text-center md:mb-7 md:px-0"><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b98500]">বিশেষ প্যাকেজ</p><h2 id="bori-packages" className="mt-2 text-xl font-bold leading-tight text-[#19382d] md:mt-3 md:text-3xl">আপনার পছন্দের প্যাক বেছে নিন</h2></div>
        <div className="grid gap-4 md:grid-cols-2">
          {PACKS.map((pack) => <article key={pack.size} className={`relative flex min-w-0 min-h-[360px] flex-col overflow-hidden rounded-[4px] border ${pack.borderClass} bg-white p-6 md:p-8`}><div className="min-w-0 pr-[44%]"><img src={pack.image} alt={pack.imageAlt} className="absolute right-1 top-16 h-64 w-[55%] object-contain md:right-6 md:top-8 md:h-64 md:w-[50%]" /><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">কুমড়ো বড়ি</p><h3 className="mt-3 text-3xl font-bold text-[#19382d]">{pack.size}</h3><div className="mt-2 flex items-baseline gap-3"><span className="rounded-[3px] bg-[#fff0a8] px-1 text-3xl font-extrabold text-[#b98500]">{pack.price}</span><span className="text-base font-semibold text-black/45 line-through decoration-[#b98500] decoration-2">{pack.comparePrice}</span></div><ul className="mt-6 min-w-0 space-y-2 text-sm leading-6 text-[#19382d]">{pack.benefits.map((benefit, idx) => <li key={benefit} className="flex min-w-0 items-center gap-3 py-1 font-medium"><span className={BENEFIT_BADGE} aria-hidden="true">{BADGE_NUMERALS[idx]}</span><span>{benefit}</span></li>)}</ul></div><div className="mt-auto pt-8"><a href="#order" onClick={handleOrderClick} className="inline-flex w-full items-center justify-center rounded-[4px] bg-[#eab308] px-5 py-3 text-sm font-bold text-[#19382d] transition-colors hover:bg-[#d59f00]">অর্ডার করুন</a></div></article>)}
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 pb-8 text-center"><div className="mx-auto max-w-3xl text-lg leading-[1.85] text-[#19382d]/75 md:text-xl"><p><TextHighlighter>ঘরোয়া পদ্ধতিতে তৈরি</TextHighlighter> কুমড়ো বড়ি—<TextHighlighter>বাছাই করা মাষকলাইয়ের ডাল</TextHighlighter> আর <TextHighlighter>টাটকা চালকুমড়ো</TextHighlighter> মিশিয়ে অভিজ্ঞ কারিগরদের হাতে বড়ি দেওয়া হয়, তারপর পরিষ্কার-পরিচ্ছন্নভাবে <TextHighlighter>রোদে শুকানো</TextHighlighter> হয়। মাছ, শাক কিংবা সবজির তরকারিতে যোগ করলেই ফিরে আসে <TextHighlighter>ঐতিহ্যবাহী বাঙালি স্বাদ</TextHighlighter>।</p></div><img src={BORI_STRIP_IMAGE} alt="ঐতিহ্য, গুণ ও স্বাদের কুমড়ো বড়ি" className="mx-auto mt-6 h-auto w-full max-w-xl rounded-[8px] object-contain" /><section aria-labelledby="bori-nutritionist-heading" className="-mx-[10px] mt-8 overflow-hidden rounded-[4px] border border-black/15 bg-white text-left md:mx-0"><div className="grid md:grid-cols-[0.82fr_1.18fr]"><div className="aspect-square min-h-0 bg-cover bg-center bg-no-repeat md:aspect-auto md:min-h-full" style={{ backgroundImage: `url(${BORI_QUOTE_IMAGE})` }} /><div className="relative bg-white px-6 py-8 text-[#19382d] sm:px-10 sm:py-10"><span aria-hidden="true" className="absolute right-6 top-0 font-serif text-[7rem] leading-none text-[#b98500]/20">“</span><p className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#b98500]">দায়িত্বশীল তথ্য</p><h2 id="bori-nutritionist-heading" className="relative mt-3 text-2xl font-bold leading-tight text-[#19382d] sm:text-3xl">কুমড়ো বড়ির স্বাদ ও রান্নার ধারণা</h2><blockquote className="relative mt-5 border-l-2 border-[#b98500] pl-4 text-base leading-8 text-black/65 sm:text-lg">কুমড়ো বড়ি অল্প তেলে হালকা ভেজে মাছ, শাক বা সবজির তরকারিতে দিন। রান্না শেষ হওয়ার ১৫–২০ মিনিট আগে ভাজা বড়ি যোগ করলে স্বাদ ও গঠন দুটোই ভালো থাকে। বায়ুরোধী পাত্রে, ঠান্ডা ও শুকনো জায়গায় সংরক্ষণ করুন।</blockquote><p className="relative mt-5 font-semibold text-[#b98500]">— পুষ্টিবিদ মুরাদ পারভেজ</p></div></div></section><img src={BORI_BANNER_IMAGE} alt="কুমড়ো বড়ি দিয়ে রান্না করা মাছের তরকারি" className="mx-auto mt-8 h-auto w-full max-w-xl rounded-[8px] object-contain md:mt-10" /></section>
      <section id="order" className="mx-auto max-w-4xl scroll-mt-24 px-[10px] pb-20 md:px-5 lg:max-w-6xl"><KalojiraCheckout product={product} status={status} productQuery={productQuery} inventoryQuery={inventoryQuery} deliveryCharge={100} onRetry={() => void Promise.all([productQuery.refetch(), inventoryQuery.refetch()])} /></section>
    </main>
    <footer className="relative overflow-hidden border-t border-black/10 bg-white text-black/70"><div className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat opacity-25 md:block" style={{ backgroundImage: "url('/footer-bg.webp')" }} /><div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 md:hidden" style={{ backgroundImage: "url('/footer-bg-mobile-v2.webp')" }} /><div className="absolute inset-0 bg-white/75" /><div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12"><div className="grid gap-7 md:grid-cols-[1.1fr_0.9fr_0.9fr]"><div><img src={mangoLoverLogo} alt="ম্যাংগো লাভার" className="h-9 w-auto" /><p className="mt-3 max-w-sm text-sm leading-6 text-black/60">প্রকৃতির স্বাদ, যত্নের সঙ্গে পৌঁছে দিই আপনার ঘরে।</p><div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45"><span className="tracking-normal">ক্যাশ অন ডেলিভারি</span><span>·</span><span className="tracking-normal">সারা বাংলাদেশে</span></div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b98500]">যোগাযোগ</p><div className="mt-3 flex flex-row gap-2"><a href={KALOJIRA_CAMPAIGN_PHONE_HREF} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-black/15 bg-white px-2 py-2 text-sm transition-colors hover:bg-black hover:text-white md:w-auto"><Phone className="size-4" />কল করুন</a><a href={BORI_CAMPAIGN_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-[#25d366]/50 bg-[#f4fff7] px-2 py-2 text-sm text-[#168a45] transition-colors hover:bg-[#25d366] hover:text-white md:w-auto"><WhatsAppBrandIcon className="size-4" />হোয়াটসঅ্যাপ করুন</a></div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b98500]">ম্যাংগো লাভার</p><p className="mt-3 text-sm leading-6 text-black/60">পুষ্টিবিদ মুরাদ পারভেজ পরিচালিত একটি ই-কমার্স প্ল্যাটফর্ম, যার লক্ষ্য প্রতিটি ঘরে ভেজালমুক্ত ও নিরাপদ খাবার পৌঁছে দেয়া।</p></div></div><div className="mt-7 flex flex-col items-center gap-3 border-t border-black/10 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-black/45 md:flex-row md:justify-center"><div><p>© ২০২৬ ম্যাংগো লাভার · <a href="https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=Nowhata%2C%20Paba%2C%20Rajshahi%2C%20Bangladesh%2C%206213&FORM=FBKPL1&mkt=en-GB" target="_blank" rel="noopener noreferrer" className="hover:text-black">নওহাটা, পবা, রাজশাহী, বাংলাদেশ, ৬২১৩</a></p><a href="https://api.whatsapp.com/send/?phone=8801733670129" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex normal-case text-[11px] tracking-[0.08em] underline decoration-[#FBBB14] decoration-2 underline-offset-4 hover:text-black">Designed &amp; Developed by &quot;Arc Labs Corporation&quot;</a></div><nav aria-label="নীতিমালা" className="flex flex-nowrap justify-center gap-x-3 whitespace-nowrap text-[9px] md:gap-x-4 md:text-[10px]"><Link href="/privacy-policy">• Privacy Policy</Link><Link href="/refund-and-return-policy">• Refund &amp; Return</Link><Link href="/terms-and-conditions">• Terms &amp; Conditions</Link></nav></div></div><div className="relative z-10 h-1 bg-[#FBBB14]" /></footer>
    <MobileOrderBar checkoutId="order" whatsappHref={BORI_CAMPAIGN_WHATSAPP_HREF} onOrderClick={() => scrollToOrder()} />
  </motion.div>;
}
```

Notes for the implementer:
- The header, hero, gallery, footer, and checkout markup are copied verbatim from `katimon-mango.tsx`; only copy, hrefs, ids, and image sources differ.
- The strip and banner images use `max-w-xl rounded-[8px]` because the placeholders are square photos. Katimon's wide-art bleed classes would make them oversized.
- The quote image uses `bg-cover aspect-square` on mobile because the placeholder is a square photo.

- [ ] **Step 4: Register the route and title in `client/src/App.tsx`**

After line 19 (`import KatimonMangoPage from "@/pages/katimon-mango";`) add:

```ts
import HomemadePumpkinBoriPage from "@/pages/homemade-pumpkin-bori";
```

After line 32 (`  "/step/katimon-mango": "কাটিমন আম | ম্যাংগো লাভার",`) add:

```ts
  "/step/homemade-pumpkin-bori": "কুমড়ো বড়ি | ম্যাংগো লাভার",
```

After the Katimon route block (lines 220-222) add:

```tsx
          <Route path="/step/homemade-pumpkin-bori">
            <PageTransition><HomemadePumpkinBoriPage /></PageTransition>
          </Route>
```

- [ ] **Step 5: Run tests and type-check**

Run: `npx tsx --test client/src/pages/homemade-pumpkin-bori.test.ts client/src/pages/katimon-mango.test.ts`
Expected: all pass (9 bori, 24 Katimon).

Run: `npm run check`
Expected: exits 0 with no errors.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/homemade-pumpkin-bori.tsx client/src/App.tsx client/src/pages/homemade-pumpkin-bori.test.ts
git commit -m "feat: add homemade pumpkin bori landing page"
```

---

### Task 3: Browser verification and build

**Files:** none committed. Scratch script lives in the session scratchpad.

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 2: Start the dev server**

Run (background): `npm run dev` (serves on `http://localhost:5003`).
Expected: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5003/step/homemade-pumpkin-bori` prints `200`.

- [ ] **Step 3: Measure overflow and capture screenshots at 430 px and 1440 px**

Start headless Chrome with DevTools: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9333 --user-data-dir=<scratch>/chrome-prof about:blank &`

Save as `<scratch>/cdp.mjs`:

```js
const [,, url, width, out] = process.argv;
const t = await (await fetch("http://127.0.0.1:9333/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Emulation.setDeviceMetricsOverride", { width: +width, height: 900, deviceScaleFactor: 1, mobile: +width < 768 });
await send("Page.enable"); await send("Page.navigate", { url });
await new Promise(r => setTimeout(r, 9000));
const r = await send("Runtime.evaluate", { expression: `JSON.stringify({ vw: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title, delivery: [...document.querySelectorAll('dt')].find(d => d.textContent === 'ডেলিভারি')?.nextElementSibling?.textContent })`, returnByValue: true });
console.log(r.result.result.value);
const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: +width, height: 6000, scale: 1 } });
(await import("node:fs")).writeFileSync(out, Buffer.from(s.result.data, "base64"));
process.exit(0);
```

Run: `node <scratch>/cdp.mjs http://localhost:5003/step/homemade-pumpkin-bori 430 <scratch>/bori-430.png` and again with `1440` / `bori-1440.png`.

Expected output at 430: `scrollWidth` is `430`, `title` is `কুমড়ো বড়ি | ম্যাংগো লাভার`, and `delivery` is `৳100`. At 1440, `scrollWidth` is `1440`.

- [ ] **Step 4: Visually inspect both screenshots**

Check that every section from the spec appears in order: header, hero with gallery, two pack cards with correct prices, story paragraph, strip image, quote card, banner image, checkout listing both ৫০০ গ্রাম and ১ কেজি packs, and footer.

- [ ] **Step 5: Stop the dev server and headless Chrome**
