# New Product Detail Content Design

## Goal

Add concise, source-grounded `বিস্তারিত / বৈশিষ্ট্য` tab content to the seven products added on September 10, 2026, using the customer-provided DOCX files.

## In scope

Add curated detail records for these regular product-page slugs:

- `sugarcane-juice-powder` — আখের জুস পাউডার
- `amsotto-pickle` — আমসত্ত্বের আচার
- `lachcha-semai` — ঘিয়ে ভাজা লাচ্ছা সেমাই
- `litchi-flower-honey` — লিচু ফুলের মধু
- `mustard-oil` — সরিষার তেল
- `seed-nut-mix` — সীড এন্ড নাট মিক্স
- `seed-mixed` — সিড মিক্স

The separate campaign pages and the shared tab UI are out of scope.

## Content structure

Use the existing `ProductDetailSection` model and render the following tabs where supported by each source document:

1. বিবরণ
2. উপাদানসমূহ
3. সম্ভাব্য উপকারিতা or খাওয়ার উপকারিতা
4. খাওয়ার সময় ও নিয়ম or ব্যবহারের নিয়ম
5. কেন ম্যাংগো লাভারের?
6. সংরক্ষণের নিয়ম

Long explanations belong in `body` paragraphs. Scannable facts belong in `details` rows. The content should be summarized for web reading rather than copied as long unstructured document text.

## Writing rules

- Treat the seven DOCX files as the source of truth for ingredients, uses, benefits, and storage instructions.
- Correct obvious spelling, punctuation, spacing, and mixed-language artifacts.
- Phrase nutrition effects as possible support, never as guaranteed treatment or cure.
- Preserve practical safety guidance such as moderation, adequate water for fiber-rich products, and allergy awareness where relevant.
- Do not invent ingredients, certifications, medical claims, or unsupported preparation claims.
- Keep the existing Bengali brand voice and nutritionist framing used by earlier curated products.

## Implementation boundary

Modify `client/src/lib/product-details.ts` only for product content and `client/src/lib/product-details.test.ts` for regression coverage. Keep `getProductDetailSections()` fallback behavior, product-page layout, pricing, variants, checkout, analytics, and campaign feature files unchanged.

## Verification

- Add source-specific tests for all seven slugs and key phrases.
- Run the focused product detail and product-page tests.
- Run the production build and verify no generated catalog or unrelated files remain modified.
