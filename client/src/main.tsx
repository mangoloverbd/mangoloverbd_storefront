import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import "./index.css";

// Auto-inject the Merchant Suite visitor tracker. Merchant Suite deploys this
// storefront per merchant with VITE_MERCHANT_SUITE_URL + VITE_STOREFRONT_ID
// baked in, so the tracker points at that merchant's own dashboard — no manual
// copy/paste needed. Skipped when those env vars are absent (local dev without them).
const TRACKER_SUITE = import.meta.env.VITE_MERCHANT_SUITE_URL;
const TRACKER_ORG = import.meta.env.VITE_STOREFRONT_ID;
if (TRACKER_SUITE && TRACKER_ORG && !document.getElementById("merchant-suite-tracker")) {
  const t = document.createElement("script");
  t.id = "merchant-suite-tracker";
  t.async = true;
  t.src = `${TRACKER_SUITE.replace(/\/$/, "")}/api/tracker.js?org=${TRACKER_ORG}`;
  document.body.appendChild(t);
}

createRoot(document.getElementById("root")!).render(
  <MotionConfig reducedMotion="never">
    <App />
  </MotionConfig>,
);
