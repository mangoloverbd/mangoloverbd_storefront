import assert from "node:assert/strict";
import { test } from "node:test";

import { getProductDetailSections } from "./product-details.ts";

test("curates detailed source content for all five regular products", () => {
  const cases = [
    {
      slug: "beetroot-powder",
      labels: [
        "বিবরণ",
        "পুষ্টি উপাদান",
        "সম্ভাব্য উপকারিতা",
        "কারা খাদ্যতালিকায় রাখতে পারেন",
        "খাওয়ার সময় ও নিয়ম",
        "গুরুত্বপূর্ণ সতর্কতা",
        "সংরক্ষণের নিয়ম",
      ],
      expected: ["ডায়েটারি নাইট্রেট", "বীটালেইন", "নিম্ন রক্তচাপ"],
      minimumCharacters: 2400,
    },
    {
      slug: "kalojira-mixed",
      labels: [
        "বিবরণ",
        "উপাদানসমূহ",
        "পুষ্টির বৈচিত্র্য",
        "কেন খাদ্যতালিকায় রাখবেন",
        "খাওয়ার সময় ও নিয়ম",
        "পুষ্টিবিদের দৃষ্টিভঙ্গি",
        "সংরক্ষণ ও সতর্কতা",
      ],
      expected: ["কালোজিরা", "রসুন", "ইরানি জাফরান"],
      minimumCharacters: 2450,
    },
    {
      slug: "honey-nut",
      labels: ["বিবরণ", "উপাদানসমূহ", "সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
      expected: ["কাজু বাদাম", "কাঠবাদাম", "মধু"],
      minimumCharacters: 2150,
    },
    {
      slug: "chia-seed",
      labels: ["বিবরণ", "উপাদানসমূহ", "সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "দৈনন্দিন খাদ্যতালিকায় ব্যবহার", "সংরক্ষণের নিয়ম"],
      expected: ["ফাইবার", "উদ্ভিজ্জ প্রোটিন", "ওমেগা-৩"],
      minimumCharacters: 2250,
    },
    {
      slug: "pure-ghee",
      labels: ["বিবরণ", "উপাদানসমূহ", "সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
      expected: ["দুধ", "মসৃণ টেক্সচার", "রান্না"],
      minimumCharacters: 1900,
    },
  ];

  for (const { slug, labels, expected, minimumCharacters } of cases) {
    const sections = getProductDetailSections({ slug, name: slug });
    const copy = JSON.stringify(sections);
    assert.deepEqual(sections.map((section) => section.label), labels, `${slug} tab contract changed`);
    assert.ok(copy.length >= minimumCharacters, `${slug} copy should be more detailed`);
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
