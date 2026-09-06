const CAMPAIGN_PREFIX = "/step/";

export function isGoogleOnlyCampaignPath(pathname: string) {
  return pathname === "/step" || pathname.startsWith(CAMPAIGN_PREFIX);
}
