import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getOrCreateClientSessionId } from "./order-protection";

describe("storefront order protection signals", () => {
  it("persists one opaque client session id per browser session", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const first = getOrCreateClientSessionId(storage);
    expect(first).toBe(getOrCreateClientSessionId(storage));
    expect(first.length).toBeGreaterThan(8);
  });

  it("adds the challenge and honeypot to every checkout surface", () => {
    for (const file of [
      "client/src/components/order-dialog.tsx",
      "client/src/features/sundarbans-honey/honey-checkout.tsx",
      "client/src/features/kalojira-mixed/kalojira-checkout.tsx",
      "client/src/features/honey-nut/honey-nut-checkout.tsx",
    ]) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).toContain("TurnstileChallenge");
      expect(source).toContain('name="website"');
      expect(source).toContain("clientSessionId");
      expect(source).toContain("checkoutStartedAt");
    }
  });
});
