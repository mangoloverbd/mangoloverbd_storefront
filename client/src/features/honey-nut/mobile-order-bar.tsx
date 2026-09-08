import { Phone } from "lucide-react";

import { HONEY_NUT_CAMPAIGN_PHONE_HREF, HONEY_NUT_CAMPAIGN_PHONE_NUMBER } from "./content";
import { trackHoneyNutCampaignEvent } from "./tracking";

export function MobileOrderBar({ onOrderClick }: { onOrderClick: () => void }) {
  return <div className="honey-nut-order-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-[#3d211a]/15 bg-[#fff8ee]/95 px-3 py-2 shadow-[0_-4px_16px_rgba(61,33,26,0.12)] backdrop-blur-md md:hidden"><button type="button" onClick={onOrderClick} className="h-12 flex-1 rounded-full bg-[#d99a2b] px-4 text-sm font-extrabold text-[#3d211a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d211a]">Honey Nut অর্ডার করুন</button><a href={HONEY_NUT_CAMPAIGN_PHONE_HREF} aria-label={`কল করুন ${HONEY_NUT_CAMPAIGN_PHONE_NUMBER}`} onClick={() => trackHoneyNutCampaignEvent("phone_click", { placement: "sticky_bar" })} className="grid size-12 shrink-0 place-items-center rounded-full border border-[#3d211a] text-[#3d211a] focus-visible:outline-2 focus-visible:outline-offset-2"><Phone className="size-5" aria-hidden="true" /></a></div>;
}
