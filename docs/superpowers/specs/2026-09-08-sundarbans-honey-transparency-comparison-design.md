# Sundarbans Honey Transparency Comparison Design

## Goal

Transform the campaign’s “স্বচ্ছতার সঙ্গে / কেন ম্যাংগো লাভার? / পার্থক্যটা নিজেই দেখুন” section from an article-like point list into a modern comparison matrix inspired by the supplied reference image.

## Approved direction

Use a classic three-column comparison table:

1. **বিষয়** — the transparency or service topic.
2. **ম্যাংগো লাভার** — the supplied positive statement, emphasized with the campaign’s forest-green and honey-yellow palette and check indicators.
3. **যা যাচাই করবেন** — a neutral comparison column. It must not make factual claims about unnamed competitors or imply that other sellers lack these qualities.

The section keeps the existing heading hierarchy:

- Eyebrow: `স্বচ্ছতার সঙ্গে`
- Heading: `কেন ম্যাংগো লাভার?`
- Supporting line: `পার্থক্যটা নিজেই দেখুন`

The existing order CTA remains below the matrix and continues using the current live checkout handoff and `content_bottom` tracking placement.

## Content mapping

Render the six approved points as six matrix rows:

- উৎস সম্পর্কে স্বচ্ছ তথ্য
- সংগ্রহ প্রক্রিয়ার বর্ণনা
- পরিচ্ছন্ন সংগ্রহ ও বোতলজাত
- দায়িত্বশীল নির্দেশনা
- সারা দেশে হোম ডেলিভারি
- ক্যাশ অন ডেলিভারি

The full supplied descriptions remain visible in the Mango Lover cell. The neutral column uses short prompts such as “উৎসের তথ্য যাচাই করুন” or “সুবিধা বিক্রেতাভেদে ভিন্ন হতে পারে” only where needed for comparison context.

## Layout and visual behavior

- Keep the warm `#fffdf8` section background and existing section border.
- Use a rounded, bordered matrix container with no heavy shadow.
- Give the Mango Lover column a subtle pale-green background and strong forest-green header.
- Use honey-yellow check icons/markers for the brand column.
- Keep the first column readable as row labels and the neutral column visually quieter.
- On small screens, preserve all information without horizontal page overflow by converting each row into a compact stacked comparison block: topic first, then Mango Lover and neutral cells side by side.
- On medium and large screens, use a three-column table-like grid.
- Maintain accessible semantics with a `table`/table headers or equivalent explicit row/column labels, and keep the section heading referenced by `aria-labelledby`.

## Scope boundaries

- Do not add prices, stock, product arrays, new checkout behavior, reviews, certifications, or competitor names.
- Do not change the main storefront footer or other campaign sections.
- Do not alter the existing live content source; the matrix may present the existing `whyMangoLoverPoints` data.

## Verification

- Existing Sundarbans campaign source tests continue to pass.
- Add/update source-level assertions for the matrix structure, six points, CTA placement, and neutral comparison language.
- Check at 390px and 1200px for readable rows, correct responsive layout, no horizontal overflow, and no browser console errors.
- Run `npm run check`; report any pre-existing failures separately.
