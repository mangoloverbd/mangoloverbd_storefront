import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OrderHoldConfirmation } from "./order-hold-confirmation.tsx";

test("held checkout confirms receipt without claiming a completed purchase", () => {
  const markup = renderToStaticMarkup(<OrderHoldConfirmation />);
  assert.match(markup, /role="status"/);
  assert.match(markup, /আমাদের টিম ফোন করে অর্ডারটি নিশ্চিত করবে।/);
  assert.doesNotMatch(markup, /Order Confirmed|অর্ডার কনফার্ম/);
  assert.match(markup, /href="\/"/);
});
