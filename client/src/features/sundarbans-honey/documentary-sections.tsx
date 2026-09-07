import { TriangleAlert } from "lucide-react";

import {
  collectionReelHeading,
  collectionReelSubcopy,
  comparisonHeading,
  faqHeading,
  faqQuestions,
  featuredPacksHeading,
  featuredPacksSubcopy,
  founderHeading,
  founderSubcopy,
  heroCtaLabel,
  heroEyebrow,
  heroHeadline,
  heroSubcopy,
  importantNotes,
  importantNotesHeading,
  journeyHeading,
  journeyStages,
  nutritionistHeading,
  nutritionistName,
  nutritionistStatement,
  reviewSlotLabel,
  trustRibbonItems,
  waysToEnjoyHeading,
  waysToEnjoyNote,
  waysToEnjoyPoints,
  whoCanConsumeHeading,
  whoCanConsumePoints,
  whyMangoLoverHeading,
  whyMangoLoverPoints,
  whySpecialHeading,
  whySpecialLead,
  whySpecialPoints,
  type HoneyNarrativePoint,
} from "./content";
import type { HoneyPackOption } from "./order";

type DocumentarySectionsProps = {
  productImageUrl: string | null;
  packOptions: HoneyPackOption[];
  onOrderClick: (placement: string) => void;
};

function OrderButton({
  placement,
  label,
  onOrderClick,
}: {
  placement: string;
  label: string;
  onOrderClick: (placement: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOrderClick(placement)}
      className="inline-flex min-h-12 items-center justify-between gap-6 border border-[#19382d] bg-[#ffd60a] px-5 py-3 text-base font-bold text-[#19382d] shadow-[3px_3px_0_#19382d] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d]"
    >
      <span>{label}</span>
      <span aria-hidden="true" className="text-xl leading-none">→</span>
    </button>
  );
}

function DetailsLink() {
  return (
    <a
      href="#honey-collection-reel"
      className="inline-flex min-h-12 items-center justify-between gap-6 border border-[#19382d] bg-[#ffd60a] px-5 py-3 text-base font-bold text-[#19382d] shadow-[3px_3px_0_#19382d] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d]"
    >
      <span>{heroCtaLabel}</span>
      <span aria-hidden="true" className="text-xl leading-none">→</span>
    </a>
  );
}

function SectionHeading({ label, heading, description }: {
  label: string;
  heading: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-6 pt-12 text-center sm:px-6 sm:pt-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a711c]">{label}</p>
      <h2 className="mt-3 text-balance font-serif text-3xl font-medium leading-tight tracking-[-0.04em] text-[#19382d] sm:text-5xl">
        {heading}
      </h2>
      {description ? <p className="mx-auto mt-4 max-w-xl leading-7 text-[#654b2f]">{description}</p> : null}
    </div>
  );
}

function PointList({ points }: { points: HoneyNarrativePoint[] }) {
  return (
    <ul className="divide-y divide-[#19382d]/25 border-y border-[#19382d]/25">
      {points.map((point) => (
        <li key={point.title} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-6">
          <h3 className="font-serif text-xl font-medium text-[#19382d]">{point.title}</h3>
          <p className="leading-7 text-[#654b2f]">{point.text}</p>
        </li>
      ))}
    </ul>
  );
}

function MediaSlot({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      data-media-slot={label}
      className={dark
        ? "grid min-h-64 place-items-center bg-[#a9c3b5] p-6 text-center text-[#19382d] sm:min-h-80"
        : "grid min-h-64 place-items-center bg-[#bdd2c8] p-6 text-center text-[#19382d] sm:min-h-80"}
    >
      <div className="border border-[#19382d] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em]">
        {label}
      </div>
    </div>
  );
}

function PackCard({ pack, active }: { pack: HoneyPackOption; active: boolean }) {
  return (
    <article className={active
      ? "border-2 border-[#19382d] bg-[#ffd60a] p-4"
      : "border border-[#19382d]/25 bg-[#fffdf8] p-4"}
    >
      <div className="grid min-h-24 place-items-center bg-[#f1eee7] text-center">
        <span className="font-serif text-2xl text-[#19382d]">{pack.label}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#19382d]">{pack.label}</h3>
          <p className="mt-1 text-sm text-[#654b2f]">{active ? "সবচেয়ে সহজ শুরু" : "পরিবারের জন্য"}</p>
        </div>
        <strong className="text-lg text-[#19382d]">৳{pack.unitPrice.toLocaleString("en-BD")}</strong>
      </div>
    </article>
  );
}

