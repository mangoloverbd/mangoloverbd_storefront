// Facebook (FBAN/FBAV/FB_IAB) and Instagram open ad clicks in their own
// in-app browser, which can overlay a contact bar on the bottom of the page.
export function isMetaInAppBrowser(userAgent: string) {
  return /FBAN|FBAV|FB_IAB|Instagram/.test(userAgent);
}
