import type { ShapeColor, ShapeName } from "./shapes";

// Design copy for the খেজুরের গুড় landing. Names, prices, variants and stock come from the live catalog.
export const KHEJUR_PAGE_PATH = "/step/khejurer-gur";
export const KHEJUR_THANK_YOU_PATH = "/step/khejurer-gur/thank-you";
export const KHEJUR_ASSET = (file: string) => `/khejurer-gur/${file}`;

export const KHEJUR_PHONE_NUMBER = "০১৩০১-৬৩৬৪৬১";
export const KHEJUR_PHONE_HREF = "tel:+8801301636461";
export const KHEJUR_WHATSAPP_HREF = "https://wa.me/8801301636461";

export type KhejurProductDesign = {
  slug: string;
  short: string;
  image: string;
  sunImage: string;
  accent: string;
  shape: ShapeName;
  shapeColor: ShapeColor;
  line: string;
  uses: readonly string[];
};

export const KHEJUR_PRODUCTS: readonly KhejurProductDesign[] = [
  { slug: "date-palm-jhola-gur", short: "ঝোলা গুড়", image: "cut-jhola.webp", sunImage: "sun-jhola.webp", accent: "#c2451d", shape: "scallop", shapeColor: "yellow", line: "ঘন সোনালি রং, মিষ্টি সুবাস — চামচ থেকে ধীরে গড়িয়ে পড়ে।", uses: ["পিঠা", "পুলি", "পায়েস"] },
  { slug: "date-palm-bij-gur", short: "বীজ গুড়", image: "cut-bij.webp", sunImage: "sun-bij.webp", accent: "#a8700a", shape: "flower", shapeColor: "lilac", line: "দানাদার গঠন, সমৃদ্ধ ঘ্রাণ — সরাসরি খান বা পিঠা-পায়েসে।", uses: ["সরাসরি", "পিঠা", "পায়েস"] },
  { slug: "date-palm-patali-gur", short: "পাটালি গুড়", image: "cut-patali.webp", sunImage: "sun-patali.webp", accent: "#a33a1c", shape: "burst", shapeColor: "green", line: "জমাট পাটালি, প্রাকৃতিক মিষ্টতা আর মনোমুগ্ধকর ঘ্রাণ।", uses: ["ভেঙে খান", "পিঠা", "পায়েস"] },
];

export const KHEJUR_SLUGS = KHEJUR_PRODUCTS.map(({ slug }) => slug);

export const ROAD_STOPS = [
  { time: "ভোর ৪টা", title: "রস নামানো", body: "কুয়াশা কাটার আগেই গাছি রসের হাঁড়ি নামিয়ে আনেন।", image: "road-tap.webp", kind: "tap", r1: "-6deg", r2: "0deg" },
  { time: "সকাল ৭টা", title: "জ্বাল দেওয়া", body: "কাঠের আগুনে রস ফোটে। জ্বাল যত, গুড় তত ঘন।", image: "road-boil-hearth.webp", kind: "boil", r1: "16deg", r2: "3deg" },
  { time: "দুপুর ১২টা", title: "তিন রূপে গুড়", body: "কম জ্বালে ঝোলা, আরেকটু জ্বালে বীজ, বেশি জ্বালে পাটালি।", image: "trio.webp", kind: "trio", r1: "-10deg", r2: "-2deg" },
] as const;

// [shape, colour, left %, top %, size px, motion class, parallax factor]
export type DecoSpec = readonly [ShapeName, ShapeColor, number, number, number, string, number];
export const DECO: Record<"hero" | "products" | "road", readonly DecoSpec[]> = {
  hero: [["flower", "lilac", 4, 30, 54, "spin", 0.15], ["burst", "coral", 82, 24, 44, "spin r", -0.2], ["star", "blue", 88, 62, 30, "twk", 0.1], ["clover", "green", 2, 62, 38, "bob", -0.1]],
  products: [["sparkle", "yellow", 86, 4, 46, "twk", 0.2], ["wave", "coral", 2, 40, 30, "wig", -0.15], ["scallop", "blue", 88, 70, 40, "spin", 0.1]],
  road: [["burst", "yellow", 2, 6, 40, "spin", 0.2], ["clover", "lilac", 86, 30, 46, "bob", -0.12], ["sparkle", "coral", 4, 58, 34, "twk", 0.15], ["flower", "green", 88, 82, 44, "spin r", -0.1]],
};

export const RIBBON_TEXT = "খাঁটি খেজুরের গুড়  ✦  ঝোলা · বীজ · পাটালি  ✦  ক্যাশ অন ডেলিভারি  ✦  সারা দেশে ডেলিভারি ৳১০০  ✦  ";

export const DELIVERY_POLICY = [
  "পেমেন্ট শুধু ক্যাশ অন ডেলিভারি।",
  "ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৩ দিনে ডেলিভারি।",
  "পণ্যে সমস্যা হলে ডেলিভারির ২৪ ঘণ্টার মধ্যে জানান।",
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBanglaDigits = (value: number | string) => String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
export const formatTaka = (value: number) => `৳${toBanglaDigits(value)}`;

const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
// Delivery window shown in the memo: 1–3 days from today.
export function deliveryWindowLabel(now = new Date()) {
  const day = (k: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + k);
    return d;
  };
  const a = day(1);
  const b = day(3);
  return a.getMonth() === b.getMonth()
    ? `${toBanglaDigits(a.getDate())}–${toBanglaDigits(b.getDate())} ${BN_MONTHS[b.getMonth()]}`
    : `${toBanglaDigits(a.getDate())} ${BN_MONTHS[a.getMonth()]} – ${toBanglaDigits(b.getDate())} ${BN_MONTHS[b.getMonth()]}`;
}
