# Sundarbans Honey Landing Page Design

**Date:** 2026-09-06
**Status:** Approved

## Goal

Create a focused, Bangla-first landing page for Sundarbans Natural Honey that converts mobile ad traffic into cash-on-delivery orders while remaining complete and polished on desktop. The campaign page tells an authentic source story, provides responsible product information, and ends in an embedded checkout.

The existing product page stays in place. Its layout, content flow, and purchase controls do not change as part of this work.

## Routes

- Landing page: `/step/sundarbans-natural-honey/`
- Thank-you page: `/step/sundarbans-natural-honey/thank-you`
- Existing product page: `/product/sundarbans-natural-honey`

The application must recognize the landing route both with and without its trailing slash. The current Vercel-wide `trailingSlash: false` behavior remains unchanged, so Vercel may normalize the browser URL to the slashless form. Campaign links that include the requested trailing slash must still resolve to the landing page.

Both new routes are for ads and direct links. They must set `noindex` and must not compete with the existing product page in search results. Add route-specific robots metadata and an `X-Robots-Tag: noindex` header for `/step/*` in production.

## Approved experience

### Audience and language

- Optimize the conversion flow for mobile Facebook and Instagram ad traffic.
- Provide an equally complete responsive desktop experience.
- Use polished Bangla-first copy with minimal English.
- Correct spelling and improve readability from the supplied PDF without changing its meaning.
- Avoid unsupported health claims. Present honey as food, not medicine.

### Visual direction

Use the approved `Documentary Story` direction:

- deep forest green, muted honey gold, dark brown, and cream;
- authentic Sundarbans and collection media;
- observational photography rather than staged advertising imagery;
- restrained typography and motion;
- strong visual progression from the forest to the customer's home.

Do not use autoplay video, parallax, decorative animation, fake scarcity, fabricated testimonials, invented credentials, or popups.

### Header

Use a campaign-specific minimal header with:

- Mango Lover logo;
- phone action for `01301636461`;
- WhatsApp action for `01301636461`.

Do not show the storefront's full navigation on the campaign route.

### Page flow

1. **Hero.** Sundarbans environmental imagery, a real product-bottle cutout, a strong Bangla headline, five concise trust points, and an `এখনই অর্ডার করুন` CTA. Do not show pricing in the hero.
2. **Collection video.** A short, compressed real-world collection video with a poster image and manual playback.
3. **Why this honey is special.** Explain the forest source, distinctive taste and aroma, natural sugar as a source of energy, naturally occurring antioxidant compounds, and easy everyday use.
4. **Who can consume it.** Present responsible guidance for children older than one year, students and working adults, physically active people, and older family members.
5. **Ways to enjoy it.** Show modest portions with a spoon, bread, oats or yogurt and fruit, and lukewarm water.
6. **Sundarbans to your home.** Tell the three-stage source story: forest and flowers, natural hive, then collection and clean bottling.
7. **Nutritionist statement.** Use Murad Parvez's real portrait, approved statement, and supplied qualifications.
8. **Why Mango Lover.** Present six concise trust points about source transparency, real collection media, clean handling, responsible guidance, nationwide delivery, and cash on delivery.
9. **Customer reviews.** Show three or four genuine supplied reviews. Do not ship an empty or fabricated review section.
10. **Important information.** Include the infant warning, diabetes guidance, storage instructions, natural seasonal variation, and crystallization guidance.
11. **Embedded checkout.** Show the only pricing on the page, followed by the order form and calculated summary.
12. **Footer.** Keep it compact and consistent with the campaign design.

Every `অর্ডার করুন` CTA on the landing page scrolls to and focuses the embedded checkout section.

### Mobile sticky actions

Show a safe-area-aware sticky action bar on mobile:

- one large `অর্ডার করুন` button that scrolls to checkout;
- one compact WhatsApp action;
- one compact phone action.

The bar must not cover form fields, validation messages, order totals, or the submit button. It may hide while the customer is actively using the checkout if that produces the clearest mobile experience.

## Product data and price update

The landing page must use the same authoritative catalog and inventory feeds as the existing product page. It must not hardcode a second stock or price source.

Update the authoritative Sundarbans Natural Honey product data to:

| Pack | Price |
|---|---:|
| 500g | ৳800 |
| 1kg | ৳1,600 |

Also update the product's base price to ৳800. Preserve the fixed Mango Lover workspace guard when making the data mutation. Refresh the build-generated product snapshot after the live source is correct. This makes the current product page, landing page, checkout totals, and future builds agree.

The existing product page may reflect the new price and generated data. No other visual or behavioral change is in scope for that page.

## Embedded checkout

### Fields

The checkout contains:

- full name;
- 11-digit Bangladeshi mobile number;
- street and local address;
- searchable district selector;
- searchable thana or upazila selector filtered by district;
- pack size;
- quantity;
- cash on delivery payment method.

Use a local, versioned Bangladesh district and upazila dataset. Do not make checkout depend on a third-party location API. Combine the local address, upazila or thana, and district into the order address forwarded to Merchant-Suite unless its existing API already has equivalent structured fields.

### Pricing and totals

- Delivery charge: flat ৳100 nationwide.
- Product subtotal: selected unit price multiplied by quantity.
- Total: product subtotal plus ৳100 delivery.
- Quantity minimum: 1.
- Payment method: cash on delivery only.

The page must display the selected pack, quantity, subtotal, delivery charge, and final total before submission.

### Order submission

