// One delivery-address rule for every checkout. The address box and the order
// builder must agree: an address that passes the box but fails the builder
// reached the customer as an unexplained "could not send" error.

export const ADDRESS_MIN_LENGTH = 5;
export const ADDRESS_MAX_LENGTH = 300;
// "Dhaka" or "Mirpur 10" is not enough for a courier: house/road, area and district.
export const ADDRESS_MIN_WORDS = 3;

export const ADDRESS_ERROR = "পুরো ঠিকানা লিখুন — বাড়ি/রোড, এলাকা ও জেলা (যেমন: বাড়ি ১২, রোড ৫, মিরপুর, ঢাকা)।";

/** Words in an address; commas count as separators, so "Mirpur,Dhaka" is two words. */
export function addressWordCount(address: string): number {
  return address.split(/[\s,]+/).filter(Boolean).length;
}

/** True when the address box value is long enough and names house/road, area and district. */
export function isCompleteAddress(address: string): boolean {
  const trimmed = address.trim();
  return trimmed.length >= ADDRESS_MIN_LENGTH
    && trimmed.length <= ADDRESS_MAX_LENGTH
    && addressWordCount(trimmed) >= ADDRESS_MIN_WORDS;
}
