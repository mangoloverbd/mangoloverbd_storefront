import { AnimatePresence, motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronDown, ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { TestimonialsSection } from "@/components/ui/testimonials-3";
import { demoReviews } from "@/features/kalojira-mixed/content";

import {
  faqAnswers,
  faqHeading,
  faqQuestions,
  finalCtaText,
  heroEyebrow,
  heroHeadline,
  heroSubcopy,
  heroTrustPoints,
  importantNotes,
  ingredients,
  nutritionGroups,
  nutritionHeading,
  nutritionistCredentials,
  nutritionistHeading,
  nutritionistName,
  nutritionistStatement,
  nutritionStory,
  nutritionStoryHeading,
  qualityHeading,
  qualityPoints,
  servingHeading,
  servingNote,
  servingPoints,
} from "./content";

type DocumentarySectionsProps = { onOrderClick: (placement: string) => void };

function OrderButton({ placement, label, onOrderClick, className = "" }: { placement: string; label: string; onOrderClick: (placement: string) => void; className?: string }) {
  return <button type="button" onClick={() => onOrderClick(placement)} className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#d99a2b] px-6 py-3 text-base font-bold text-[#3d211a] transition-transform hover:-translate-y-0.5 hover:bg-[#efbd55] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3d211a] ${className}`}>{label}<span aria-hidden="true">↓</span></button>;
}

function SectionIntro({ label, heading, description, light = false }: { label: string; heading: string; description?: string; light?: boolean }) {
  return <div className="mx-auto max-w-3xl text-center"><p className={`text-sm font-bold tracking-[0.14em] ${light ? "text-[#f0d2a0]" : "text-[#a16a12]"}`}>{label}</p><h2 className={`honey-nut-heading mt-3 text-3xl leading-tight tracking-[-0.04em] sm:text-5xl ${light ? "text-[#fff8ee]" : "text-[#3d211a]"}`}>{heading}</h2>{description ? <p className={`mx-auto mt-4 max-w-2xl text-base leading-7 ${light ? "text-[#fff8ee]/80" : "text-[#6c5145]"}`}>{description}</p> : null}</div>;
}

type RailPoint = { title: string; text: string; category?: string };
function EditorialPointRail({ points }: { points: readonly RailPoint[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const scrollPoints = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-point-card]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * (card?.offsetWidth ?? rail.clientWidth), behavior: reduceMotion ? "auto" : "smooth" });
  };
  return <div><ul ref={railRef} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 scroll-px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-9 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">{points.map((point, index) => <li key={point.title} data-point-card className="group min-w-[82%] snap-start border-y border-[#5b3b18]/20 py-4 transition-colors hover:border-[#d99a2b]/70 sm:min-w-0 sm:border-y-0 sm:border-t sm:py-5 lg:border-l lg:border-t-0 lg:pl-5 lg:first:border-l-0 lg:first:pl-0"><span className="block font-serif text-5xl font-medium leading-none tracking-[-0.08em] text-[#d99a2b]/70 sm:text-6xl">{String(index + 1).padStart(2, "0")}</span><h3 className="honey-nut-heading mt-5 max-w-[15rem] text-xl leading-tight text-[#3d211a] sm:text-2xl">{point.title}</h3>{point.category ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a16a12]">{point.category}</p> : null}<p className="mt-3 max-w-[17rem] text-[13px] leading-6 text-[#654b2f] sm:text-sm sm:leading-7">{point.text}</p></li>)}</ul><div className="mt-3 flex justify-end gap-2 sm:hidden"><button type="button" aria-label="আগের কার্ড" onClick={() => scrollPoints(-1)} className="flex size-10 items-center justify-center border border-[#3d211a] text-[#3d211a] focus-visible:outline-2 focus-visible:outline-offset-2"><ChevronLeft className="size-5" aria-hidden="true" /></button><button type="button" aria-label="পরের কার্ড" onClick={() => scrollPoints(1)} className="flex size-10 items-center justify-center border border-[#3d211a] bg-[#3d211a] text-[#fffaf0] focus-visible:outline-2 focus-visible:outline-offset-2"><ChevronRight className="size-5" aria-hidden="true" /></button></div></div>;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return <div className="border-b border-[#3d211a]/12 last:border-0"><h3><button type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpen((value) => !value)} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-semibold text-[#3d211a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99a2b]"><span>{question}</span><ChevronDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" /></button></h3><AnimatePresence initial={false}>{open ? <motion.div id={answerId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden"><p className="pb-4 text-sm leading-6 text-[#6c5145]">{answer}</p></motion.div> : null}</AnimatePresence></div>;
}

