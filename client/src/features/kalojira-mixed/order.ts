import type { StorefrontOrderOffer, StorefrontProduct } from "../../lib/storefront-products.ts";
import { isProductOrderable } from "../../lib/storefront-product-orderability.ts";
import { normalizeBdMobile } from "../../../../shared/bd-phone";
import { ADDRESS_MIN_WORDS, addressWordCount } from "../../../../shared/checkout-address";
import { MAX_LINE_QUANTITY } from "../../../../shared/order-limits";

export const KALOJIRA_DELIVERY_CHARGE = 0;
export const KALOJIRA_CONFIRMATION_KEY = "kalojira-mixed-order-confirmation-v1";

const MAX_PRICE = 10_000_000;
const MAX_QUANTITY = MAX_LINE_QUANTITY;

type KalojiraConfirmationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type KalojiraPackOption = {
  variantId: string;
  label: string;
  unitPrice: number;
};

export type KalojiraOrderTotals = {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  deliveryCharge: number;
  addOnPrice: number;
  total: number;
};

// A checkout add-on (e.g. mustard oil with bori), always one unit.
export type KalojiraAddOn = {
  offerId: string;
  productId: string;
  variantId: string;
  name: string;
  label: string;
  price: number;
  regularPrice: number;
  imageUrl: string | null;
};

export type KalojiraConfirmationAddOn = {
  name: string;
  label: string;
  price: number;
};

export type KalojiraOrderPayload = {
  bundleTitle: string;
  bundleDetails: string;
  bundlePrice: number;
  quantity: number;
  deliveryCharge: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: "cash_on_delivery";
};

export type KalojiraOrderConfirmation = {
  orderRef: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  addOn?: KalojiraConfirmationAddOn;
};

function isPositiveSafeInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value > 0
    && value <= max;
}

