/** Return the canonical local mobile number, or null for an invalid input. */
export function normalizeBdMobile(value: string): string | null {
  const ascii = value.trim().replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
  if (!/^\+?[\d\s()-]+$/.test(ascii)) return null;
  const digits = ascii.replace(/\D/g, "");
  const local = digits.startsWith("880") ? `0${digits.slice(3)}` : digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}
