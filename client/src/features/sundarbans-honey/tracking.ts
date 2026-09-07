import {
  trackGoogleInteractionEvent,
  type GoogleAnalyticsWindow,
  type GoogleInteractionEventName,
} from "../../lib/google-analytics.ts";

const HONEY_CAMPAIGN = "sundarbans_natural_honey";
const HONEY_PURCHASE_MARKER_PREFIX = "sundarbans-honey-purchase-tracked-v1:";

type HoneyTrackingStorage = Pick<Storage, "getItem" | "setItem">;

export type HoneyCampaignEventParameters = {
  campaign_view: Record<string, never>;
  landing_cta_click: { placement: string };
  whatsapp_click: { placement: string };
  phone_click: { placement: string };
  checkout_error: { error_type: "validation" | "availability" | "network" };
};

export function trackHoneyCampaignEvent<Event extends GoogleInteractionEventName>(
  event: Event,
  parameters: HoneyCampaignEventParameters[Event],
  target?: GoogleAnalyticsWindow,
) {
  let safeParameters: Record<string, string>;

  if (event === "campaign_view") {
    safeParameters = {};
  } else if (event === "checkout_error") {
    safeParameters = {
      error_type: (parameters as HoneyCampaignEventParameters["checkout_error"]).error_type,
    };
  } else {
    safeParameters = {
      placement: (parameters as HoneyCampaignEventParameters["landing_cta_click"]).placement,
    };
  }

  return trackGoogleInteractionEvent(event, {
    campaign: HONEY_CAMPAIGN,
    ...safeParameters,
  }, target);
}

export function markPurchaseTracked(
  storage: HoneyTrackingStorage | undefined,
  orderRef: string,
) {
  const normalizedOrderRef = orderRef.trim();
  if (!storage || !normalizedOrderRef) return false;

  const marker = `${HONEY_PURCHASE_MARKER_PREFIX}${normalizedOrderRef}`;
  try {
    if (storage.getItem(marker) !== null) return false;
    storage.setItem(marker, "1");
    return true;
  } catch {
    return false;
  }
}
