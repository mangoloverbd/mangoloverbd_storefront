import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  DISTRICTS,
  getUpazilas,
  searchLocations,
} from "./location-data.ts";

const componentSource = readFileSync(
  new URL("./location-combobox.tsx", import.meta.url),
  "utf8",
);

test("includes every district and source upazila", () => {
  assert.equal(DISTRICTS.length, 64);
  assert.equal(
    DISTRICTS.reduce(
      (count, district) => count + getUpazilas(district.id).length,
      0,
    ),
    494,
  );
});

test("returns only the upazilas for the requested district", () => {
  const dhakaUpazilas = getUpazilas("47");

  assert.ok(dhakaUpazilas.some((item) => item.nameBn === "সাভার"));
  assert.ok(dhakaUpazilas.every((item) => item.id >= "365" && item.id <= "369"));
});

test("returns an empty list for an unknown district", () => {
  assert.deepEqual(getUpazilas("missing"), []);
});

test("searches Bangla names", () => {
  assert.ok(
    searchLocations(DISTRICTS, "ঢাকা").some(
      (item) => item.nameEn === "Dhaka",
    ),
  );
});

test("searches English names without case sensitivity", () => {
  assert.ok(
    searchLocations(DISTRICTS, "dhaka").some(
      (item) => item.nameBn === "ঢাকা",
    ),
  );
});

test("trims the search query and returns every option for an empty query", () => {
  assert.deepEqual(searchLocations(DISTRICTS, "  dhaka  "), [
    { id: "47", nameBn: "ঢাকা", nameEn: "Dhaka" },
  ]);
  assert.equal(searchLocations(DISTRICTS, "   ").length, 64);
});

test("keeps every vendored location name trimmed", () => {
  const upazilas = DISTRICTS.flatMap((district) => getUpazilas(district.id));

  for (const option of [...DISTRICTS, ...upazilas]) {
    assert.equal(option.nameBn, option.nameBn.trim());
    assert.equal(option.nameEn, option.nameEn.trim());
  }
});

test("combobox exposes visible labels, search states, and accessible errors", () => {
  assert.match(componentSource, /<label[^>]*htmlFor=\{id\}/);
  assert.match(componentSource, /\{label\}/);
  assert.match(componentSource, /CommandInput/);
  assert.match(componentSource, /aria-label=\{searchPlaceholder\}/);
  assert.match(componentSource, /CommandEmpty/);
  assert.match(componentSource, /CommandItem/);
  assert.match(componentSource, /disabled=\{disabled\}/);
  assert.match(componentSource, /aria-invalid=\{!!error\}/);
  assert.match(componentSource, /aria-describedby=\{error \? errorId : undefined\}/);
  assert.match(componentSource, /min-h-11/);
  assert.match(componentSource, /\{option\.nameBn\} · \{option\.nameEn\}/);
});
