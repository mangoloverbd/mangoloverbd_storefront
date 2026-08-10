import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronDown, SlidersHorizontal, Star } from "lucide-react";
import { useState } from "react";

const reviews = [
  {
    title: "Soft, glossy, and actually nourishing",
    body: "The tint looks polished without feeling heavy. My lips felt smoother through the day and the color made them look naturally fuller.",
    name: "Nadia H.",
    location: "Verified Buyer - Dhaka",
    product: "Peptide Lip Tint - Rosy Bloom",
    time: "3 hours ago",
    nourishing: "82%",
    fullness: "76%",
  },
  {
    title: "The daily lip product I keep in my bag",
    body: "It gives a clean shine and the shade looks elegant, not loud. My lips stayed comfortable even after coffee.",
    name: "Ayesha R.",
    location: "Verified Buyer - Gulshan",
    product: "Peptide Lip Tint - Mauve Nude",
    time: "7 hours ago",
    nourishing: "88%",
    fullness: "72%",
  },
  {
    title: "Fuller without looking overdone",
    body: "The gloss catches light beautifully. It makes my lips look smoother and a little more plush while still looking natural.",
    name: "Maliha S.",
    location: "Verified Buyer - Banani",
    product: "Peptide Lip Tint - Plum Veil",
    time: "1 day ago",
    nourishing: "80%",
    fullness: "84%",
  },
  {
    title: "The bundle feels very complete",
    body: "The makeup pen is quick and the tint finishes everything. It is exactly the kind of refined daily makeup I wanted.",
    name: "Sabrina K.",
    location: "Verified Buyer - Uttara",
    product: "Everyday Edit Bundle",
    time: "2 days ago",
    nourishing: "78%",
    fullness: "70%",
  },
  {
    title: "No sticky feeling",
    body: "I usually avoid gloss because of texture, but this feels smooth and lightweight. The hydration is the best part.",
    name: "Farah T.",
    location: "Verified Buyer - Dhanmondi",
    product: "Peptide Lip Tint - Rosy Bloom",
    time: "2 days ago",
    nourishing: "92%",
    fullness: "74%",
  },
  {
    title: "Looks expensive on the lips",
    body: "The finish is polished and soft. It gives my lips a healthy glow that works even with no foundation.",
    name: "Raisa M.",
    location: "Verified Buyer - Chattogram",
    product: "Peptide Lip Tint - Bordeaux",
    time: "3 days ago",
    nourishing: "84%",
    fullness: "78%",
  },
  {
    title: "Perfect office shade",
    body: "Mauve Nude is subtle but still visible. My lips looked fresh through the afternoon and did not feel dry.",
    name: "Tasnim A.",
    location: "Verified Buyer - Bashundhara",
    product: "Peptide Lip Tint - Mauve Nude",
    time: "4 days ago",
    nourishing: "86%",
    fullness: "68%",
  },
  {
    title: "I noticed smoother lines",
    body: "After applying it, my lip lines looked softer because of the shine and moisture. It photographs beautifully.",
    name: "Samira N.",
    location: "Verified Buyer - Sylhet",
    product: "Peptide Lip Tint - Plum Veil",
    time: "5 days ago",
    nourishing: "90%",
    fullness: "80%",
  },
  {
    title: "Clean girl makeup, but better",
    body: "The tint gives just enough color. Paired with the makeup pen, it makes getting ready very fast.",
    name: "Jarin P.",
    location: "Verified Buyer - Mirpur",
    product: "Makeup Pen + Peptide Tint",
    time: "6 days ago",
    nourishing: "76%",
    fullness: "66%",
  },
  {
    title: "The color is soft and flattering",
    body: "Rosy Bloom looks fresh without being too pink. It makes the lips look healthy and hydrated instantly.",
    name: "Muntaha Z.",
    location: "Verified Buyer - Khulna",
    product: "Peptide Lip Tint - Rosy Bloom",
    time: "1 week ago",
    nourishing: "85%",
    fullness: "73%",
  },
  {
    title: "Worth ordering again",
    body: "The formula feels more like care than makeup. I like that it gives shine without making my lips feel coated.",
    name: "Lamisa F.",
    location: "Verified Buyer - Narayanganj",
    product: "Peptide Lip Tint - Bordeaux",
    time: "1 week ago",
    nourishing: "87%",
    fullness: "75%",
  },
  {
    title: "Very elegant finish",
    body: "It is easy to wear and looks refined. I use it alone most days because it makes my lips look naturally better.",
    name: "Anika D.",
    location: "Verified Buyer - Rajshahi",
    product: "Peptide Lip Tint - Mauve Nude",
    time: "1 week ago",
    nourishing: "81%",
    fullness: "71%",
  },
];

