import type { StorefrontProduct } from "./storefront-products";

export type ProductDetailSection = {
  label: string;
  body?: string[];
  details?: string[];
};

// Product-wise detail content. Keyed by product slug so each product renders
// its own information on the Details section. Add new entries here as more
// products need curated detail copy; anything missing falls back to the
// product's description + variants.
export const productDetailSections: Record<string, ProductDetailSection[]> = {
  "black-seed-flower-honey": [
    {
      label: "বিবরণ",
      body: [
        "কালোজিরা ফুলের মধুরস থেকে মৌমাছির মাধ্যমে সংগৃহীত ১০০% প্রাকৃতিক মধু — কালোজিরা ফুলের নিজস্ব সুবাস ও স্বাদে স্বতন্ত্র।",
      ],
    },
    {
      label: "উপাদানসমূহ",
      body: [
        "এই মধুতে কোনো চিনি, কৃত্রিম রং বা প্রিজারভেটিভ মেশানো হয়নি — সম্পূর্ণ ১০০% প্রাকৃতিক কালোজিরা ফুলের মধু।",
      ],
      details: ["১০০% কালোজিরা ফুলের মধু"],
    },
    {
      label: "সম্ভাব্য উপকারিতা",
      body: [
        "নিয়মিত পরিমিত পরিমাণে খেলে মধুর প্রাকৃতিক উপাদান থেকে নিচের সম্ভাব্য উপকারিতাগুলো পাওয়া যেতে পারে:",
      ],
      details: [
        "শরীরের জন্য প্রাকৃতিক শক্তির উৎস",
        "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ",
        "চিনির বদলে প্রাকৃতিক মিষ্টি",
      ],
    },
    {
      label: "কেন ম্যাংগো লাভারের?",
      body: [
        "বিশ্বস্ত উৎস থেকে মানসম্মত মধু, সংগ্রহ থেকে প্যাকেজিং পর্যন্ত মান ও পরিচ্ছন্নতা বজায় রাখা হয়। প্রতিষ্ঠাতা পুষ্টিবিদ মুরাদ পারভেজ।",
      ],
    },
    {
      label: "সংরক্ষণের নিয়ম",
      details: [
        "ঠান্ডা, শুষ্ক ও সূর্যালোকমুক্ত স্থানে রাখুন",
        "ব্যবহারের পর ঢাকনা বন্ধ করুন, শুকনো চামচ ব্যবহার করুন",
        "দানা তৈরি হলে স্বাভাবিক — মধু নষ্ট হয়নি",
      ],
    },
  ],
  "sundarbans-natural-honey": [
    {
      label: "বিবরণ",
      body: [
        "সুন্দরবনের প্রাকৃতিক পরিবেশে মৌমাছির সংগ্রহ করা ফুলের মধু — বৈচিত্র্যময় বনজ উদ্ভিদ ও ফুলের নিজস্ব স্বাদ, ঘ্রাণ ও প্রাকৃতিক বৈশিষ্ট্যে স্বতন্ত্র।",
      ],
    },
    {
      label: "উপাদানসমূহ",
      body: [
        "এই মধুতে কোনো চিনি, কৃত্রিম রং বা প্রিজারভেটিভ মেশানো হয়নি — সম্পূর্ণ ১০০% প্রাকৃতিক মধু।",
      ],
      details: ["১০০% প্রাকৃতিক মধু"],
    },
    {
      label: "সম্ভাব্য উপকারিতা",
      body: [
        "নিয়মিত পরিমিত পরিমাণে খেলে মধুর প্রাকৃতিক উপাদান থেকে নিচের সম্ভাব্য উপকারিতাগুলো পাওয়া যেতে পারে:",
      ],
      details: [
        "শরীরে দ্রুত শক্তির প্রাকৃতিক উৎস",
        "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ",
        "চিনির বদলে প্রাকৃতিক মিষ্টি",
      ],
    },
    {
      label: "কেন ম্যাংগো লাভারের?",
      body: [
        "নির্ভরযোগ্য উৎস থেকে সংগ্রহ করা মধু, সংগ্রহ থেকে প্যাকেজিং পর্যন্ত মান ও পরিচ্ছন্নতা বজায় রাখা হয়। প্রতিষ্ঠাতা পুষ্টিবিদ মুরাদ পারভেজ।",
      ],
    },
    {
      label: "সংরক্ষণের নিয়ম",
      details: [
        "ঠান্ডা, শুষ্ক ও সূর্যালোকমুক্ত স্থানে রাখুন",
        "ব্যবহারের পর ঢাকনা বন্ধ করুন, শুকনো চামচ ব্যবহার করুন",
        "দানা তৈরি হলে স্বাভাবিক — মধু নষ্ট হয়নি",
      ],
    },
  ],
  "stepprs-massage-insoles": [
    {
      label: "Core Feature",
      details: ["Targeted Massage Nodes"],
    },
    {
      label: "Support & Comfort",
      details: ["Biomechanical Arch Support", "Thick Heel Cup & Cushioning"],
    },
    {
      label: "Fit & Material",
      details: ["Trimmable to Fit", "Breathable Vents"],
    },
  ],
};

export function getProductDetailSections(
  product: StorefrontProduct | null | undefined,
): ProductDetailSection[] {
  const slug = product?.slug;
  if (slug && productDetailSections[slug]) {
    return productDetailSections[slug];
  }

  // Fallback: build a minimal, still-useful detail set from the catalog data
  // so every product (not just curated ones) shows something meaningful.
  const sections: ProductDetailSection[] = [];
  if (product?.description) {
    sections.push({ label: "বিবরণ", body: [product.description] });
  }
  const variantLabels = (product?.variants ?? [])
    .map((v) => v.attributes?.size ?? Object.values(v.attributes ?? {})[0])
    .filter(Boolean);
  if (variantLabels.length) {
    sections.push({ label: "Options", details: variantLabels as string[] });
  }
  return sections;
}
