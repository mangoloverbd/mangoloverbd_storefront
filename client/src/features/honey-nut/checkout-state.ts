export type HoneyNutCheckoutStatus = "loading" | "ready" | "error" | "unavailable";
export type HoneyNutFieldName = "pack" | "quantity" | "name" | "phone" | "address";
export type HoneyNutFieldErrors = Partial<Record<HoneyNutFieldName, string>>;

export const HONEY_NUT_FIELD_ORDER: readonly HoneyNutFieldName[] = ["pack", "quantity", "name", "phone", "address"];

export function resolveHoneyNutCheckoutStatus(input: {
  hasProduct: boolean;
  hasOrderablePacks: boolean;
  productIsPending: boolean;
  productIsError: boolean;
  inventoryIsError: boolean;
  inventoryIsFetched: boolean;
  hasInventory: boolean;
}): HoneyNutCheckoutStatus {
  if (input.productIsError || input.inventoryIsError) return "error";
  if (input.productIsPending && !input.hasProduct) return "loading";
  if (!input.hasProduct) return "unavailable";
  if (input.inventoryIsFetched && !input.hasInventory) return "unavailable";
  if (!input.hasOrderablePacks) return "unavailable";
  return "ready";
}

export function getFirstHoneyNutInvalidField(errors: HoneyNutFieldErrors) {
  return HONEY_NUT_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;
}

export function getHoneyNutFocusTargetId(errors: HoneyNutFieldErrors, selectedVariantId: string, renderedVariantIds: string[]) {
  const firstField = getFirstHoneyNutInvalidField(errors);
  if (!firstField) return null;
  if (firstField !== "pack") return `honey-nut-${firstField}`;
  const targetVariantId = renderedVariantIds.includes(selectedVariantId) ? selectedVariantId : renderedVariantIds[0];
  return targetVariantId ? `honey-nut-pack-${targetVariantId}` : "honey-nut-pack";
}