export function DocumentarySections({ productImageUrl, packOptions, onOrderClick }: DocumentarySectionsProps) {
  return (
    <>
      <section aria-labelledby="honey-hero-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8] text-[#19382d]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a711c]">{heroEyebrow}</p>
          <p className="mt-5 text-xs tracking-wide text-[#9a711c]">{reviewSlotLabel}</p>
          <h2 id="honey-hero-heading" className="mx-auto mt-4 max-w-3xl text-balance font-serif text-4xl font-medium leading-[0.98] tracking-[-0.06em] sm:text-6xl">
            {heroHeadline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#654b2f]">{heroSubcopy}</p>
          <div className="mt-6"><DetailsLink /></div>
          {productImageUrl ? (
            <div className="mx-auto mt-7 h-80 max-w-lg sm:h-[26rem]">
              <img
                src={productImageUrl}
                alt="সুন্দরবনের প্রাকৃতিক চাকের মধুর বোতল"
                className="h-full w-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section aria-label="ম্যাংগো লাভারের প্রতিশ্রুতি" className="grid border-b border-[#19382d]/25 bg-[#19382d] text-[#fffaf0] sm:grid-cols-3">
        {trustRibbonItems.map((item) => (
          <div key={item.title} className="border-b border-[#fffaf0]/25 px-5 py-4 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <strong className="block font-serif text-lg font-medium">{item.title}</strong>
            <span className="mt-1 block text-xs text-[#f4ecd9]">{item.text}</span>
          </div>
        ))}
      </section>

      <section id="honey-collection-reel" aria-labelledby="honey-collection-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading label="বন থেকে বোতল পর্যন্ত" heading={collectionReelHeading} description={collectionReelSubcopy} />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16">
          <MediaSlot label="আপনার বাস্তব collection reel এখানে যুক্ত হবে" />
          <p id="honey-collection-heading" className="sr-only">{collectionReelHeading}</p>
        </div>
      </section>

      <section aria-labelledby="honey-packs-heading" className="border-b border-[#19382d]/25 bg-[#f5eff5]">
        <SectionHeading label="আপনার জন্য প্যাক বেছে নিন" heading={featuredPacksHeading} description={featuredPacksSubcopy} />
        <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16">
          {packOptions.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {packOptions.map((pack, index) => <PackCard key={pack.variantId} pack={pack} active={index === 0} />)}
            </div>
          ) : (
            <p className="border-y border-[#19382d]/25 py-6 text-center text-[#654b2f]">প্যাকের তথ্য লোড হচ্ছে।</p>
          )}
          <p id="honey-packs-heading" className="sr-only">{featuredPacksHeading}</p>
          <div className="mt-7 text-center"><OrderButton placement="featured_packs" label="অর্ডার করুন" onOrderClick={onOrderClick} /></div>
          <p className="mt-4 text-center text-sm text-[#654b2f]">সারা বাংলাদেশে delivery ৳100 · কোনো অগ্রিম পেমেন্ট নেই</p>
        </div>
      </section>

      <section aria-labelledby="honey-why-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading label={whySpecialHeading} heading={whySpecialLead} />
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[0.85fr_1.3fr_0.85fr] lg:pb-16">
          <PointList points={whySpecialPoints.slice(0, 2)} />
          <div className="order-first grid min-h-72 place-items-center bg-[#bdd2c8] p-5 lg:order-none">
            {productImageUrl ? (
              <img
                src={productImageUrl}
                alt="সুন্দরবনের প্রাকৃতিক চাকের মধুর বোতল"
                className="h-72 w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
          <PointList points={whySpecialPoints.slice(2, 4)} />
        </div>
      </section>

      <section aria-labelledby="honey-founder-heading" className="grid border-b border-[#19382d]/25 bg-[#19382d] text-[#fffaf0] lg:grid-cols-2">
        <MediaSlot label="আপনার founder video / portrait এখানে যুক্ত হবে" dark />
        <div className="px-5 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f5c456]">ম্যাংগো লাভারের গল্প</p>
          <h2 id="honey-founder-heading" className="mt-4 max-w-xl text-balance font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">{founderHeading}</h2>
          <p className="mt-5 max-w-lg leading-8 text-[#f4ecd9]">{founderSubcopy}</p>
        </div>
      </section>

      <section aria-labelledby="honey-who-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8]">
        <SectionHeading label="পরিবারের জন্য" heading={whoCanConsumeHeading} description="বয়স ও শারীরিক অবস্থা অনুযায়ী পরিমিত পরিমাণে ব্যবহার করুন।" />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><h2 id="honey-who-heading" className="sr-only">{whoCanConsumeHeading}</h2><PointList points={whoCanConsumePoints} /></div>
      </section>

      <section aria-labelledby="honey-ways-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading label="দৈনন্দিন ব্যবহারে" heading={waysToEnjoyHeading} description={waysToEnjoyNote} />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><h2 id="honey-ways-heading" className="sr-only">{waysToEnjoyHeading}</h2><PointList points={waysToEnjoyPoints} /><div className="mt-7 text-center"><OrderButton placement="content_mid" label="অর্ডার করুন" onOrderClick={onOrderClick} /></div></div>
      </section>

      <section aria-labelledby="honey-journey-heading" className="border-b border-[#19382d]/25 bg-[#19382d] text-[#fffaf0]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f5c456]">সুন্দরবন থেকে আপনার ঘরে</p>
          <h2 id="honey-journey-heading" className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-5xl">{journeyHeading}</h2>
          <ol className="mt-8 grid gap-5 border-t border-[#fffaf0]/30 pt-5 sm:grid-cols-3">
            {journeyStages.map((stage, index) => <li key={stage.title}><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f5c456]">ধাপ {index + 1}</p><h3 className="mt-3 font-serif text-2xl font-medium">{stage.title}</h3><p className="mt-2 leading-7 text-[#f4ecd9]">{stage.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section aria-labelledby="honey-nutritionist-heading" className="border-b border-[#19382d]/25 bg-[#f5eff5]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a711c]">দায়িত্বশীল তথ্য</p>
          <h2 id="honey-nutritionist-heading" className="mt-3 font-serif text-3xl font-medium text-[#19382d] sm:text-5xl">{nutritionistHeading}</h2>
          <blockquote className="mt-7 border-l-2 border-[#e9aa22] pl-5 text-lg leading-8 text-[#654b2f]">{nutritionistStatement}</blockquote>
          <p className="mt-4 font-bold text-[#19382d]">— {nutritionistName}</p>
        </div>
      </section>

      <section aria-labelledby="honey-why-brand-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading label="স্বচ্ছতার সঙ্গে" heading={whyMangoLoverHeading} description={comparisonHeading} />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><h2 id="honey-why-brand-heading" className="sr-only">{whyMangoLoverHeading}</h2><PointList points={whyMangoLoverPoints} /><div className="mt-7 text-center"><OrderButton placement="content_bottom" label="অর্ডার করুন" onOrderClick={onOrderClick} /></div></div>
      </section>

      {/* Customer reviews intentionally omitted until genuine, approved reviews arrive. */}
      <section aria-labelledby="honey-faq-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8]">
        <SectionHeading label="আপনার প্রশ্নের উত্তর" heading={faqHeading} />
        <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16"><h2 id="honey-faq-heading" className="sr-only">{faqHeading}</h2><dl className="divide-y divide-[#19382d]/25 border-y border-[#19382d]/25">{faqQuestions.map((question) => <div key={question} className="flex items-center justify-between gap-5 py-5"><dt className="font-serif text-lg text-[#19382d]">{question}</dt><dd aria-hidden="true" className="text-2xl">+</dd></div>)}</dl></div>
      </section>

      <section aria-labelledby="honey-notes-heading" className="bg-[#fffdf8]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 id="honey-notes-heading" className="font-serif text-3xl font-medium text-[#19382d] sm:text-5xl">{importantNotesHeading}</h2>
          <ul className="mt-7 divide-y divide-[#19382d]/25 border-y border-[#19382d]/25">{importantNotes.map((note) => <li key={note.text} className="flex gap-3 py-4"><TriangleAlert className={note.tone === "warning" ? "mt-1 size-5 shrink-0 text-[#936514]" : "mt-1 size-5 shrink-0 text-[#285240]"} aria-hidden="true" /><p className="leading-7 text-[#654b2f]">{note.text}</p></li>)}</ul>
        </div>
      </section>
    </>
  );
}
