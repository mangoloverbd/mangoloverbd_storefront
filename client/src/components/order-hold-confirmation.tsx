import React from "react";

export function OrderHoldConfirmation() {
  return (
    <section role="status" aria-live="polite" className="mx-auto max-w-lg py-12 text-center">
      <h2 className="text-2xl font-semibold">অর্ডারটি পেয়েছি</h2>
      <p className="mt-4 text-base leading-7">আপনার অর্ডারটি পেয়েছি। আমাদের টিম ফোন করে অর্ডারটি নিশ্চিত করবে।</p>
      <a href="/" className="mt-6 inline-block text-sm underline underline-offset-4">হোমে ফিরে যান</a>
    </section>
  );
}
