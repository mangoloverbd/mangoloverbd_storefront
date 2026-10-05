import type { HtmlTagDescriptor, Plugin } from "vite";
import { getMerchantSuiteTrackerUrl, PRODUCTION_MERCHANT_SUITE_URL } from "./client/src/lib/tracker.ts";

type TrackerBuild = { isProduction: boolean; env: Record<string, string | undefined> };

// Puts the visitor tracker in the HTML head so it downloads alongside the app
// bundle. Injected from main.tsx it only started after the bundle ran, and
// shoppers who left within the first seconds were never counted.
export function merchantSuiteTrackerTags({ isProduction, env }: TrackerBuild): HtmlTagDescriptor[] {
  const suiteUrl = isProduction ? PRODUCTION_MERCHANT_SUITE_URL : env.VITE_MERCHANT_SUITE_URL ?? "";
  const src = getMerchantSuiteTrackerUrl(suiteUrl, env.VITE_STOREFRONT_ID ?? "");
  if (!src) return [];
  return [{ tag: "script", attrs: { id: "merchant-suite-tracker", async: true, src }, injectTo: "head" }];
}

export function merchantSuiteTrackerPlugin(): Plugin {
  let build: TrackerBuild = { isProduction: false, env: {} };
  return {
    name: "vite-plugin-merchant-suite-tracker",
    configResolved(config) {
      build = { isProduction: config.isProduction, env: config.env };
    },
    transformIndexHtml() {
      return merchantSuiteTrackerTags(build);
    },
  };
}
