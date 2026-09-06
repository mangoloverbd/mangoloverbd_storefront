import { CheckCircle2, TriangleAlert } from "lucide-react";

import {
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
  waysToEnjoyHeading,
  waysToEnjoyNote,
  waysToEnjoyPoints,
  whoCanConsumeHeading,
  whoCanConsumePoints,
  whyMangoLoverHeading,
  whyMangoLoverPoints,
  whySpecialHeading,
  whySpecialPoints,
  type HoneyNarrativePoint,
} from "./content";

type DocumentarySectionsProps = {
  productImageUrl: string | null;
  onOrderClick: (placement: string) => void;
};

function OrderButton({
  placement,
  label,
  onOrderClick,
  variant = "primary",
}: {
  placement: string;
  label: string;
  onOrderClick: (placement: string) => void;
  variant?: "primary" | "outline" | "highlight";
}) {
  return (
    <button
      type="button"
      onClick={() => onOrderClick(placement)}
      className={
        variant === "highlight"
          ? "inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD60A] px-8 py-3 text-lg font-bold text-[#19382d] shadow-[0_6px_20px_rgba(25,56,45,0.35)] ring-2 ring-[#19382d]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19382d]"
          : variant === "primary"
          ? "inline-flex min-h-12 items-center justify-center rounded-xl bg-[#19382d] px-8 py-3 text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19382d]"
          : "inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[#19382d] px-8 py-3 text-lg font-bold text-[#19382d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19382d]"
      }
    >
      {label}
    </button>
  );
}

function PointList({ points }: { points: HoneyNarrativePoint[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {points.map((point) => (
        <li
          key={point.title}
          className="flex gap-3 rounded-2xl border border-[#e2d3ac] bg-white/70 p-4"
        >
          <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#285240]" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-[#19382d]">{point.title}</h3>
            <p className="mt-1 leading-7 text-[#4a3a26]">{point.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DocumentarySections({ productImageUrl, onOrderClick }: DocumentarySectionsProps) {
  return (
    <>
      <section aria-labelledby="honey-hero-heading" className="relative overflow-hidden bg-gradient-to-b from-[#f2a200] via-[#f6b90c] to-[#f4ecd9] text-[#3d2800]">
        <img
          src="/step/sundarbans-natural-honey/sundarbans-honeycomb-hero-v1.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
          fetchPriority="high"
          decoding="async"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#f2a200]/40 via-transparent to-[#f4ecd9]"
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-[#6b3d00]">{heroEyebrow}</p>
            <h2
              id="honey-hero-heading"
              className="mt-3 max-w-xl text-balance text-3xl font-bold leading-snug sm:text-4xl"
            >
              {heroHeadline}
            </h2>
            <p className="mt-4 max-w-lg font-medium leading-8 text-[#4a2f00]">{heroSubcopy}</p>
            <div className="mt-8">
              <OrderButton
                placement="hero"
                label="এখনই অর্ডার করুন"
                variant="highlight"
                onOrderClick={onOrderClick}
              />
            </div>
          </div>
          {productImageUrl ? (
            <div className="mx-auto hidden w-full max-w-sm overflow-hidden rounded-3xl bg-[#fffaf0]/95 p-4 shadow-xl lg:block">
              <img
                src={productImageUrl}
                alt="সুন্দরবনের প্রাকৃতিক চাকের মধুর বোতল"
                className="aspect-[4/5] w-full rounded-2xl object-contain"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="honey-why-heading" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 id="honey-why-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
          {whySpecialHeading}
        </h2>
        <div className="mt-6">
          <PointList points={whySpecialPoints} />
        </div>
      </section>

      <section
        aria-labelledby="honey-who-heading"
        className="border-y border-[#e2d3ac] bg-[#fffaf0]"
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 id="honey-who-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
            {whoCanConsumeHeading}
          </h2>
          <p className="mt-3 leading-7 text-[#654b2f]">
            বয়স ও শারীরিক অবস্থা অনুযায়ী পরিমিত পরিমাণে—পরিবারের প্রায় সবাই খেতে পারেন।
          </p>
          <div className="mt-6">
            <PointList points={whoCanConsumePoints} />
          </div>
        </div>
      </section>

      <section aria-labelledby="honey-ways-heading" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 id="honey-ways-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
          {waysToEnjoyHeading}
        </h2>
        <div className="mt-6">
          <PointList points={waysToEnjoyPoints} />
        </div>
        <p className="mt-4 leading-7 text-[#654b2f]">{waysToEnjoyNote}</p>
        <div className="mt-6">
          <OrderButton placement="content_mid" label="অর্ডার করুন" onOrderClick={onOrderClick} />
        </div>
      </section>

      <section
        aria-labelledby="honey-journey-heading"
        className="border-y border-[#e2d3ac] bg-[#19382d] text-[#fffaf0]"
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 id="honey-journey-heading" className="text-2xl font-bold sm:text-3xl">
            {journeyHeading}
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {journeyStages.map((stage, index) => (
              <li key={stage.title} className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-bold tracking-[0.16em] text-[#f5c456]">
                  ধাপ {index + 1}
                </p>
                <h3 className="mt-2 font-bold">{stage.title}</h3>
                <p className="mt-2 leading-7 text-[#f4ecd9]">{stage.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="honey-nutritionist-heading"
        className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
      >
        <h2 id="honey-nutritionist-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
          {nutritionistHeading}
        </h2>
        <figure className="mt-6 rounded-3xl border border-[#e2d3ac] bg-[#fffaf0] p-6 sm:p-8">
          <blockquote className="leading-8 text-[#4a3a26]">{nutritionistStatement}</blockquote>
          <figcaption className="mt-4 font-bold text-[#19382d]">— {nutritionistName}</figcaption>
        </figure>
      </section>

      <section
        aria-labelledby="honey-why-brand-heading"
        className="border-y border-[#e2d3ac] bg-[#fffaf0]"
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 id="honey-why-brand-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
            {whyMangoLoverHeading}
          </h2>
          <div className="mt-6">
            <PointList points={whyMangoLoverPoints} />
          </div>
          <div className="mt-6">
            <OrderButton placement="content_bottom" label="অর্ডার করুন" onOrderClick={onOrderClick} />
          </div>
        </div>
      </section>

      {/* Customer reviews intentionally omitted: no genuine reviews supplied yet,
          and shipping without them needs explicit stakeholder approval (see
          honeyReviewsShipGate in content.ts and ATTRIBUTION.md). */}

      <section
        aria-labelledby="honey-notes-heading"
        className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
      >
        <h2 id="honey-notes-heading" className="text-2xl font-bold text-[#19382d] sm:text-3xl">
          {importantNotesHeading}
        </h2>
        <ul className="mt-6 space-y-3">
          {importantNotes.map((note) => (
            <li
              key={note.text}
              className={
                note.tone === "warning"
                  ? "flex gap-3 rounded-2xl border border-[#b8872c] bg-[#fff7df] p-4"
                  : "flex gap-3 rounded-2xl border border-[#e2d3ac] bg-white/70 p-4"
              }
            >
              <TriangleAlert
                className={
                  note.tone === "warning"
                    ? "mt-1 size-5 shrink-0 text-[#936514]"
                    : "mt-1 size-5 shrink-0 text-[#285240]"
                }
                aria-hidden="true"
              />
              <p className="leading-7 text-[#4a3a26]">{note.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