function requiredTrimmedString(value: unknown, maxLength: number, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} is required`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new Error(`${field} is invalid`);
  }
  return trimmed;
}

export function getKalojiraPackOptions(product: StorefrontProduct): KalojiraPackOption[] {
  if (!isProductOrderable(product)) return [];

  return (product.variants ?? []).flatMap((variant) => {
    if (variant.available === false) return [];
    if (typeof variant.stock_quantity === "number" && variant.stock_quantity <= 0) return [];
    if (variant.id === undefined || variant.id === null) return [];

    const variantId = String(variant.id).trim();
    const size = variant.attributes?.size ?? variant.attributes?.kg;
    const label = typeof size === "string" || typeof size === "number"
      ? String(size).trim()
      : "";
    const unitPrice = typeof variant.price === "number" || typeof variant.price === "string"
      ? Number(variant.price)
      : Number.NaN;

    if (!variantId || !label || !isPositiveSafeInteger(unitPrice, MAX_PRICE)) return [];
    return [{ variantId, label, unitPrice }];
  });
}

// The Suite's offer for this product, when it can be sold right now. The
// Suite decides the price; this only checks the data is usable for display.
export function getKalojiraAddOn(
  offers: readonly StorefrontOrderOffer[] | undefined,
  product: Pick<StorefrontProduct, "id"> | null | undefined,
): KalojiraAddOn | null {
  if (!offers?.length || product?.id === undefined || product.id === null) return null;
  const offer = offers.find((candidate) => candidate?.triggerProductId === String(product.id));
  if (!offer || offer.available !== true) return null;
  if (!isPositiveSafeInteger(offer.offerPrice, MAX_PRICE)
    || !isPositiveSafeInteger(offer.regularPrice, MAX_PRICE)
    || offer.offerPrice >= offer.regularPrice) return null;
  const name = String(offer.productName ?? "").split("|")[0].trim();
  const label = String(offer.variantLabel ?? "").trim();
  const productId = String(offer.productId ?? "").trim();
  const variantId = String(offer.variantId ?? "").trim();
  if (!name || !label || !productId || !variantId) return null;
  return {
    offerId: offer.id,
    productId,
    variantId,
    name,
    label,
    price: offer.offerPrice,
    regularPrice: offer.regularPrice,
    imageUrl: typeof offer.imageUrl === "string" && offer.imageUrl ? offer.imageUrl : null,
  };
}

export function buildKalojiraOrderItems(
  productId: string,
  pack: KalojiraPackOption,
  quantity: number,
  addOn: KalojiraAddOn | null | undefined,
) {
  const items = [{ productId, variantId: pack.variantId, quantity }];
  if (addOn) items.push({ productId: addOn.productId, variantId: addOn.variantId, quantity: 1 });
  return items;
}

export function calculateKalojiraOrder(unitPrice: number, quantity: number, deliveryCharge = KALOJIRA_DELIVERY_CHARGE, addOnPrice = 0): KalojiraOrderTotals {
  if (!isPositiveSafeInteger(unitPrice, MAX_PRICE)) {
    throw new Error("Unit price is invalid");
  }
  if (!isPositiveSafeInteger(quantity, MAX_QUANTITY)) {
    throw new Error("Quantity is invalid");
  }

  if (!Number.isSafeInteger(addOnPrice) || addOnPrice < 0 || addOnPrice > MAX_PRICE) {
    throw new Error("Add-on price is invalid");
  }

  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryCharge + addOnPrice;
  if (!Number.isSafeInteger(subtotal) || subtotal > MAX_PRICE || !Number.isSafeInteger(total)) {
    throw new Error("Order total is invalid");
  }

  return {
    unitPrice,
    quantity,
    subtotal,
    deliveryCharge,
    addOnPrice,
    total,
  };
}

export function buildKalojiraAddress(streetAddress: string, district = "", upazila = "") {
  const street = requiredTrimmedString(streetAddress, 300, "Street address");
  const parts = [street];
  const normalizedUpazila = upazila.trim();
  const normalizedDistrict = district.trim();
  if (normalizedUpazila) {
    if (normalizedUpazila.length > 100) throw new Error("Upazila is invalid");
    parts.push(normalizedUpazila);
  }
  if (normalizedDistrict) {
    if (normalizedDistrict.length > 100) throw new Error("District is invalid");
    parts.push(normalizedDistrict);
  }
  const address = parts.join(", ");
  if (address.length > 500) throw new Error("Address is invalid");
  return address;
}

export function buildKalojiraOrderPayload(input: {
  productName: string;
  pack: KalojiraPackOption;
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  deliveryCharge?: number;
  addOn?: KalojiraAddOn | null;
}): KalojiraOrderPayload {
  const totals = calculateKalojiraOrder(input.pack.unitPrice, input.quantity, input.deliveryCharge);
  const customerName = requiredTrimmedString(input.customerName, 120, "Customer name");
  const phone = normalizeBdMobile(input.phone);
  const address = requiredTrimmedString(input.address, 500, "Address");
  if (customerName.length < 2
    || !phone
    || address.length < 5
    || addressWordCount(address) < ADDRESS_MIN_WORDS) {
    throw new Error("Customer details are invalid");
  }

  return {
    bundleTitle: requiredTrimmedString(input.productName, 200, "Product name"),
    bundleDetails: requiredTrimmedString(
      input.addOn ? `${input.pack.label} + ${input.addOn.name} ${input.addOn.label}` : input.pack.label,
      300,
      "Pack label",
    ),
    bundlePrice: totals.subtotal,
    quantity: totals.quantity,
    deliveryCharge: totals.deliveryCharge,
    customerName,
    phone,
    address,
    paymentMethod: "cash_on_delivery",
  };
}

export function buildKalojiraOrderConfirmation(
  orderRef: string,
  payload: KalojiraOrderPayload,
  addOn?: KalojiraAddOn | null,
): KalojiraOrderConfirmation {
  const { addOnPrice: _addOnPrice, ...totals } = calculateKalojiraOrder(
    payload.bundlePrice / payload.quantity,
    payload.quantity,
    payload.deliveryCharge,
    addOn?.price ?? 0,
  );
  const packLabel = addOn ? payload.bundleDetails.split(" + ")[0] : payload.bundleDetails;
  return {
    orderRef: requiredTrimmedString(orderRef, 128, "Order reference"),
    productName: requiredTrimmedString(payload.bundleTitle, 200, "Product name"),
    variantLabel: requiredTrimmedString(packLabel, 300, "Pack label"),
    ...totals,
    customerName: requiredTrimmedString(payload.customerName, 120, "Customer name"),
    phone: requiredTrimmedString(payload.phone, 11, "Phone"),
    address: requiredTrimmedString(payload.address, 500, "Address"),
    ...(addOn ? { addOn: { name: addOn.name, label: addOn.label, price: addOn.price } } : {}),
  };
}

function parseConfirmationAddOn(value: unknown): KalojiraConfirmationAddOn | null | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") return null;
  const addOn = value as Record<string, unknown>;
  try {
    const name = requiredTrimmedString(addOn.name, 200, "Add-on name");
    const label = requiredTrimmedString(addOn.label, 100, "Add-on label");
    if (!isPositiveSafeInteger(addOn.price, MAX_PRICE)) return null;
    return { name, label, price: addOn.price };
  } catch {
    return null;
  }
}

function parseKalojiraOrderConfirmation(value: unknown): KalojiraOrderConfirmation | null {
  if (!value || typeof value !== "object") return null;
  const confirmation = value as Record<string, unknown>;

  try {
    const orderRef = requiredTrimmedString(confirmation.orderRef, 128, "Order reference");
    const productName = requiredTrimmedString(confirmation.productName, 200, "Product name");
    const variantLabel = requiredTrimmedString(confirmation.variantLabel, 300, "Pack label");
    const quantity = confirmation.quantity;
    const unitPrice = confirmation.unitPrice;
    const subtotal = confirmation.subtotal;
    const deliveryCharge = confirmation.deliveryCharge;
    const total = confirmation.total;
    const customerName = requiredTrimmedString(confirmation.customerName, 120, "Customer name");
    const phone = requiredTrimmedString(confirmation.phone, 11, "Phone");
    const address = requiredTrimmedString(confirmation.address, 500, "Address");
    const addOn = parseConfirmationAddOn(confirmation.addOn);
    if (addOn === null) return null;

    if (!isPositiveSafeInteger(quantity, MAX_QUANTITY)
      || !isPositiveSafeInteger(unitPrice, MAX_PRICE)
      || !Number.isSafeInteger(subtotal) || (subtotal as number) < 0
      || !Number.isSafeInteger(deliveryCharge) || (deliveryCharge as number) < 0
      || !Number.isSafeInteger(total) || (total as number) < 0
      || subtotal !== unitPrice * quantity
      || total !== (subtotal as number) + (deliveryCharge as number) + (addOn?.price ?? 0)) {
      return null;
    }

    return {
      orderRef,
      productName,
      variantLabel,
      quantity,
      unitPrice,
      subtotal: subtotal as number,
      deliveryCharge: deliveryCharge as number,
      total: total as number,
      customerName,
      phone,
      address,
      ...(addOn ? { addOn } : {}),
    };
  } catch {
    return null;
  }
}

export function writeKalojiraOrderConfirmation(
  storage: KalojiraConfirmationStorage | undefined,
  confirmation: KalojiraOrderConfirmation,
) {
  if (!storage) return false;
  const safeConfirmation = parseKalojiraOrderConfirmation(confirmation);
  if (!safeConfirmation) return false;

  try {
    storage.setItem(KALOJIRA_CONFIRMATION_KEY, JSON.stringify(safeConfirmation));
    return true;
  } catch {
    return false;
  }
}

export function readKalojiraOrderConfirmation(storage: KalojiraConfirmationStorage | undefined) {
  if (!storage) return null;
  try {
    const serialized = storage.getItem(KALOJIRA_CONFIRMATION_KEY);
    return serialized ? parseKalojiraOrderConfirmation(JSON.parse(serialized)) : null;
  } catch {
    return null;
  }
}

export function clearKalojiraOrderConfirmation(storage: KalojiraConfirmationStorage | undefined) {
  try {
    storage?.removeItem(KALOJIRA_CONFIRMATION_KEY);
  } catch {
    // Storage can be unavailable in privacy modes. Clearing remains best-effort.
  }
}