function Stars({ size = "h-4 w-4" }: { size?: string }) {
  return (
    <div className="flex items-center gap-1 text-brand-gold">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star key={idx} className={`${size} fill-current stroke-[1px]`} />
      ))}
    </div>
  );
}

function RatingMeter({
  question,
  left,
  right,
  value,
}: {
  question: string;
  left: string;
  right: string;
  value: string;
}) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] uppercase tracking-[0.28em] font-bold text-black/70">
        {question}
      </h4>
      <div className="relative h-3 border border-black/45">
        <span className="absolute inset-y-0 left-1/4 w-px bg-black/35" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-black/35" />
        <span className="absolute inset-y-0 left-3/4 w-px bg-black/35" />
        <span
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-brand-gold shadow-[0_0_0_4px_rgba(197,160,89,0.16)]"
          style={{ left: value }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-black/45 md:text-xs">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

function ReviewArticle({ review, index }: { review: (typeof reviews)[number]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, delay: index < 3 ? index * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-black/10 px-5 py-8 last:border-b-0 md:px-10 md:py-10"
    >
      <div className="mb-6 flex items-start justify-between gap-5">
        <div>
          <Stars size="h-5 w-5 md:h-6 md:w-6" />
          <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-black md:text-3xl">
            {review.title}
          </h3>
        </div>
        <span className="shrink-0 text-right text-[10px] uppercase tracking-[0.28em] font-medium text-black/35">
          {review.time}
        </span>
      </div>

      <p className="max-w-2xl text-base leading-8 tracking-[0.05em] text-black/60 md:text-lg">
        {review.body}
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <RatingMeter
          question="How nourishing is this product?"
          left="Light care"
          right="Super nourishing"
          value={review.nourishing}
        />
        <RatingMeter
          question="How natural does the fuller look feel?"
          left="Barely visible"
          right="Noticeably refined"
          value={review.fullness}
        />
      </div>

      <div className="mt-10 grid gap-6 border-t border-black/10 pt-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.35em] font-bold text-black">
            {review.name}
          </h4>
          <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] font-bold text-black/45">
            {review.location}
            <CheckCircle className="h-4 w-4 fill-brand-gold text-brand-ivory" />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.35em] font-bold text-brand-gold">
            Reviewing
          </h4>
          <p className="mt-3 text-sm underline decoration-black/25 underline-offset-4 text-black/60">
            {review.product}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function CustomerReviews({
  initialVisible = 3,
  showMoreCount,
  className = "bg-brand-ivory px-4 pb-16 md:px-16 md:pb-28",
}: {
  initialVisible?: number;
  showMoreCount?: number;
  className?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, initialVisible);
  const remainingCount = showMoreCount ?? reviews.length - initialVisible;

  return (
    <section className={className}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[980px] border-y border-black/10"
      >
        <div className="border-b border-black/10 px-5 py-8 md:px-10 md:py-10">
          <span className="mb-6 block text-[9px] uppercase tracking-[0.55em] font-bold text-brand-gold">
            Customer Reviews
          </span>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-garet text-4xl font-bold tracking-tight text-black md:text-5xl">
                  4.8
                </span>
                <Stars size="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h2 className="text-sm uppercase tracking-[0.34em] font-bold text-black md:text-base">
                Average Rating
              </h2>
              <p className="mt-2 text-sm tracking-[0.08em] text-black/45 md:text-base">
                Based on 1,247 verified reviews
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[360px]">
              <button className="flex h-12 rounded-[8px] items-center justify-center gap-3 border border-black/35 px-4 text-[10px] uppercase tracking-[0.25em] font-bold text-black/60 transition-colors hover:border-black hover:text-black">
                <SlidersHorizontal className="h-4 w-4 stroke-[1.4px]" />
                Filters
              </button>
              <button className="flex h-12 rounded-[8px] items-center justify-center gap-3 border border-black/35 px-4 text-[10px] uppercase tracking-[0.25em] font-bold text-black/60 transition-colors hover:border-black hover:text-black">
                Most Recent
                <ChevronDown className="h-4 w-4 stroke-[1.4px]" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {visibleReviews.map((review, index) => (
            <ReviewArticle key={review.name} review={review} index={index} />
          ))}
        </AnimatePresence>

        <div className="border-t border-black/10 px-5 py-7 text-center md:px-10">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="inline-flex h-12 min-w-56 rounded-[8px] items-center justify-center border border-black px-8 text-[10px] uppercase tracking-[0.35em] font-bold text-black transition-colors hover:bg-black hover:text-white"
          >
            {showAll ? "Show Less" : `Show More (${remainingCount})`}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
