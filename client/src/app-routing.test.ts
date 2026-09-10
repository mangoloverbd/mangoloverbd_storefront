import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

test("registers the collection route", () => {
  assert.match(appSource, /path="\/collection\/:slug"/);
  assert.match(appSource, /CollectionPage/);
});