Reuse the existing storefront order API and Merchant-Suite custom-order workflow. Before submission, verify that the selected product and variant remain available. Keep customer input intact after validation or network failures.

Prevent accidental double submission while an order request is pending. Server-side validation remains authoritative for quantity, phone, address, price-related request shape, and payment method.

## Thank-you page

After a successful order:

1. Save the order number and a non-sensitive order summary in session storage.
2. Navigate to `/step/sundarbans-natural-honey/thank-you`.
3. Show an inline confirmation with the order number, pack, quantity, total, and a notice that Mango Lover may call to confirm the order.
4. Fire the GA4 purchase event once per transaction.

Do not persist the customer's phone number, street address, district, upazila, or name for the thank-you display. A direct visit with no completed order shows a neutral message and a link back to the landing page, not a false success state. Refreshing the thank-you page must not fire another purchase event.

## Analytics

Reuse the storefront's existing Google Tag Manager container and GA4 integration. Do not install another GTM container or GA4 tag.

Track these interactions through the existing data layer and ecommerce conventions:

- campaign landing-page view;
- CTA click to checkout;
- WhatsApp click;
- phone click;
- pack selection;
- quantity change where useful without generating excessive event noise;
- `view_item`;
- `begin_checkout`;
- checkout validation or submission error;
- `purchase` with transaction ID, items, subtotal, shipping, and total.

The landing and thank-you pages must not emit Meta Pixel or Conversion API events. Suppress client-side Meta initialization and event calls for `/step/*`. Landing-page orders must carry an explicit Google-only tracking mode so both the local Express order handler and the Vercel order function skip server-side Meta Purchase CAPI. Existing Meta behavior outside `/step/*` remains unchanged.

## Media policy

Request assets as each section is implemented, with an exact filename, crop, and subject brief.

Required authentic assets:

- product bottle photograph with the real label;
- Sundarbans forest and river media;
- natural hive photograph;
- real honey collection photograph and short video;
- Murad Parvez's real portrait;
- three or four genuine customer reviews.

AI-generated lifestyle and serving illustrations are acceptable. Do not use generated media as proof of origin, collection practices, a real professional endorsement, or a customer review. Never ask an image model to recreate the bottle label. Preserve the real product image as a separate layer.

Store fixed campaign media in the storefront repository. Use versioned filenames for every replacement because Vercel serves image assets with immutable caching. Convert final stills to responsive WebP outputs and provide compressed MP4 or WebM video with a lightweight poster.

## Accessibility and performance

- Use semantic landmarks and headings in a logical order.
- Ensure interactive controls work with keyboard and touch.
- Give icon-only phone and WhatsApp actions accessible labels.
- Make searchable selectors keyboard navigable and announce validation errors clearly.
- Provide descriptive alt text for informative media and empty alt text for decorative media.
- Keep focus visible and color contrast readable over forest imagery.
- Respect reduced-motion preferences.
- Load hero content and the primary CTA before below-the-fold media.
- Lazy-load below-the-fold images and video.
- Do not autoplay video or download the full video before user intent.
- Reserve media dimensions to prevent layout shift.

## Error and edge states

- Product loading shows a compact skeleton without hiding the page purpose.
- Product or selected variant unavailable disables submission and explains the state in Bangla.
- Product API failure offers retry and phone or WhatsApp ordering.
- Invalid phone, incomplete address, missing district or upazila, and invalid quantity produce field-specific Bangla messages.
- Order API failure preserves all form input and provides retry, phone, and WhatsApp options.
- Missing required authentic media blocks that section from shipping. Do not substitute fake evidence.
- Missing genuine reviews blocks the review section from shipping. It does not block the rest of the page if stakeholders explicitly approve omitting that section for the initial release.

## Testing and verification

Automated tests must cover:

- both accepted landing URLs and the thank-you route;
- route-specific minimal layout;
- live product, variant, price, and inventory mapping;
- 500g at ৳800 and 1kg at ৳1,600 after the authoritative update;
- district search and district-dependent upazila options;
- quantity and total calculations with flat ৳100 delivery;
- required fields and Bangladeshi phone validation;
- order payload construction and duplicate-submit prevention;
- order success navigation and non-sensitive session state;
- direct thank-you visits and refresh behavior;
- one GA4 purchase event per transaction;
- GTM and GA4 campaign events;
- no client or server Meta events for landing-page orders;
- unchanged Meta behavior for existing non-campaign orders;
- `noindex` metadata and production header configuration;
- existing product-page regression coverage.

Browser QA must cover representative mobile, tablet, and desktop widths, including a small iPhone-sized viewport. Verify sticky controls, selector keyboard behavior, form errors, unavailable inventory, slow networks, successful checkout, thank-you refresh, phone links, WhatsApp links, console output, and analytics payloads.

Run the repository's type checks, relevant test suites, production build, and a final browser QA pass before shipping.

## Success criteria

- Ad visitors understand the product's source and primary value without leaving the page.
- A customer can select a pack and quantity, enter a complete Bangladesh address, review an accurate total, and place a cash-on-delivery order without a popup.
- Successful customers reach the dedicated thank-you page and see the correct order number.
- The landing and product pages use one live price and inventory source.
- The product page shows the updated prices without a layout change.
- GTM and GA4 receive accurate funnel and purchase events once.
- Meta receives no events from either campaign route or a landing-page order.
- The landing page is not indexed and does not compete with the product page.
- The page remains fast and usable on mobile connections.
