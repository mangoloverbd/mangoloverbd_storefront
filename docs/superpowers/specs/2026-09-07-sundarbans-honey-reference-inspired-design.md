# Sundarbans Honey Reference-Inspired Landing Page Design

**Date:** 2026-09-07  
**Status:** Approved for implementation pending written-spec review

## Goal

Rework `/step/sundarbans-natural-honey` into a modern, product-led Bangla landing page for cold Facebook and Instagram traffic. The page should use the clean, centered, long-form ecommerce rhythm of the supplied MindFuel reference while remaining an original Mango Lover design with its own brand, copy, assets, and functional checkout.

The page should make the product feel premium and trustworthy before asking for the order. The first screen does **not** show price. Price and delivery details appear in the pack-selection and checkout areas.

The existing `/product/sundarbans-natural-honey` page remains visually and behaviorally unchanged.

## Design principles

- Reference-inspired structure, not a pixel-for-pixel or copy clone.
- Natural premium palette: warm cream, honey amber, forest green, soft sage, and restrained dark brown.
- Centered hero and generous whitespace, with strong Bangla typography.
- Real product bottle remains the purchase anchor; the later supplied transparent asset replaces the temporary product image without changing layout.
- Use thin dividers, editorial section labels, controlled image blocks, and minimal rounded containers.
- Stronger, specific copy based on supplied product facts; no unsupported health claims.
- Make the next action obvious without making the page feel like a discount marketplace.
- Use real collection footage and founder-led content as trust proof when supplied.
- AI-generated images may provide atmosphere only. They must not represent harvesting proof, real packaging, credentials, or customer reviews.

## Page structure

The final page follows this order:

1. **Centered hero**
   - Mango Lover mark/wordmark.
   - Reserved rating/review slot. Until genuine approved rating/review data arrives, show a neutral placeholder or omit the rating row; never show invented stars or review counts.
   - Headline: `সুন্দরবনের চাকের মধু—প্রকৃতির আসল স্বাদ`.
   - Supporting copy: `মৌচাক থেকে বোতল পর্যন্ত—সুন্দরবনের বুনো ফুলের নেকটার থেকে সংগ্রহ করা মধু, যত্নে আপনার ঘরে।`
   - One yellow `বিস্তারিত জানুন` CTA that moves to the next proof/content section.
   - Large product image below the CTA. Use the live catalog product image until the transparent asset is supplied.
   - No price, delivery charge, discount, fake urgency, or unsupported guarantee in the hero.

2. **Trust ribbon**
   - Three compact statements separated by thin rules:
     - `সুন্দরবনের উৎস`
     - `পরিষ্কারভাবে বোতলজাত`
     - `হাতে পেয়ে মূল্য`
   - These are factual positioning statements, not certifications.

3. **Collection reel** *(new section added to the reference rhythm)*
   - Reserved, manually controlled video area for the supplied reel showing how honey is collected.
   - Poster frame and video are lazy-loaded below the hero.
   - No autoplay, fabricated footage, or generated collection imagery.
   - Supporting copy explains that customers can see the real collection process.

4. **Featured packs**
   - A clean two-card product/pack grid modeled on the reference's featured collection.
   - 500g at `৳800` is the highlighted starting choice.
   - 1kg at `৳1,600` is the family-size option.
   - Display the flat `৳100` nationwide delivery charge in this offer area, not in the hero.
   - Pack cards select the corresponding checkout option; they do not create a second price source.
   - Include a prominent `অর্ডার করুন` CTA below the cards.

5. **Why choose this honey**
   - Large central product composition with concise callouts around it, inspired by the reference's “why choose” section.
   - Callouts use strong, factual benefits:
     - `সুন্দরবনের বুনো ফুলের নেকটার`
     - `প্রাকৃতিক স্বাদ, ঘ্রাণ ও রং`
     - `প্রাকৃতিক মৌচাক থেকে সংগ্রহ`
     - `পরিষ্কারভাবে ছেঁকে বোতলজাত`
   - Do not present the product as medicine or imply guaranteed outcomes.

6. **Founder-led story**
   - Split section for the founder video or approved portrait and a short first-person brand message.
   - Explain why Mango Lover chose this source and what responsible handling means.
   - The section remains a clearly labeled media placeholder until the real founder asset is supplied.

7. **Everyday use / responsible information**
   - A short, visually lighter section covering spoon, bread, oats/yogurt/fruit, and lukewarm water.
   - Keep the infant warning and diabetes guidance visible and responsible.
   - Avoid weight-loss, performance, cure, or disease-prevention claims.

8. **FAQ**
   - Reference-style simple rows with progressive disclosure or compact answers.
   - Cover storage, natural crystallization, seasonal variation, child guidance, delivery, and COD.
   - Keep answers short and readable on mobile.

9. **Why Mango Lover / comparison**
   - A restrained comparison/trust block, not an attack on other brands.
   - Compare what Mango Lover makes clear: source information, collection media, clean handling, responsible guidance, nationwide delivery, and COD.

10. **Offer and embedded checkout**
    - Repeat the two pack choices, with 500g selected by default.
    - Show selected pack, quantity, subtotal, `৳100` delivery, and final total.
    - Preserve the existing searchable district/upazila fields, validation, inventory revalidation, duplicate-submit prevention, Google-only tracking, and thank-you flow.
    - The checkout remains the authoritative place for the complete order summary.

11. **Compact footer**
    - Mango Lover identity, phone, WhatsApp, and COD support links.

## Responsive behavior

- Mobile is the primary layout, not a compressed desktop page.
- The hero remains centered, with the product image below the CTA as in the reference.
- The trust ribbon stacks into three rows on narrow screens.
- Feature callouts collapse into a readable sequence around the product image.
- Collection and founder media preserve their aspect ratios and remain manually controlled.
- Existing safe-area-aware mobile order actions remain available without covering checkout fields.

## Assets and content slots

- Temporary product image: live Merchant-Suite catalog image.
- Future replacement: stakeholder-supplied transparent product asset with a versioned filename.
- Collection reel: stakeholder-supplied authentic footage and poster frame.
- Founder section: stakeholder-supplied founder video or approved portrait and copy.
- Rating/reviews: stakeholder-supplied genuine content with display approval. Until then, no stars, counts, testimonials, or review claims are rendered.
- AI-generated decorative art can be used only as atmosphere and must be recorded in `ATTRIBUTION.md`.

## Functional invariants

- Keep the campaign routes, `noindex`, Google-only campaign tracking, and Meta suppression unchanged.
- Keep all catalog and inventory reads in `storefront-products.ts`.
- Do not hardcode stock, product identity, or a second price source in components.
- Keep local Express and Vercel order forwarding behaviorally identical.
- Do not create a real order during implementation or QA without explicit approval.

## Success criteria

- The landing page visually follows the approved reference-inspired centered ecommerce structure.
- The hero has no price and uses stronger product-specific Bangla copy.
- The new collection reel section has a clear, authentic media slot and no autoplay.
- Pack prices and delivery are clear before checkout without appearing in the hero.
- The page is responsive, keyboard accessible, and preserves all existing checkout/tracking behavior.
- The real product asset can be swapped in later without another layout redesign.

→ verify: run campaign tests, the full required test commands, production build, and browser QA at mobile, tablet, and desktop widths after implementation.
