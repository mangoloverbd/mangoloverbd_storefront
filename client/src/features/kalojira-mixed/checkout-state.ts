export type KalojiraCheckoutStatus = "loading" | "ready" | "error" | "unavailable";

export type KalojiraFieldName =
  | "pack"
  | "quantity"
  | "name"
  | "phone"
  | "address";

export type KalojiraFieldErrors = Partial<Record<KalojiraFieldName, string>>;

export const KALOJIRA_FIELD_ORDER: readonly KalojiraFieldName[] = [
  "pack",
  "quantity",
  "name",
  "phone",
  "address",
];

export function resolveKalojiraCheckoutStatus(input: {
  hasProduct: boolean;
  hasOrderablePacks: boolean;
  productIsPending: boolean;
  productIsError: boolean;
  inventoryIsError: boolean;
  inventoryIsFetched: boolean;
  hasInventory: boolean;
}): KalojiraCheckoutStatus {
  if (input.productIsError || input.inventoryIsError) return "error";
  if (input.productIsPending && !input.hasProduct) return "loading";
  if (!input.hasProduct) return "unavailable";
  if (input.inventoryIsFetched && !input.hasInventory) return "unavailable";
  if (!input.hasOrderablePacks) return "unavailable";
  return "ready";
}

export function getFirstKalojiraInvalidField(errors: KalojiraFieldErrors) {
  return KALOJIRA_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;
}

export function getKalojiraFocusTargetId(
  errors: KalojiraFieldErrors,
  selectedVariantId: string,
  renderedVariantIds: string[],
) {
  const firstField = getFirstKalojiraInvalidField(errors);
  if (!firstField) return null;
  if (firstField !== "pack") return `kalojira-${firstField}`;

  const targetVariantId = renderedVariantIds.includes(selectedVariantId)
    ? selectedVariantId
    : renderedVariantIds[0];
  return targetVariantId ? `kalojira-pack-${targetVariantId}` : "kalojira-pack";
}
