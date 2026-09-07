export type HoneyCheckoutStatus = "loading" | "ready" | "error" | "unavailable";

export type HoneyFieldName =
  | "pack"
  | "quantity"
  | "name"
  | "phone"
  | "address"
  | "district"
  | "upazila";

export type HoneyFieldErrors = Partial<Record<HoneyFieldName, string>>;

export const HONEY_FIELD_ORDER: readonly HoneyFieldName[] = [
  "pack",
  "quantity",
  "name",
  "phone",
  "address",
  "district",
  "upazila",
];

export function resolveHoneyCheckoutStatus(input: {
  hasProduct: boolean;
  hasOrderablePacks: boolean;
  productIsPending: boolean;
  productIsError: boolean;
  inventoryIsError: boolean;
  inventoryIsFetched: boolean;
  hasInventory: boolean;
}): HoneyCheckoutStatus {
  if (input.productIsError || input.inventoryIsError) return "error";
  if (input.productIsPending && !input.hasProduct) return "loading";
  if (!input.hasProduct) return "unavailable";
  if (input.inventoryIsFetched && !input.hasInventory) return "unavailable";
  if (!input.hasOrderablePacks) return "unavailable";
  return "ready";
}

export function getFirstHoneyInvalidField(errors: HoneyFieldErrors) {
  return HONEY_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;
}

export function getHoneyFocusTargetId(
  errors: HoneyFieldErrors,
  selectedVariantId: string,
  renderedVariantIds: string[],
) {
  const firstField = getFirstHoneyInvalidField(errors);
  if (!firstField) return null;
  if (firstField !== "pack") return `honey-${firstField}`;

  const targetVariantId = renderedVariantIds.includes(selectedVariantId)
    ? selectedVariantId
    : renderedVariantIds[0];
  return targetVariantId ? `honey-pack-${targetVariantId}` : "honey-pack";
}
