# Bengali Product Detail Numbering Design

## Goal

Replace the gold diamond markers in regular product-detail lists with Bengali numerals that remain aligned beside wrapped Bengali text.

## Design

The existing fixed two-column list layout stays in place. Each detail item will render a Bengali numeral (`১`, `২`, `৩`, and so on) in a fixed-width gold number column, followed by the detail text in the flexible column. Numbering restarts from `১` for each active tab. The number uses the same normal body font as the detail text, not the decorative heading font, and the text keeps the current typography, color, spacing, and wrapping behavior.

## Constraints

- Change only the marker presentation; do not change tab labels, content, layout, or interactions.
- Do not use circles, badges, Latin numerals, or decorative heading fonts for the numbers.
- Preserve the existing campaign pages and all checkout/product behavior.

## Verification

- Add a source-level regression test for Bengali numeral rendering and removal of the diamond marker.
- Run focused product-detail tests, the Recently Viewed regression test, production build, and `git diff --check`.
