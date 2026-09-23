import { useEffect, useRef, useState, type ClipboardEvent, type FocusEvent } from "react";
import { computeDeviceFingerprint } from "./device-fingerprint";
import { normalizeBdMobile } from "../../../shared/bd-phone";

const SESSION_KEY = "mlbd_checkout_session_id";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateClientSessionId(storage: Pick<Storage, "getItem" | "setItem"> | undefined = typeof window === "undefined" ? undefined : window.sessionStorage) {
  if (!storage) return randomId();
  try {
    const current = storage.getItem(SESSION_KEY);
    if (current) return current;
    const next = randomId();
    storage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

type Field = "name" | "phone" | "address";
export const firstFocusTimestamp = (current: string | null, incoming: string) => current ?? incoming;

export function addPhoneCandidate(current: string[], value: string): string[] {
  const phone = normalizeBdMobile(value);
  return phone ? [phone] : [];
}

export function addPastedField(current: Field[], value: string): Field[] {
  return (value === "name" || value === "phone" || value === "address") && !current.includes(value)
    ? [...current, value] : current;
}

export function useCheckoutProtectionSignals() {
  const [clientSessionId] = useState(() => getOrCreateClientSessionId());
  const [mountedAt] = useState(() => new Date().toISOString());
  const firstInteractionAt = useRef<string | null>(null);
  const phoneCandidates = useRef<string[]>([]);
  const pastedFields = useRef<Field[]>([]);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetTurnstileSignal, setResetTurnstileSignal] = useState(0);

  useEffect(() => { void computeDeviceFingerprint().then(setFingerprint); }, []);
  const formHandlers = {
    onFocusCapture: (_event: FocusEvent<HTMLFormElement>) => {
      firstInteractionAt.current = firstFocusTimestamp(firstInteractionAt.current, new Date().toISOString());
    },
    onPasteCapture: (event: ClipboardEvent<HTMLFormElement>) => {
      const field = (event.target as HTMLInputElement | HTMLTextAreaElement).name;
      pastedFields.current = addPastedField(pastedFields.current, field);
    },
  };
  const trackPhoneCandidate = (value: string) => { phoneCandidates.current = addPhoneCandidate(phoneCandidates.current, value); };
  const resetTurnstile = () => { setTurnstileToken(""); setResetTurnstileSignal((value) => value + 1); };
  const buildProtectionPayload = (website: string) => ({
    website, turnstileToken, clientSessionId,
    checkoutStartedAt: firstInteractionAt.current ?? mountedAt,
    ...(fingerprint ? { deviceFingerprint: fingerprint } : {}),
    checkoutTelemetry: {
      ...(firstInteractionAt.current ? { firstInteractionAt: firstInteractionAt.current } : {}),
      phoneCandidates: [...phoneCandidates.current], pastedFields: [...pastedFields.current],
    },
  });
  return { clientSessionId, checkoutStartedAt: mountedAt, turnstileToken, setTurnstileToken,
    formHandlers, trackPhoneCandidate, fingerprint, resetTurnstileSignal, resetTurnstile, buildProtectionPayload };
}