const HONEY_NUT_GALLERY = [
  { src: "/step/honey-nut/honey-nut-gallery-open-jar-v1.webp", alt: "খোলা জারে Honey Nut" },
  { src: "/step/honey-nut/honey-nut-gallery-spoon-v1.webp", alt: "চামচে Honey Nut" },
  { src: "/step/honey-nut/honey-nut-gallery-mix-v1.webp", alt: "Honey Nut-এর বাদাম ও বীজের close-up" },
] as const;

export function ProductGallery() {
  const [activeImage, setActiveImage] = useState(0);
  const [galleryRef, galleryApi] = useEmblaCarousel({ align: "start", containScroll: false, loop: false });
  useEffect(() => {
    if (!galleryApi) return;
    const syncActiveImage = () => setActiveImage(galleryApi.selectedScrollSnap());
    galleryApi.scrollTo(0, true);
    syncActiveImage();
    galleryApi.on("select", syncActiveImage);
    galleryApi.on("reInit", syncActiveImage);
    return () => { galleryApi.off("select", syncActiveImage); galleryApi.off("reInit", syncActiveImage); };
  }, [galleryApi]);
  return <section aria-labelledby="honey-nut-gallery-heading" className="bg-[#f7efe2] px-4 py-4 md:px-16 md:py-10 xl:px-20"><div className="mx-auto max-w-[1080px]"><h2 id="honey-nut-gallery-heading" className="sr-only">Honey Nut-এর ছবি</h2><div className="md:hidden"><div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[8px] bg-[#f6f6f6]"><div ref={galleryRef} className="h-full cursor-grab overflow-hidden active:cursor-grabbing"><div className="flex h-full touch-pan-y">{HONEY_NUT_GALLERY.map((image) => <div key={image.src} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"><img src={image.src} alt={image.alt} width="1080" height="1080" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover object-center" loading="lazy" /></div>)}</div></div><div className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">{HONEY_NUT_GALLERY.map((image, index) => <button key={image.src} type="button" onClick={() => galleryApi?.scrollTo(index)} aria-label={`Honey Nut-এর ছবি ${index + 1}`} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border-2 bg-white shadow-md transition-opacity ${activeImage === index ? "border-black opacity-100" : "border-white/70 opacity-70 hover:opacity-100"}`}><img src={image.src} alt="" className="h-full w-full object-cover object-center" /></button>)}</div></div></div><div className="hidden md:block"><div className="overflow-hidden rounded-[8px] bg-[#f6f6f6]"><img src={HONEY_NUT_GALLERY[0].src} alt={HONEY_NUT_GALLERY[0].alt} width="1080" height="720" className="h-auto w-full object-cover object-center" loading="lazy" /></div><div className="mt-3 grid grid-cols-2 gap-3">{HONEY_NUT_GALLERY.slice(1).map((image) => <div key={image.src} className="group overflow-hidden rounded-[8px] bg-[#f6f6f6]"><img src={image.src} alt={image.alt} width="540" height="360" loading="lazy" className="h-auto w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]" /></div>)}</div></div></div></section>;
}

export function DocumentarySections({ onOrderClick }: DocumentarySectionsProps) {
  return <>
    <section aria-labelledby="honey-nut-hero-heading"><div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-4 sm:px-6 sm:py-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-12"><div className="order-1"><p className="text-sm font-bold text-[#a16a12]">{heroEyebrow}</p><h1 id="honey-nut-hero-heading" className="honey-nut-heading mt-4 text-4xl leading-[1.05] tracking-[-0.06em] text-[#3d211a] sm:text-6xl">{heroHeadline}</h1><p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[#5b793e]">{heroSubcopy}</p><ul className="mt-5 space-y-2 text-sm font-semibold text-[#654b2f]">{heroTrustPoints.map((point) => <li key={point}>✓ {point}</li>)}</ul><OrderButton placement="hero" label="Honey Nut সম্পর্কে আরও জানুন" onOrderClick={onOrderClick} className="mt-6 w-full sm:w-auto" /></div><div className="order-2"><img src="/step/honey-nut/honey-nut-hero-v1.webp" alt="Honey Nut-এর premium jar" className="mx-auto h-auto w-full max-w-[560px] object-contain" width="1600" height="808" fetchPriority="high" decoding="async" /></div></div></section>

    <section aria-labelledby="honey-nut-nutrition-heading" className="bg-[#fffdf9] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl"><SectionIntro label="Nutrition highlight" heading={nutritionHeading} description="বিভিন্ন বাদাম ও বীজ একসঙ্গে—একাধিক পরিচিত খাদ্য উপাদান একই পরিবেশনে।" /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{nutritionGroups.map((group, index) => <article key={group.mark} className="rounded-[1.5rem] border border-[#3d211a]/12 bg-white p-5"><span className="grid size-12 place-items-center rounded-full bg-[#f0d2a0] text-lg font-bold text-[#3d211a]">{group.mark}</span><h2 id={index === 0 ? "honey-nut-nutrition-heading" : undefined} className="honey-nut-heading mt-5 text-xl text-[#3d211a]">{group.title}</h2><p className="mt-3 text-sm leading-6 text-[#6c5145]">{group.text}</p></article>)}</div><img src="/step/honey-nut/honey-nut-nutrition-flatlay-v1.webp" alt="আলাদা বাটিতে বাদাম, বীজ ও মধু" className="mt-8 h-56 w-full rounded-[1.5rem] object-cover object-center" width="1600" height="808" loading="lazy" /></div></section>

    <section aria-labelledby="honey-nut-ingredients-heading" className="border-b border-[#5b3b18]/25 bg-[#fbf4e8]"><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"><SectionIntro label="ভেতরে কী আছে, আগে সেটাই জানুন" heading="একটি জারে ৯টি নির্বাচিত উপাদান" description="আপনি কী খাচ্ছেন, তা পরিষ্কারভাবে জানুন।" /><h2 id="honey-nut-ingredients-heading" className="sr-only">Honey Nut-এর নয়টি উপাদান</h2><div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-3">{ingredients.map((ingredient) => <article key={ingredient.name} className="text-center"><div className="mx-auto aspect-square max-w-[170px] overflow-hidden rounded-full border-4 border-[#f0d2a0] bg-white shadow-sm"><img src={`/step/honey-nut/${ingredient.image}`} alt={ingredient.name} width="400" height="400" loading="lazy" className="h-full w-full object-cover" /></div><h3 className="honey-nut-heading mt-3 text-base text-[#3d211a] sm:text-xl">{ingredient.name}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#a16a12]">{ingredient.category}</p></article>)}</div></div></section>

    <section aria-labelledby="honey-nut-story-heading" className="bg-[#fff8ee] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><SectionIntro label="Ingredient nutrition story" heading={nutritionStoryHeading} /><h2 id="honey-nut-story-heading" className="sr-only">প্রতিটি উপাদানের ভূমিকা</h2><div className="mt-10"><EditorialPointRail points={nutritionStory} /></div></div></section>

    <section aria-labelledby="honey-nut-expert-heading" className="bg-[#f7efe2] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl"><div className="grid overflow-hidden rounded-[2rem] bg-[#3d211a] md:grid-cols-[0.8fr_1.2fr]"><div className="min-h-[25rem] bg-[#e6d8c4]"><img src="/step/honey-nut/honey-nut-nutritionist-murad-parvez-v1.webp" alt="পুষ্টিবিদ মুরাদ পারভেজ Honey Nut হাতে" className="h-full w-full object-cover object-center" width="680" height="850" loading="lazy" /></div><div className="flex flex-col justify-center p-7 text-[#fff8ee] sm:p-12"><p className="text-sm font-bold text-[#f0d2a0]">Nutritionist Guided Product Concept</p><h2 id="honey-nut-expert-heading" className="honey-nut-heading mt-3 text-3xl sm:text-5xl">{nutritionistHeading}</h2><p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#f0d2a0]">{nutritionistName}{"\n"}{nutritionistCredentials}</p><blockquote className="mt-7 border-l-2 border-[#d99a2b] pl-5 text-base leading-8 text-[#fff8ee]/85">“{nutritionistStatement}”</blockquote><p className="mt-6 font-bold text-[#f0d2a0]">— {nutritionistName}</p></div></div></div></section>

    <section aria-labelledby="honey-nut-serving-heading" className="bg-[#fffdf9] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl"><SectionIntro label="Daily food routine" heading={servingHeading} description={servingNote} /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{servingPoints.map((point) => <article key={point.title} className="rounded-[1.5rem] bg-[#e8f1df] p-5"><h2 id={point.title === servingPoints[0].title ? "honey-nut-serving-heading" : undefined} className="honey-nut-heading text-xl text-[#3d211a]">{point.title}</h2><p className="mt-3 text-sm leading-6 text-[#6c5145]">{point.text}</p></article>)}</div><img src="/step/honey-nut/honey-nut-routine-v1.webp" alt="Honey Nut দৈনন্দিন খাবারে পরিবেশনের উদাহরণ" className="mt-8 h-56 w-full rounded-[1.5rem] object-cover object-center" width="1600" height="808" loading="lazy" /></div></section>

    <section aria-labelledby="honey-nut-quality-heading" className="bg-[#5b793e] px-4 py-8 text-[#fff8ee] sm:px-6 sm:py-12"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="text-sm font-bold text-[#f0d2a0]">Quality & packaging</p><h2 id="honey-nut-quality-heading" className="honey-nut-heading mt-3 text-3xl sm:text-5xl">{qualityHeading}</h2><ul className="mt-7 grid gap-3 sm:grid-cols-2">{qualityPoints.map((point) => <li key={point} className="rounded-xl border border-[#fff8ee]/20 bg-[#fff8ee]/10 px-4 py-3 text-sm font-semibold">✓ {point}</li>)}</ul></div><img src="/step/honey-nut/honey-nut-quality-packaging-v1.webp" alt="Honey Nut jar ও packaging" className="h-auto max-h-[480px] w-full rounded-[1.5rem] object-cover" width="1254" height="1254" loading="lazy" /></div></section>

    <section aria-labelledby="honey-nut-reviews-heading" className="border-b border-[#5b3b18]/25 bg-[#fbf4e8] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><SectionIntro label="ক্রেতাদের অভিজ্ঞতা" heading="যারা ব্যবহার করছেন, তাদের কথা" /><h2 id="honey-nut-reviews-heading" className="sr-only">Honey Nut customer reviews</h2><TestimonialsSection testimonials={demoReviews.map((review) => ({ quote: review.text, name: review.name, role: "Honey Nut", company: "ম্যাংগো লাভার" }))} className="mt-12" /></div></section>

    <section aria-labelledby="honey-nut-faq-heading" className="bg-[#fff8ee] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><SectionIntro label="অর্ডারের আগে" heading={faqHeading} /><div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-[1.5rem] border border-[#3d211a]/12 bg-white px-5">{faqQuestions.map((question, index) => <FaqItem key={question} question={question} answer={faqAnswers[index]} />)}</div><aside className="rounded-[1.5rem] bg-[#3d211a] p-6 text-[#fff8ee]"><h2 className="honey-nut-heading text-2xl">মনে রাখুন</h2><ul className="mt-5 space-y-3">{importantNotes.map((note) => <li key={note} className="flex gap-3 text-sm leading-6 text-[#fff8ee]/80"><TriangleAlert className="mt-1 size-4 shrink-0 text-[#f0d2a0]" aria-hidden="true" />{note}</li>)}</ul></aside></div><div className="mt-8 text-center"><OrderButton placement="content_bottom" label="Honey Nut অর্ডার করুন" onOrderClick={onOrderClick} /></div></div></section>

    <section aria-labelledby="honey-nut-final-heading" className="bg-[#d99a2b] px-4 py-12 text-center sm:px-6 sm:py-16"><div className="mx-auto max-w-3xl"><h2 id="honey-nut-final-heading" className="honey-nut-heading text-3xl leading-tight text-[#3d211a] sm:text-5xl">{finalCtaText}</h2><p className="mt-5 text-base leading-8 text-[#3d211a]/80">বাদাম, বীজ, কিসমিস ও লিচুফুলের মধুর সমন্বয়ে তৈরি Honey Nut আপনার দৈনন্দিন খাবারে নতুন স্বাদ ও বৈচিত্র্য যোগ করতে পারে।</p><OrderButton placement="final_cta" label="এখনই অর্ডার করুন" onOrderClick={onOrderClick} className="mt-7 bg-[#3d211a] text-[#fff8ee] hover:bg-[#5b3b18]" /></div></section>
  </>;
}
