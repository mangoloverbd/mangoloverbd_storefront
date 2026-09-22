export type BundleWithTitle = { title: string };

const PREFERRED_BUNDLE_BY_SLUG: Record<string, string> = {
  "litchi-flower-honey": "২ কেজি",
  "homemade-pumpkin-bori": "১ কেজি",
};

export function getDefaultBundleIndex(slug: string, bundles: BundleWithTitle[]): number {
  const preferred = PREFERRED_BUNDLE_BY_SLUG[slug];
  if (!preferred) return 0;

  const preferredIndex = bundles.findIndex((bundle) => bundle.title === preferred);
  return preferredIndex >= 0 ? preferredIndex : 0;
}
