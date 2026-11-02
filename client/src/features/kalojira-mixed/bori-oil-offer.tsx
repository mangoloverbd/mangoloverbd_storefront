import { BadgeCheck, CircleCheck, Droplet, Leaf, Sparkles, Star } from "lucide-react";

import type { KalojiraAddOn } from "./order";

export type BoriOilChoice = "yes" | "no" | null;

const money = (value: number) => `৳${value.toLocaleString("en-US")}`;

// The cooking photo is design art (fixed asset); prices and the bottle photo
// come from the Suite offer.
const COOKING_PHOTO = "/bori-mustard-oil.webp";

type BoriOilOfferProps = {
  addOn: KalojiraAddOn;
  choice: BoriOilChoice;
  onChoose: (choice: Exclude<BoriOilChoice, null>) => void;
  totalWithOil: number | null;
  disabled?: boolean;
};

export function BoriOilOffer({ addOn, choice, onChoose, totalWithOil, disabled = false }: BoriOilOfferProps) {
  const saving = addOn.regularPrice - addOn.price;
  const frame = choice === "yes"
    ? "ring-2 ring-[#187d48] shadow-[0_14px_30px_-18px_rgba(24,125,72,0.6)]"
    : choice === "no"
      ? "ring-1 ring-[#d9cdb0]"
      : "ring-[1.5px] ring-[#d98e1f] shadow-[0_14px_30px_-18px_rgba(168,101,15,0.55)]";

  return (
    <div
      role="radiogroup"
      aria-labelledby="bori-oil-offer-question"
      className={`mt-4 overflow-hidden rounded-[20px] bg-white text-center text-[#19382d] transition-shadow [font-family:'Noto_Sans_Bengali','Hind_Siliguri',sans-serif] ${frame}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-b-xl bg-[#19382d] px-3.5 py-1 text-[12.5px] font-bold text-[#f5c456]">
        <Star className="size-3.5 fill-current" aria-hidden="true" />
        বিশেষ অফার · শুধু এই অর্ডারে
      </span>
      <h4 id="bori-oil-offer-question" className="px-4 pt-2 text-[19px] font-extrabold leading-snug sm:text-[21px]">
        বড়ির সাথে সরিষার তেল নেবেন?
      </h4>

      <div className="relative mx-2.5 mt-3 h-[150px] overflow-hidden rounded-[14px] sm:mx-3.5 sm:h-[168px]">
        <img src={COOKING_PHOTO} alt="সরিষার তেলে কুমড়ো বড়ি ভাজা হচ্ছে" className="size-full object-cover" loading="lazy" decoding="async" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-black/35" />
        {addOn.imageUrl ? (
          <span className="absolute bottom-2.5 right-2.5 h-24 w-[74px] overflow-hidden rounded-xl border-[2.5px] border-white bg-[#efefef] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.55)]">
            <img src={addOn.imageUrl} alt={`${addOn.name} ${addOn.label}`} className="size-full scale-[1.55] object-cover" loading="lazy" decoding="async" />
          </span>
        ) : null}
      </div>

      <p className="mt-3.5 px-4">
        <span className="block text-[14.5px] font-bold text-[#a8650f]">কাঠের ঘানির</span>
        <span className="block text-[19px] font-extrabold leading-snug sm:text-[21px]">কোল্ড প্রেসড সরিষার তেল</span>
      </p>
      <p className="mt-1.5 inline-flex items-center gap-1.5 text-[14.5px] font-bold text-[#e5672e] sm:text-[15.5px]">
        <Sparkles className="size-4" aria-hidden="true" />
        বড়ির স্বাদ আরও দ্বিগুণ করে দেয়
      </p>
      <ul className="mt-3 flex flex-wrap justify-center gap-1.5 px-3" aria-label="তেলের বিবরণ">
        <li className="inline-flex items-center gap-1 rounded-full bg-[#fff1cc] py-0.5 pl-2 pr-2.5 text-[12.5px] font-semibold text-[#6b5a2e]"><Droplet className="size-3 text-[#d98e1f]" aria-hidden="true" />{addOn.label}</li>
        <li className="inline-flex items-center gap-1 rounded-full bg-[#fff1cc] py-0.5 pl-2 pr-2.5 text-[12.5px] font-semibold text-[#6b5a2e]"><BadgeCheck className="size-3 text-[#d98e1f]" aria-hidden="true" />১০০% খাঁটি</li>
        <li className="inline-flex items-center gap-1 rounded-full bg-[#fff1cc] py-0.5 pl-2 pr-2.5 text-[12.5px] font-semibold text-[#6b5a2e]"><Leaf className="size-3 text-[#d98e1f]" aria-hidden="true" />দেশি সরিষা</li>
      </ul>
      <p className="mt-3.5 flex items-center justify-center gap-2.5">
        <span className="text-[34px] font-extrabold leading-none text-[#187d48]">{money(addOn.price)}</span>
        <span className="flex flex-col items-start leading-tight">
          <s className="text-[15px] font-medium text-[#8c8c80]"><span className="sr-only">আগের দাম </span>{money(addOn.regularPrice)}</s>
          <span className="mt-0.5 rounded-full bg-[#e5672e] px-2 text-[12.5px] font-bold text-white">{money(saving)} কম</span>
        </span>
      </p>

      <div className="flex flex-col gap-2 px-2.5 pt-4 sm:px-3.5">
        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[10px] border border-[#c8b98f] bg-white px-4 text-left text-[16.5px] font-bold transition-colors has-[:checked]:border-[#19382d] has-[:checked]:bg-[#e8f5ed] has-[:checked]:ring-1 has-[:checked]:ring-[#19382d] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#19382d]">
          <input type="radio" name="bori-oil-offer" value="yes" checked={choice === "yes"} disabled={disabled} onChange={() => onChoose("yes")} className="size-[22px] shrink-0 accent-[#19382d]" />
          <span>হ্যাঁ, তেল নেব</span>
          <span className="ml-auto font-extrabold text-[#187d48]">+ {money(addOn.price)}</span>
        </label>
        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[10px] border border-[#c8b98f] bg-white px-4 text-left text-[16.5px] font-bold transition-colors has-[:checked]:border-[#19382d] has-[:checked]:ring-1 has-[:checked]:ring-[#19382d] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#19382d]">
          <input type="radio" name="bori-oil-offer" value="no" checked={choice === "no"} disabled={disabled} onChange={() => onChoose("no")} className="size-[22px] shrink-0 accent-[#19382d]" />
          <span>না, শুধু বড়ি</span>
          <span className="ml-auto font-semibold text-[#9a9384]">৳0</span>
        </label>
      </div>

      <p className="flex min-h-4 items-center justify-center gap-1.5 px-3.5 pb-4 pt-3 text-sm font-bold" aria-live="polite">
        {choice === "yes" ? (
          <span className="inline-flex items-center gap-1.5 text-[#187d48]">
            <CircleCheck className="size-4" aria-hidden="true" />
            তেলসহ সর্বমোট {totalWithOil === null ? "—" : money(totalWithOil)}
          </span>
        ) : choice === "no" ? (
          <span className="font-semibold text-[#55655d]">ঠিক আছে, শুধু বড়ি পাঠানো হবে</span>
        ) : null}
      </p>
    </div>
  );
}
