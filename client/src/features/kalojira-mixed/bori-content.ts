export const BORI_CAMPAIGN_WHATSAPP_MESSAGE = "হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই";
export const BORI_CAMPAIGN_WHATSAPP_HREF =
  `https://wa.me/8801301636461?text=${encodeURIComponent(BORI_CAMPAIGN_WHATSAPP_MESSAGE)}`;

// Placeholder art: the product's own photos. Replace each URL with custom art when it is ready.
const BORI_PHOTO_BASE = "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/db9134d3-4771-4f66-960c-7fac1fb782e1";
const JAR_PACKSHOT = `${BORI_PHOTO_BASE}/b1d7185b-da63-4879-851e-cbddc95d3712/960.webp`;

export const BORI_PACK_500G_IMAGE = JAR_PACKSHOT;
export const BORI_PACK_2KG_IMAGE = "/bori-pack-2kg.webp";
export const BORI_STRIP_IMAGE = "/bori-curry.webp";
export const BORI_QUOTE_IMAGE = "/bori-nutritionist.webp";
export const BORI_HERO_FALLBACK_IMAGE = JAR_PACKSHOT;
// The ২ কেজি pack ships free; must match FREE_DELIVERY_VARIANT_IDS in Merchant-Suite.
// Checkout "Save ৳" badge per pack, keyed by variant id (১ কেজি, ২ কেজি).
export const BORI_PACK_SAVINGS: Readonly<Record<string, number>> = {
  "c5d6dba4-4a34-4980-9a55-e05b273ad673": 120,
  "d41d8476-8738-4aeb-aef8-4496f1ebd1dc": 240,
};
export const BORI_FREE_DELIVERY_VARIANT_IDS = ["d41d8476-8738-4aeb-aef8-4496f1ebd1dc"] as const;
