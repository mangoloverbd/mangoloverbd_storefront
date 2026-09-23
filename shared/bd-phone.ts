/**
 * Return the canonical local mobile number, or null for an invalid input.
 * Accepts English digits only, as 01[3-9]XXXXXXXX or +8801[3-9]XXXXXXXX;
 * spaces and dashes are ignored.
 */
export function normalizeBdMobile(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  const match = /^(?:0|\+880)(1[3-9]\d{8})$/.exec(compact);
  return match ? `0${match[1]}` : null;
}
