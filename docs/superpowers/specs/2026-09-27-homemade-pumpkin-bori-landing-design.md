# Homemade Pumpkin Bori Landing Page — Design

**Date:** 2026-09-27
**Route:** `/step/homemade-pumpkin-bori`
**Product slug:** `homemade-pumpkin-bori` (variants: ৫০০ গ্রাম ৳400, ১ কেজি ৳700)

## Goal

A campaign landing page for Homemade Pumpkin Bori with the same section structure and visual language as `/step/katimon-mango`, ordering through the shared Kalojira checkout.

## Approach

Copy the Katimon page into a standalone page file, following the existing pattern (every `/step/...` page is its own page file over the shared checkout). Katimon is not refactored or modified.

## Files touched

| File | Change |
|---|---|
| `client/src/pages/homemade-pumpkin-bori.tsx` | New page |
| `client/src/features/kalojira-mixed/bori-content.ts` | New: WhatsApp message/href and every image slot as a named constant |
| `client/src/App.tsx` | Route `/step/homemade-pumpkin-bori` and title `কুমড়ো বড়ি \| ম্যাংগো লাভার` |
| `client/src/features/kalojira-mixed/kalojira-checkout.tsx` | In-checkout WhatsApp href uses the bori message when `product.slug === "homemade-pumpkin-bori"` |
| `client/src/pages/homemade-pumpkin-bori.test.ts` | New source-level tests in the style of `katimon-mango.test.ts` |

## Content constants (`bori-content.ts`)

- `BORI_CAMPAIGN_WHATSAPP_MESSAGE = "হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই"`
- `BORI_CAMPAIGN_WHATSAPP_HREF` = `https://wa.me/8801301636461?text=` + `encodeURIComponent(message)` (same number as Katimon)
- Image slots. Placeholders use the product's existing Supabase product photos (960 px) until the merchant supplies custom art; replacing a photo is a one-line change here:
  - `BORI_PACK_500G_IMAGE`: jar packshot (primary photo)
  - `BORI_PACK_1KG_IMAGE`: jar packshot (primary photo)
  - `BORI_STRIP_IMAGE`: orange "ঐতিহ্য, গুণ ও স্বাদের নিখুঁত কম্বিনেশন" photo
  - `BORI_QUOTE_IMAGE`: bori-in-bowl photo
  - `BORI_BANNER_IMAGE`: fish curry in clay pot photo
  - `BORI_HERO_FALLBACK_IMAGE`: jar packshot (used only if the live gallery is empty)

## Sections (top to bottom)

1. **Header**: Call button, centered logo linking to `/step/homemade-pumpkin-bori`, WhatsApp button using the bori href.
2. **Hero**:
   - Eyebrow: `ঐতিহ্যবাহী ঘরোয়া স্বাদ`
   - H1: `ঘরে তৈরি, রোদে শুকানো`, then a line break and the existing `katimon-hero-button` pill with ShiningText `কুমড়ো বড়ি` (scrolls to checkout)
   - Subline: `বাছাই করা মাষকলাইয়ের ডাল ও টাটকা চালকুমড়োয় হাতে তৈরি—মাছ, শাক আর তরকারিতে পরিচিত বাঙালি স্বাদ।`
   - Two CTAs: gold `এখনই অর্ডার করুন` (scroll to checkout) and green WhatsApp `এখনই অর্ডার করুন` (opens bori WhatsApp)
   - Live product gallery (Embla carousel + thumbnails), same as Katimon
3. **Pack cards** (`বিশেষ প্যাকেজ` / `আপনার পছন্দের প্যাক বেছে নিন`):
   - **500g**: `৳400`, struck-through `৳650`. Benefits: ১ ছোট পরিবারের জন্য উপযুক্ত · ২ প্রথমবার স্বাদ নিতে আদর্শ · ৩ হাতে তৈরি ও রোদে শুকানো · ৪ পরিচ্ছন্ন প্যাকেজিং
   - **1KG**: `৳700`, struck-through `৳1,300`. Benefits: ১ বেশি পরিমাণে, বেশি সাশ্রয়ী · ২ মাসজুড়ে রান্নার জন্য · ৩ মাষকলাই ডাল ও চালকুমড়োর বড়ি · ৪ বড় পরিবার বা উপহারের জন্য পারফেক্ট
   - Each card has an `অর্ডার করুন` CTA that scrolls to checkout. Card prices are display-only; checkout charges the live variant price.
