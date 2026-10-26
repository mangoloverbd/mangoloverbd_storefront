import type { StorefrontProduct } from "../../lib/storefront-products.ts";
import { normalizeBdMobile } from "../../../../shared/bd-phone";
import { MAX_LINE_QUANTITY } from "../../../../shared/order-limits";
import { getKalojiraPackOptions } from "../kalojira-mixed/order.ts";

// Mirrors Merchant-Suite's default storefront shipping (server/shippingCalculation.js):
// ৳100 delivery, free once the subtotal reaches ৳2600. The Suite stays authoritative.
export const KHEJUR_DELIVERY_CHARGE = 100;
export const KHEJUR_FREE_DELIVERY_THRESHOLD = 2600;
export const KHEJUR_CONFIRMATION_KEY = "khejurer-gur-order-confirmation-v1";

const MAX_PRICE = 10_000_000;
const MAX_ORDER_UNITS = 100;

export type KhejurLine = {
  slug: string;
  productId: string;
  productName: string;
  variantId: string;
  label: string;
  unitPrice: number;
  comparePrice: number | null;
};

export type KhejurSelection = Readonly<Record<string, number>>;

export type KhejurTotals = {
  items: { line: KhejurLine; quantity: number }[];
  units: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
};

export type KhejurOrderPayload = {
  bundleTitle: string;
  bundleDetails: string;
  bundlePrice: number;
  quantity: number;
  deliveryCharge: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: "cash_on_delivery";
  items: { productId: string; variantId: string; quantity: number }[];
};

export type KhejurConfirmationItem = { name: string; label: string; quantity: number; unitPrice: number };

export type KhejurOrderConfirmation = {
  orderRef: string;
  items: KhejurConfirmationItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
};

type ConfirmationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const isPositiveInt = (value: unknown, max = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= max;

const isNonNegativeInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

function trimmed(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

// The customer-facing name: the Bangla half of "খেজুরের পাটালী গুড় | Date Palm Patali Gur".
export function displayProductName(name: string) {
  return name.split("|")[0].trim() || name.trim();
}

// Orderable 1-line-per-variant list, in the slug order the page presents.
export function getKhejurLines(products: readonly (StorefrontProduct | null | undefined)[], slugs: readonly string[]): KhejurLine[] {
  return slugs.flatMap((slug) => {
    const product = products.find((candidate) => candidate?.slug === slug);
    if (!product || product.id === undefined || product.id === null) return [];
    const basePrice = Number(product.price);
    const baseCompare = Number(product.compare_at_price);
    return getKalojiraPackOptions(product).map((pack) => {
      const compare = Number.isFinite(basePrice) && Number.isFinite(baseCompare) && baseCompare > basePrice
        ? baseCompare - basePrice + pack.unitPrice
        : null;
      return {
        slug,
        productId: String(product.id),
        productName: product.name,
        variantId: pack.variantId,
        label: pack.label,
        unitPrice: pack.unitPrice,
        comparePrice: compare && Number.isSafeInteger(compare) && compare > pack.unitPrice ? compare : null,
      };
    });
  });
}

export function deliveryChargeFor(subtotal: number) {
  return subtotal >= KHEJUR_FREE_DELIVERY_THRESHOLD ? 0 : KHEJUR_DELIVERY_CHARGE;
}

export function calculateKhejurTotals(lines: readonly KhejurLine[], selection: KhejurSelection): KhejurTotals {
  const items = lines.flatMap((line) => {
    const quantity = selection[line.variantId] ?? 0;
    return isPositiveInt(quantity, MAX_LINE_QUANTITY) ? [{ line, quantity }] : [];
  });
  const units = items.reduce((sum, { quantity }) => sum + quantity, 0);
  const subtotal = items.reduce((sum, { line, quantity }) => sum + line.unitPrice * quantity, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal > MAX_PRICE) throw new Error("Order total is invalid");
  const deliveryCharge = units ? deliveryChargeFor(subtotal) : 0;
  return { items, units, subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}

export function buildKhejurOrderPayload(input: {
  totals: KhejurTotals;
  customerName: string;
  phone: string;
  address: string;
}): KhejurOrderPayload {
  const { totals } = input;
  if (!totals.items.length || totals.units > MAX_ORDER_UNITS) throw new Error("Order items are invalid");
  const customerName = trimmed(input.customerName, 120);
  const phone = normalizeBdMobile(input.phone);
  const address = trimmed(input.address, 500);
  if (!customerName || customerName.length < 2 || !phone || !address || address.length < 5) {
    throw new Error("Customer details are invalid");
  }
  const details = totals.items
    .map(({ line, quantity }) => `${displayProductName(line.productName)} ${line.label} × ${quantity}`)
    .join(", ");
  return {
    bundleTitle: "খেজুরের গুড়",
    bundleDetails: details.slice(0, 300),
    bundlePrice: totals.subtotal,
    quantity: totals.units,
    deliveryCharge: totals.deliveryCharge,
    customerName,
    phone,
    address,
    paymentMethod: "cash_on_delivery",
    items: totals.items.map(({ line, quantity }) => ({ productId: line.productId, variantId: line.variantId, quantity })),
  };
}

export function buildKhejurConfirmation(orderRef: string, totals: KhejurTotals, payload: KhejurOrderPayload): KhejurOrderConfirmation {
  return {
    orderRef: orderRef.trim(),
    items: totals.items.map(({ line, quantity }) => ({ name: displayProductName(line.productName), label: line.label, quantity, unitPrice: line.unitPrice })),
    subtotal: totals.subtotal,
    deliveryCharge: totals.deliveryCharge,
    total: totals.total,
    customerName: payload.customerName,
    phone: payload.phone,
    address: payload.address,
  };
}

export function parseKhejurConfirmation(value: unknown): KhejurOrderConfirmation | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Record<string, unknown>;
  const orderRef = trimmed(c.orderRef, 128);
  const customerName = trimmed(c.customerName, 120);
  const phone = trimmed(c.phone, 11);
  const address = trimmed(c.address, 500);
  if (!orderRef || !customerName || !phone || !address || !Array.isArray(c.items) || !c.items.length) return null;
  const items: KhejurConfirmationItem[] = [];
  for (const raw of c.items as unknown[]) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const name = trimmed(item.name, 200);
    const label = trimmed(item.label, 120);
    if (!name || !label || !isPositiveInt(item.quantity, MAX_LINE_QUANTITY) || !isPositiveInt(item.unitPrice, MAX_PRICE)) return null;
    items.push({ name, label, quantity: item.quantity, unitPrice: item.unitPrice });
  }
  const subtotal = c.subtotal;
  const deliveryCharge = c.deliveryCharge;
  const total = c.total;
  if (!isNonNegativeInt(subtotal) || !isNonNegativeInt(deliveryCharge) || !isNonNegativeInt(total)) return null;
  if (subtotal !== items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) || total !== subtotal + deliveryCharge) return null;
  return { orderRef, items, subtotal, deliveryCharge, total, customerName, phone, address };
}

export function writeKhejurConfirmation(storage: ConfirmationStorage | undefined, confirmation: KhejurOrderConfirmation) {
  const safe = parseKhejurConfirmation(confirmation);
  if (!storage || !safe) return false;
  try {
    storage.setItem(KHEJUR_CONFIRMATION_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

export function readKhejurConfirmation(storage: ConfirmationStorage | undefined) {
  if (!storage) return null;
  try {
    const serialized = storage.getItem(KHEJUR_CONFIRMATION_KEY);
    return serialized ? parseKhejurConfirmation(JSON.parse(serialized)) : null;
  } catch {
    return null;
  }
}

export function clearKhejurConfirmation(storage: ConfirmationStorage | undefined) {
  try {
    storage?.removeItem(KHEJUR_CONFIRMATION_KEY);
  } catch {
    // Storage can be unavailable in privacy modes; clearing is best-effort.
  }
}
