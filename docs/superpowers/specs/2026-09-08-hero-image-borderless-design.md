# Borderless Hero Image Design

## Goal

Update the storefront homepage hero to use the supplied September 8 image and
present it without a visible background or border line.

## Scope

- Copy `ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp` into the storefront's
  public assets and reference it from `client/src/components/hero.tsx`.
- Remove the hero section's ivory/background treatment, image-frame background,
  border overlay, and bottom gradient overlay.
- Preserve the existing carousel controls, animation, responsive sizing, and
  all non-hero content.

## Acceptance criteria

- The first hero slide loads from a committed storefront asset.
- No background color or border line is rendered by the hero frame.
- Existing carousel behavior and controls remain intact.
- The project check and production build pass.
