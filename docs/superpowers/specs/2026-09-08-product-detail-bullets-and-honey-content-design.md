# Product Detail Bullet Alignment and Honey Content Design

## Goal

Fix the misaligned detail-list markers on every regular product page and make the existing detail tabs for Sundarbans Natural Honey and Black Seed Flower Honey as informative as the other curated products.

## Scope

1. Replace the current flex-based round marker with a fixed-position diamond marker and a stable text column. Wrapped Bengali text must keep its marker aligned with the first line of the same item.
2. Keep the existing detail-tab renderer, typography, colors, spacing, labels, order, and interaction behavior.
3. Expand only the existing copy in the five current tabs for `sundarbans-natural-honey` and `black-seed-flower-honey`.
4. Leave pricing, variants, checkout, analytics, fallback behavior, `/step/kalojira-mixed`, and its feature directory unchanged.

## Content rules

- Use natural Bangla and correct spacing/OCR issues.
- Preserve the existing ingredient, serving, storage, and safety information.
- Use cautious “সম্ভাব্য” nutrition wording and avoid medical or disease-treatment claims.
- Do not add new tabs or rename existing tabs.

## Design

The list will use an inline grid with a fixed marker column and a flexible text column. The marker will be a small gold diamond, vertically aligned near the first text line, while the text remains centered within the content area. This prevents long wrapped entries from moving the marker to the far left or center of a multi-line block.

## Verification

- Add a source/content test for both honey slugs and a renderer source assertion for the fixed marker classes.
- Run focused Node tests, the Recently Viewed regression test, `NODE_ENV=production npm run build`, and `git diff --check`.
- Confirm the diff excludes campaign files and unrelated product-page behavior.
