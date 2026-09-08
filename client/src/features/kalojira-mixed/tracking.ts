import {
  trackGoogleInteractionEvent,
  type GoogleAnalyticsWindow,
  type GoogleInteractionEventName,
} from "../../lib/google-analytics.ts";

const KALOJIRA_CAMPAIGN = "kalojira_mixed";
const KALOJIRA_PURCHASE_MARKER_PREFIX = "kalojira-mixed-purchase-tracked-v1:";

type KalojiraTrackingStorage = Pick<Storage, "getItem" | "setItem">;

export type KalojiraCampaignEventParameters = {
  campaign_view: Record<string, never>;
  landing_cta_click: { placement: string };
  whatsapp_click: { placement: string };
  phone_click: { placement: string };
  checkout_error: { error_type: "validation" | "availability" | "network" };
};

export function trackKalojiraCampaignEvent<Event extends GoogleInteractionEventName>(
  event: Event,
  parameters: KalojiraCampaignEventParameters[Event],
  target?: GoogleAnalyticsWindow,
) {
  let safeParameters: Record<string, string>;

  if (event === "campaign_view") {
    safeParameters = {};
  } else if (event === "checkout_error") {
    safeParameters = {
      error_type: (parameters as KalojiraCampaignEventParameters["checkout_error"]).error_type,
    };
  } else {
    safeParameters = {
      placement: (parameters as KalojiraCampaignEventParameters["landing_cta_click"]).placement,
    };
  }

  return trackGoogleInteractionEvent(event, {
    campaign: KALOJIRA_CAMPAIGN,
    ...safeParameters,
  }, target);
}

export function markKalojiraPurchaseTracked(
  storage: KalojiraTrackingStorage | undefined,
  orderRef: string,
) {
  const normalizedOrderRef = orderRef.trim();
  if (!storage || !normalizedOrderRef) return false;

  const marker = `${KALOJIRA_PURCHASE_MARKER_PREFIX}${normalizedOrderRef}`;
  try {
    if (storage.getItem(marker) !== null) return false;
    storage.setItem(marker, "1");
    return true;
  } catch {
    return false;
  }
}
