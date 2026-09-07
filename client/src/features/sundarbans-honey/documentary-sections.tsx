import { TriangleAlert } from "lucide-react";

import LogoCloudBlock from "@/components/ui/logo-cloud-3";
import {
  collectionReelHeading,
  collectionReelSubcopy,
  comparisonHeading,
  faqHeading,
  faqAnswers,
  faqQuestions,
  heroCtaLabel,
  heroSubcopy,
  importantNotes,
  importantNotesHeading,
  journeyHeading,
  journeyStages,
  nutritionistHeading,
  nutritionistName,
  nutritionistStatement,
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

type DocumentarySectionsProps = {
  onOrderClick: (placement: string) => void;
};

function OrderButton({
  placement,
  label,
  onOrderClick,
  className,
}: {
  placement: string;
  label: string;
  onOrderClick: (placement: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOrderClick(placement)}
      className={`inline-flex min-h-12 items-center justify-between gap-6 border border-[#19382d] bg-[#eab308] px-5 py-3 text-base font-bold text-[#19382d] shadow-[3px_3px_0_#19382d] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d] ${className ?? ""}`}
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
      className="inline-flex min-h-12 items-center justify-between gap-6 border border-[#19382d] bg-[#eab308] px-5 py-3 text-base font-bold text-[#19382d] shadow-[3px_3px_0_#19382d] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d]"
    >
      <span>{heroCtaLabel}</span>
      <span aria-hidden="true" className="text-xl leading-none">→</span>
    </a>
  );
}

function SectionHeading({ id, label, heading, description, headingImage }: {
  id: string;
  label: string;
  heading: string;
  description?: string;
  headingImage?: {
    src: string;
    alt: string;
  };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-6 pt-12 text-center sm:px-6 sm:pt-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a711c]">{label}</p>
      <h2 id={id} className="mt-3 text-balance font-serif text-3xl font-medium leading-tight tracking-[-0.04em] text-[#19382d] sm:text-5xl">
        {headingImage ? (
          <img
            src={headingImage.src}
            alt={headingImage.alt}
            className="mx-auto h-auto w-full mix-blend-multiply"
            width="2400"
            height="800"
            loading="lazy"
            decoding="async"
          />
        ) : heading}
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

export function DocumentarySections({ onOrderClick }: DocumentarySectionsProps) {
  return (
    <>
      <section aria-labelledby="honey-hero-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8] text-[#19382d]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16">
          <h2 id="honey-hero-heading" className="mx-auto mt-4 max-w-3xl">
            <img
              src="/step/sundarbans-natural-honey/sundarbans-honey-headline-v1.webp"
              alt="সুন্দরবনের প্রাকৃতিক চাকের মধু"
              className="h-auto w-full mix-blend-multiply"
              width="2400"
              height="800"
              fetchPriority="high"
              decoding="async"
            />
          </h2>
          <p className="mx-auto mt-0 max-w-2xl leading-8 text-[#654b2f]">{heroSubcopy}</p>
          <div className="mx-auto mt-1 w-[76%] max-w-sm overflow-hidden rounded-xl bg-[#fbf4e8]">
            <img
              src="/step/sundarbans-natural-honey/sundarbans-honey-hero-banner-v1.webp"
              alt=""
              aria-hidden="true"
              className="h-auto w-full mix-blend-multiply"
              width="2400"
              height="802"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="mt-3"><DetailsLink /></div>
          <div className="mx-auto mt-7 h-96 max-w-xl sm:h-[30rem]">
            <img
              src="/step/sundarbans-natural-honey/sundarbans-honey-hero-v2.webp"
              alt="সুন্দরবনের প্রাকৃতিক চাকের মধুর বোতল, মৌচাক ও মৌমাছি"
              className="h-full w-full object-contain"
              fetchPriority="high"
              decoding="async"
              width="1122"
              height="1402"
            />
          </div>
        </div>
      </section>

      <LogoCloudBlock items={trustRibbonItems} />

      <section id="honey-collection-reel" aria-labelledby="honey-collection-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading
          id="honey-collection-heading"
          label="বন থেকে বোতল পর্যন্ত"
          heading={collectionReelHeading}
          headingImage={{
            src: "/step/sundarbans-natural-honey/sundarbans-honey-collection-heading-v1.webp",
            alt: "বনের গল্প, বাস্তব ভিডিওতে",
          }}
          description={collectionReelSubcopy}
        />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16">
          <MediaSlot label="আপনার বাস্তব collection reel এখানে যুক্ত হবে" />
        </div>
      </section>

      <section aria-labelledby="honey-why-heading" className="bg-[#fffdf8]">
        <SectionHeading
          id="honey-why-heading"
          label={whySpecialHeading}
          heading={whySpecialLead}
          headingImage={{
            src: "/step/sundarbans-natural-honey/sundarbans-why-special-heading-v1.webp",
            alt: "বনের স্বাদ, প্রাকৃতিক বৈচিত্র্য, এক বোতলে।",
          }}
        />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16">
          <img
            src="/step/sundarbans-natural-honey/sundarbans-why-special-infographic-v2.webp"
            alt="সুন্দরবনের চাকের মধু কেন বিশেষ: সুন্দরবনের বন ও ফুল, স্বতন্ত্র স্বাদ ও ঘ্রাণ, প্রাকৃতিক শর্করায় শক্তি, প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট যৌগ, প্রতিদিনের ব্যবহারে সহজ"
            className="mx-auto h-auto w-full"
            width="1254"
            height="1254"
            loading="lazy"
            decoding="async"
          />
          <ul className="sr-only">
            {whySpecialPoints.map((point) => (
              <li key={point.title}>{point.title}: {point.text}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="honey-bundle-showcase" className="border-b border-[#19382d]/25 bg-[#fffdf7]">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-0 sm:px-6 sm:pb-16 sm:pt-0">
          <div className="mx-auto mt-0 grid max-w-4xl grid-cols-2 gap-3 sm:gap-5">
            <article className="rounded-[1.75rem] bg-transparent">
              <img
                src="/step/sundarbans-natural-honey/sundarbans-honey-bundle-500g-v2.webp"
                alt="সুন্দরবনের চাকের মধু ৫০০ গ্রামের প্যাক"
                className="mx-auto h-auto w-full"
                width="1024"
                height="1536"
                loading="lazy"
                decoding="async"
              />
              <div className="flex justify-center px-1 pb-3 sm:px-4 sm:pb-5">
                <OrderButton placement="bundle_500g" label="অর্ডার করুন" onOrderClick={onOrderClick} className="w-full justify-center gap-2 px-2 text-sm sm:w-auto sm:gap-6 sm:px-5 sm:text-base" />
              </div>
            </article>
            <article className="rounded-[1.75rem] bg-transparent">
              <img
                src="/step/sundarbans-natural-honey/sundarbans-honey-bundle-1kg-v2.webp"
                alt="সুন্দরবনের চাকের মধু ১ কেজির প্যাক"
                className="mx-auto h-auto w-full"
                width="1024"
                height="1536"
                loading="lazy"
                decoding="async"
              />
              <div className="flex justify-center px-1 pb-3 sm:px-4 sm:pb-5">
                <OrderButton placement="bundle_1kg" label="অর্ডার করুন" onOrderClick={onOrderClick} className="w-full justify-center gap-2 px-2 text-sm sm:w-auto sm:gap-6 sm:px-5 sm:text-base" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="honey-who-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8]">
        <SectionHeading id="honey-who-heading" label="পরিবারের জন্য" heading={whoCanConsumeHeading} description="বয়স ও শারীরিক অবস্থা অনুযায়ী পরিমিত পরিমাণে ব্যবহার করুন।" />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><PointList points={whoCanConsumePoints} /></div>
      </section>

      <section aria-labelledby="honey-ways-heading" className="border-b border-[#19382d]/25 bg-[#fffdf8]">
        <SectionHeading id="honey-ways-heading" label="দৈনন্দিন ব্যবহারে" heading={waysToEnjoyHeading} description={waysToEnjoyNote} />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><PointList points={waysToEnjoyPoints} /><div className="mt-7 text-center"><OrderButton placement="content_mid" label="অর্ডার করুন" onOrderClick={onOrderClick} /></div></div>
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
        <SectionHeading id="honey-why-brand-heading" label="স্বচ্ছতার সঙ্গে" heading={whyMangoLoverHeading} description={comparisonHeading} />
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16"><PointList points={whyMangoLoverPoints} /><div className="mt-7 text-center"><OrderButton placement="content_bottom" label="অর্ডার করুন" onOrderClick={onOrderClick} /></div></div>
      </section>

      {/* Customer reviews intentionally omitted until genuine, approved reviews arrive. */}
      <section aria-labelledby="honey-faq-heading" className="border-b border-[#19382d]/25 bg-[#fbf4e8]">
        <SectionHeading id="honey-faq-heading" label="আপনার প্রশ্নের উত্তর" heading={faqHeading} />
        <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16"><div className="divide-y divide-[#19382d]/25 border-y border-[#19382d]/25">{faqQuestions.map((question, index) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-serif text-lg text-[#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d]"><span>{question}</span><span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-4 leading-7 text-[#654b2f]">{faqAnswers[index]}</p></details>)}</div></div>
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
