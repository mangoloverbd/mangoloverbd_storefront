declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: unknown;
  }
}

export function getMetaPixelId() {
  return (import.meta as any).env?.VITE_META_PIXEL_ID as string | undefined;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const value = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  return value ? decodeURIComponent(value) : "";
}

function getFbcFromLocation() {
  if (typeof window === "undefined") return "";
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return "";
  return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
}

function getBrowserId() {
  if (typeof window === "undefined") return "";
  const storageKey = "stepprs-meta-browser-id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const next = createEventId();
  window.localStorage.setItem(storageKey, next);
  return next;
}

async function sha256(value: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getBrowserUserData() {
  const externalId = await sha256(getBrowserId());
  return {
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc") || getFbcFromLocation(),
    ...(externalId ? { external_id: externalId } : {}),
  };
}

export function initMetaPixel() {
  const pixelId = getMetaPixelId();
  if (!pixelId) return;

  if (typeof window === "undefined") return;
  if (window.fbq) return;

  // Meta Pixel base code (script injection)
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      // Canonical behavior:
      // - If the real pixel library is loaded, callMethod exists → forward call.
      // - Otherwise queue the arguments until the script loads.
      if (n.callMethod) return n.callMethod.apply(n, arguments);
      return n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  try {
    (window as any).fbq?.("init", pixelId);
  } catch {
    // If blocked by extensions/network, don't crash the app.
  }
}

export function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function trackPixel(
  eventName: string,
  customData?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq as undefined | ((...args: any[]) => void);
  if (!fbq) return;

  const options = eventId ? { eventID: eventId } : undefined;
  fbq("track", eventName, customData ?? {}, options);
}

export async function trackCapi(
  eventName: string,
  customData?: Record<string, unknown>,
  eventId?: string,
  eventSourceUrl?: string,
) {
  try {
    if (typeof window === "undefined") return;

    await fetch("/api/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: eventSourceUrl ?? window.location.href,
        user_data: await getBrowserUserData(),
        custom_data: customData ?? {},
      }),
    });
  } catch {
    // Don't block UX on tracking failures.
  }
}

export function trackMetaEvent(opts: {
  eventName: string;
  customData?: Record<string, unknown>;
  eventId?: string;
  capi?: boolean;
}) {
  trackPixel(opts.eventName, opts.customData, opts.eventId);
  if (opts.capi) {
    void trackCapi(opts.eventName, opts.customData, opts.eventId);
  }
}