4. **Story paragraph** with `TextHighlighter`: `<ঘরোয়া পদ্ধতিতে তৈরি>` কুমড়ো বড়ি—`<বাছাই করা মাষকলাইয়ের ডাল>` আর `<টাটকা চালকুমড়ো>` মিশিয়ে অভিজ্ঞ কারিগরদের হাতে বড়ি দেওয়া হয়, তারপর পরিষ্কার-পরিচ্ছন্নভাবে `<রোদে শুকানো>` হয়। মাছ, শাক কিংবা সবজির তরকারিতে যোগ করলেই ফিরে আসে `<ঐতিহ্যবাহী বাঙালি স্বাদ>`।
5. **Full-width strip image**: `BORI_STRIP_IMAGE` (Katimon ripeness-strip slot).
6. **Quote card** (same layout as the Katimon nutritionist card):
   - Image: `BORI_QUOTE_IMAGE`
   - Eyebrow `দায়িত্বশীল তথ্য`, heading `কুমড়ো বড়ির স্বাদ ও রান্নার ধারণা`
   - Quote: `কুমড়ো বড়ি অল্প তেলে হালকা ভেজে মাছ, শাক বা সবজির তরকারিতে দিন। রান্না শেষ হওয়ার ১৫–২০ মিনিট আগে ভাজা বড়ি যোগ করলে স্বাদ ও গঠন দুটোই ভালো থাকে। বায়ুরোধী পাত্রে, ঠান্ডা ও শুকনো জায়গায় সংরক্ষণ করুন।`
   - Attribution: `— পুষ্টিবিদ মুরাদ পারভেজ`. The quote text needs his sign-off before launch.
7. **Bottom banner image**: `BORI_BANNER_IMAGE` (Katimon COD-banner slot).
8. **Checkout**: `<KalojiraCheckout ... deliveryCharge={100} />` in `#order`.
9. **Footer and `MobileOrderBar`**: same as Katimon, using the bori WhatsApp href.

## Behavior carried over unchanged

- Product and inventory load live from the Merchant-Suite public API with the generated snapshot as initial data, polling at `STOREFRONT_POLL_INTERVAL_MS`.
- Loading state, "পণ্যটি পাওয়া যায়নি" fallback, and checkout status via `resolveKalojiraCheckoutStatus`.
- Landing-page attribution is automatic: the shared checkout sends the current `/step/...` pathname as `landingPagePath`.

## Mobile overflow

The Katimon page shows horizontal clipping at 430 px width (hero WhatsApp button, pack cards, story paragraph, strip image). The bori page must not repeat this. The implementer finds the overflowing element(s) in the copied markup and fixes them in the bori page only. Katimon stays untouched.

## Out of scope

- A thank-you page (Katimon has none).
- Changes to Katimon, the shared checkout beyond the WhatsApp href line, or Merchant-Suite.
- Custom artwork (merchant will supply later via `bori-content.ts`).

## Success criteria and verification

1. The page renders at `/step/homemade-pumpkin-bori` with all sections above. Verify: dev server plus screenshots at 430 px and 1440 px.
2. No horizontal scroll at 430 px. Verify: `document.documentElement.scrollWidth <= 430` in a headless browser.
3. Both pack variants are selectable in checkout, and the total includes ৳100 delivery. Verify: in-browser check of the checkout summary.
4. All WhatsApp links on the page (header, hero, footer, mobile bar, checkout) carry the bori message. Verify: new tests.
5. The new test file and `katimon-mango.test.ts` pass under `npx tsx --test` (the repo has no `npm test` script; tests use `node:test`). `npm run check` (tsc) and `npm run build` pass.
