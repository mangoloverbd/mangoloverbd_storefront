import { trackGoogleInteractionEvent, type GoogleAnalyticsWindow, type GoogleInteractionEventName } from "../../lib/google-analytics.ts";

const HONEY_NUT_CAMPAIGN = "honey_nut";
const HONEY_NUT_PURCHASE_MARKER_PREFIX = "honey-nut-purchase-tracked-v1:";
type HoneyNutTrackingStorage = Pick<Storage, "getItem" | "setItem">;

export type HoneyNutCampaignEventParameters = {
  campaign_view: Record<string, never>;
  landing_cta_click: { placement: string };
  whatsapp_click: { placement: string };
  phone_click: { placement: string };
  checkout_error: { error_type: "validation" | "availability" | "network" };
};

export function trackHoneyNutCampaignEvent<Event extends GoogleInteractionEventName>(event: Event, parameters: HoneyNutCampaignEventParameters[Event], target?: GoogleAnalyticsWindow) {
  let safeParameters: Record<string, string>;
  if (event === "campaign_view") safeParameters = {};
  else if (event === "checkout_error") safeParameters = { error_type: (parameters as HoneyNutCampaignEventParameters["checkout_error"]).error_type };
  else safeParameters = { placement: (parameters as HoneyNutCampaignEventParameters["landing_cta_click"]).placement };
  return trackGoogleInteractionEvent(event, { campaign: HONEY_NUT_CAMPAIGN, ...safeParameters }, target);
}

export function markHoneyNutPurchaseTracked(storage: HoneyNutTrackingStorage | undefined, orderRef: string) {
  const normalizedOrderRef = orderRef.trim();
  if (!storage || !normalizedOrderRef) return false;
  const marker = `${HONEY_NUT_PURCHASE_MARKER_PREFIX}${normalizedOrderRef}`;
  try {
    if (storage.getItem(marker) !== null) return false;
    storage.setItem(marker, "1");
    return true;
  } catch {
    return false;
  }
}
