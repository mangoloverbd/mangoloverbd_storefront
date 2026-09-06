import { MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";

import mangoLoverLogo from "@assets/mango-lover-logo.avif";

import {
  HONEY_CAMPAIGN_PHONE_HREF,
  HONEY_CAMPAIGN_PHONE_NUMBER,
  HONEY_CAMPAIGN_WHATSAPP_HREF,
} from "./content";
import { trackHoneyCampaignEvent } from "./tracking";

function ContactLink({
  href,
  label,
  placement,
  event,
  className,
  children,
}: {
  href: string;
  label: string;
  placement: string;
  event: "phone_click" | "whatsapp_click";
  className?: string;
  children: ReactNode;
}) {
  const external = event === "whatsapp_click";
  return (
    <a
      href={href}
      aria-label={label}
      onClick={() => trackHoneyCampaignEvent(event, { placement })}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function CampaignHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e2d3ac] bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="/step/sundarbans-natural-honey"
          aria-label="ম্যাংগো লাভার সুন্দরবন মধু পেজ"
          className="flex min-h-11 min-w-11 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19382d]"
        >
          <img
            src={mangoLoverLogo}
            alt="ম্যাংগো লাভার"
            className="h-10 w-auto"
            decoding="async"
          />
        </a>
        <nav aria-label="যোগাযোগ" className="flex items-center gap-2">
          <ContactLink
            href={HONEY_CAMPAIGN_PHONE_HREF}
            label="ফোনে অর্ডার করুন"
            placement="header"
            event="phone_click"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[#285240] bg-white px-3 py-2 text-sm font-semibold text-[#19382d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19382d]"
          >
            <Phone className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">কল করুন</span>
          </ContactLink>
          <ContactLink
            href={HONEY_CAMPAIGN_WHATSAPP_HREF}
            label="WhatsApp-এ অর্ডার করুন"
            placement="header"
            event="whatsapp_click"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#187d48] px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b4c2a]"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </ContactLink>
        </nav>
      </div>
    </header>
  );
}

export function CampaignFooter() {
  return (
    <footer className="border-t border-[#e2d3ac] bg-[#19382d] text-[#fffaf0]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src={mangoLoverLogo}
            alt=""
            className="h-9 w-auto rounded-md bg-[#fffaf0] p-1"
            loading="lazy"
            decoding="async"
          />
          <p className="text-sm leading-6">
            ম্যাংগো লাভার — সুন্দরবনের প্রাকৃতিক চাকের মধু
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <a
            href={HONEY_CAMPAIGN_PHONE_HREF}
            aria-label="ফোনে অর্ডার করুন"
            onClick={() => trackHoneyCampaignEvent("phone_click", { placement: "footer" })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#fffaf0]/40 px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c456]"
          >
            <Phone className="size-4" aria-hidden="true" />
            {HONEY_CAMPAIGN_PHONE_NUMBER}
          </a>
          <a
            href={HONEY_CAMPAIGN_WHATSAPP_HREF}
            aria-label="WhatsApp-এ অর্ডার করুন"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackHoneyCampaignEvent("whatsapp_click", { placement: "footer" })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#187d48] px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c456]"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
