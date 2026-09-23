import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBdMobile } from "../../../shared/bd-phone.ts";

test("accepts 11-digit and +880 mobile numbers, ignoring spaces and dashes", () => {
  assert.equal(normalizeBdMobile("01712345678"), "01712345678");
  assert.equal(normalizeBdMobile("+8801712345678"), "01712345678");
  assert.equal(normalizeBdMobile("01712 345678"), "01712345678");
  assert.equal(normalizeBdMobile("01712-345678"), "01712345678");
  assert.equal(normalizeBdMobile(" +880 1712-345678 "), "01712345678");
  for (const prefix of ["013", "014", "015", "016", "017", "018", "019"]) {
    assert.equal(normalizeBdMobile(`${prefix}12345678`), `${prefix}12345678`);
  }
});

test("rejects non-English digits, other formats and non-operator prefixes", () => {
  assert.equal(normalizeBdMobile("০১৭১২৩৪৫৬৭৮"), null);
  assert.equal(normalizeBdMobile("+৮৮০ ১৭১২-৩৪৫৬৭৮"), null);
  assert.equal(normalizeBdMobile("٠١٧١٢٣٤٥٦٧٨"), null);
  assert.equal(normalizeBdMobile("8801712345678"), null);
  assert.equal(normalizeBdMobile("+88001712345678"), null);
  assert.equal(normalizeBdMobile("(017) 12345678"), null);
  assert.equal(normalizeBdMobile("017.1234.5678"), null);
  assert.equal(normalizeBdMobile("01012345678"), null);
  assert.equal(normalizeBdMobile("01112345678"), null);
  assert.equal(normalizeBdMobile("01212345678"), null);
  assert.equal(normalizeBdMobile("0171234567"), null);
  assert.equal(normalizeBdMobile("017123456789"), null);
  assert.equal(normalizeBdMobile("1712345678"), null);
  assert.equal(normalizeBdMobile("12345678901"), null);
  assert.equal(normalizeBdMobile("01712345678 ext 9"), null);
  assert.equal(normalizeBdMobile(""), null);
});
