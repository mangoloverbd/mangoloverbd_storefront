export function OrderProtectionMessage({ decision, retryable = true }: { decision: "review" | "block"; retryable?: boolean }) {
  if (decision === "review") {
    return <div role="status" className="rounded-xl border border-[#b8872c]/50 bg-[#fff7df] px-4 py-3 text-sm leading-6 text-[#3d211a]">আপনার অর্ডারের তথ্য পাওয়া গেছে। আমাদের টিম দ্রুত দেখে ফোনে নিশ্চিত করবে। এখন আবার জমা দেওয়ার প্রয়োজন নেই।</div>;
  }
  return <div role="alert" className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">তথ্যগুলো একবার দেখে আবার চেষ্টা করুন। {retryable ? "সমস্যা থাকলে কিছুক্ষণ পরে চেষ্টা করুন।" : "প্রয়োজনে আমাদের সঙ্গে যোগাযোগ করুন।"}</div>;
}
