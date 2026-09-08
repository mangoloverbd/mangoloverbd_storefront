# Curated Product Detail Content Design

## Goal

Expand the `বিস্তারিত / বৈশিষ্ট্য` tabs on the five regular product-detail pages using the customer-provided product documents and PDFs as the source of truth.

## In scope

The shared regular product route will receive curated content for these slugs:

- `beetroot-powder` — Beetroot Powder PDF
- `kalojira-mixed` — Kalojira Mixed PDF
- `honey-nut` — Honey Nut DOCX
- `chia-seed` — Chia Seed DOCX
- `pure-ghee` — Ghee DOCX

The separate `/step/kalojira-mixed` campaign landing page is out of scope and remains unchanged.

## Content structure

Each curated product will expose detailed tabs through the existing `ProductDetailSection` model. The tab set will be tailored to the source material but follow this common information order where applicable:

1. বিবরণ
2. উপাদানসমূহ or পুষ্টি উপাদান
3. সম্ভাব্য উপকারিতা
4. কারা খাদ্যতালিকায় রাখতে পারেন
5. খাওয়ার সময় ও নিয়ম
6. কেন ম্যাংগো লাভারের?
7. সংরক্ষণের নিয়ম
8. গুরুত্বপূর্ণ সতর্কতা

Long explanations use `body` paragraphs. Scannable facts use `details` bullet rows so the current tab UI can display both without layout changes.

## Writing rules

- Preserve the source documents' product facts, ingredients, serving guidance, and storage instructions.
- Use natural Bangla suitable for a product page, correcting obvious OCR or spacing artifacts from the PDFs.
- Phrase nutrition effects as possible support, not guaranteed treatment or cure.
- Keep explicit safety notes from the source material, including beetroot-specific cautions.
- Do not add ingredients, dosage claims, medical claims, certifications, or sourcing claims that are not supported by the provided material or the existing reference honey copy.
- Keep pricing, variants, checkout, analytics, and product-page layout unchanged.

## Implementation boundary

Add the five slug entries to `client/src/lib/product-details.ts`. Keep `getProductDetailSections()` and its fallback behavior unchanged. Do not modify the campaign feature files under `client/src/features/kalojira-mixed/` or the `/step/kalojira-mixed` page.

## Verification

- Add tests that confirm all five slugs resolve to curated sections with detailed content.
- Confirm the separate campaign page is not changed.
- Run the focused source/content tests and the production build.
