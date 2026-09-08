import assert from "node:assert/strict";
import { test } from "node:test";

import { getProductDetailSections } from "./product-details.ts";

test("curates detailed source content for all five regular products", () => {
  const cases = [
    { slug: "beetroot-powder", expected: ["ডায়েটারি নাইট্রেট", "বীটালেইন", "নিম্ন রক্তচাপ"] },
    { slug: "kalojira-mixed", expected: ["কালোজিরা", "রসুন", "ইরানি জাফরান"] },
    { slug: "honey-nut", expected: ["কাজু বাদাম", "কাঠবাদাম", "মধু"] },
    { slug: "chia-seed", expected: ["ফাইবার", "উদ্ভিজ্জ প্রোটিন", "ওমেগা-৩"] },
    { slug: "pure-ghee", expected: ["দুধ", "মসৃণ টেক্সচার", "রান্না"] },
  ];

  for (const { slug, expected } of cases) {
    const sections = getProductDetailSections({ slug, name: slug });
    const copy = JSON.stringify(sections);
    assert.ok(sections.length >= 6, `${slug} should have detailed tabs`);
    for (const phrase of expected) assert.match(copy, new RegExp(phrase));
    for (const section of sections) {
      assert.ok(section.label);
      assert.ok((section.body?.length ?? 0) + (section.details?.length ?? 0) > 0);
    }
  }
});

test("keeps the existing fallback for an uncurated product", () => {
  const sections = getProductDetailSections({
    slug: "unlisted-product",
    name: "Unlisted",
    description: "Catalog description",
    variants: [{ attributes: { size: "500g" } }],
  });

  assert.deepEqual(sections[0], { label: "বিবরণ", body: ["Catalog description"] });
  assert.deepEqual(sections[1], { label: "Options", details: ["500g"] });
});
