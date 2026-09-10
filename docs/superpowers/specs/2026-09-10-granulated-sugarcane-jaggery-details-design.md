# Granulated Sugarcane Jaggery Product Details Design

## Goal

Add the detailed `বিস্তারিত` / `বৈশিষ্ট্য` tab content for `আখের দানাদার গুড় | Granulated Sugarcane Jaggery` using the storefront’s existing product-specific detail system.

## Product identity

- Slug: `granulated-sugarcane-jaggery`
- Product data, price, variants, images, availability, and checkout remain sourced from the existing catalog.
- This change only adds editorial detail content.

## Tab structure

Use the established Bengali tab pattern with six sections:

1. `বিবরণ` — what granulated sugarcane jaggery is, its granular texture, and common food uses.
2. `উপাদানসমূহ` — 100% sugarcane juice.
3. `খাওয়ার সম্ভাব্য উপকারিতা` — moderate, food-focused potential benefits without medical claims.
4. `খাওয়ার সময় ও নিয়ম` — morning, midday, afternoon, and general serving/use guidance.
5. `কেন ম্যাংগো লাভারের?` — sugarcane selection, granular usability, preparation, packaging, and nutritionist-led quality perspective.
6. `সংরক্ষণের নিয়ম` — cool, dry, clean, moisture-protected, airtight storage and Best Before guidance.

Each section uses longer explanatory Bengali paragraphs in `body` and scannable points in `details`, matching the existing `ProductDetailSection` contract.

## Content safety

Use the supplied copy while keeping claims qualified with language such as `হতে পারে` and `পরিমিত`. Present jaggery as a sweet food and sugar alternative for taste/use, not as a treatment or guaranteed health product.

## Files and verification

- Modify `client/src/lib/product-details.ts` with the new slug entry.
- Modify `client/src/lib/product-details.test.ts` with the new tab/content contract.
- Run focused product-detail tests, TypeScript checking, production build, and `git diff --check`.
