import assert from "node:assert/strict";
import test from "node:test";
import type { ServerResponse } from "node:http";

import { sendLegacyGone } from "./legacy-gone.ts";

function createResponse() {
  const headers: Record<string, string> = {};
  let body = "";
  const response = {
    statusCode: 0,
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    end(value?: string) {
      body = value ?? "";
    },
  } as unknown as ServerResponse;

  return { response, headers, readBody: () => body };
}

test("returns one static noindex 410 response for every legacy rewrite", () => {
  const { response, headers, readBody } = createResponse();

  sendLegacyGone(response);

  assert.equal(response.statusCode, 410);
  assert.equal(headers["content-type"], "text/html; charset=utf-8");
  assert.equal(headers["x-robots-tag"], "noindex, follow");
  assert.equal(headers["cache-control"], "no-store");
  assert.match(readBody(), /no longer available/i);
  assert.match(readBody(), /noindex, follow/i);
  assert.match(readBody(), /href="\/products"/);
});
