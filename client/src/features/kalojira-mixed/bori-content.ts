export const BORI_CAMPAIGN_WHATSAPP_MESSAGE = "হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই";
export const BORI_CAMPAIGN_WHATSAPP_HREF =
  `https://wa.me/8801301636461?text=${encodeURIComponent(BORI_CAMPAIGN_WHATSAPP_MESSAGE)}`;

// Placeholder art: the product's own photos. Replace each URL with custom art when it is ready.
const BORI_PHOTO_BASE = "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/db9134d3-4771-4f66-960c-7fac1fb782e1";
const JAR_PACKSHOT = `${BORI_PHOTO_BASE}/b1d7185b-da63-4879-851e-cbddc95d3712/960.webp`;

export const BORI_PACK_500G_IMAGE = JAR_PACKSHOT;
export const BORI_PACK_1KG_IMAGE = JAR_PACKSHOT;
export const BORI_STRIP_IMAGE = `${BORI_PHOTO_BASE}/b4533922-8c5a-407c-a59a-ecbd20bc9e42/960.webp`;
export const BORI_QUOTE_IMAGE = `${BORI_PHOTO_BASE}/2fae2279-3268-4b51-8f8b-7b449234fac5/960.webp`;
export const BORI_BANNER_IMAGE = `${BORI_PHOTO_BASE}/5d991461-aeea-4ff7-8051-addf23c8f77a/960.webp`;
export const BORI_HERO_FALLBACK_IMAGE = JAR_PACKSHOT;
