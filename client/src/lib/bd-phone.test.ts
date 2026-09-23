import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBdMobile } from "../../../shared/bd-phone.ts";

test("normalizes Bangla digits and country-prefix mobile numbers", () => {
  assert.equal(normalizeBdMobile("০১৭১২৩৪৫৬৭৮"), "01712345678");
  assert.equal(normalizeBdMobile("+৮৮০ ১৭১২-৩৪৫৬৭৮"), "01712345678");
  assert.equal(normalizeBdMobile("8801712345678"), "01712345678");
  assert.equal(normalizeBdMobile("01712 345678"), "01712345678");
  assert.equal(normalizeBdMobile("12345678901"), null);
  assert.equal(normalizeBdMobile("01712345678 ext 9"), null);
});
