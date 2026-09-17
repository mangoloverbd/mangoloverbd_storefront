export type BundleWithTitle = { title: string };

export function getDefaultBundleIndex(slug: string, bundles: BundleWithTitle[]): number {
  if (slug !== "litchi-flower-honey") return 0;

  const preferredIndex = bundles.findIndex((bundle) => bundle.title === "২ কেজি");
  return preferredIndex >= 0 ? preferredIndex : 0;
}
