# Mango Lover Brand Policy Pages Design

## Goal

Replace placeholder footer policy links with branded, bilingual information and policy pages for Mango Lover BD.

## Page set

The storefront will provide these routes:

- `/about-us`
- `/contact-us`
- `/how-to-order`
- `/shipping-policy`
- `/payment-policy`
- `/terms-and-conditions`
- `/privacy-policy`
- `/refund-return-exchange`
- `/cancellation-policy`
- `/faq`
- `/track-order`

## Content rules

- Every page presents English copy followed by Bengali translation within each section.
- Content is written for Mango Lover BD and does not copy the reference site.
- Confirmed operational facts:
  - Delivery charge is ৳100.
  - Orders over ৳2600 receive free delivery.
  - Inside Dhaka delivery takes 1–2 days.
  - Outside Dhaka delivery takes 2–3 days.
  - Cash on Delivery is the only payment method currently available.
  - Food returns are accepted only for damaged, spoiled, or incorrect items reported within 24 hours with unboxing photo/video proof.
  - Orders may be cancelled before dispatch by phone or WhatsApp; dispatched orders cannot be cancelled.
- Contact details:
  - Address: Nowhata, Paba, Rajshahi, Bangladesh – 6213
  - Phone: 01301-636461
  - WhatsApp: 01733-670129
  - Email: mangolover.com.bd@gmail.com

## Architecture

Create a typed content module containing page metadata, sections, FAQ entries, and link destinations. A shared `SiteInformationPage` component renders the same branded shell for every information page, keeping typography, translation treatment, contact callouts, and responsive spacing consistent. `App.tsx` maps the public routes to the shared page component, and `layout.tsx` replaces `#` footer anchors with route-aware links.

The Order Tracking page will explain that customers should contact Mango Lover with their order details for status updates, because no dedicated tracking API is currently exposed by the storefront.

## UX and accessibility

- Use one descriptive `<h1>` per page and semantic section headings.
- Keep English and Bengali translations visually associated but distinguishable.
- Use real internal links for related policies and real `tel:`, `https://wa.me/`, `mailto:`, and address links where appropriate.
- Preserve the existing footer visual language and responsive grid.

## Testing

- Test the content model contains all required routes and confirmed business facts.
- Test `App.tsx` registers all policy routes.
- Test the footer no longer contains placeholder `href="#"` links for the Information, Shop, or Support columns and includes the policy routes.
- Run focused tests and the production build.
