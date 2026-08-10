import { ArrowDownRight, Droplets, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const peptideImage = "/peptide-lip-benefits.png";

const benefits = [
  {
    label: "Deep Hydration",
    detail: "A cushiony moisture veil helps lips feel smoother, softer, and less dry.",
    icon: Droplets,
  },
  {
    label: "Fuller Look",
    detail: "Glossy tint and peptide care make the lip line appear visibly plusher.",
    icon: Sparkles,
  },
  {
    label: "Collagen Support",
    detail: "Peptide-powered care supports the appearance of firmer, healthy-looking lips.",
    icon: ShieldCheck,
  },
];

export default function BookingSection() {
  return (
    <section className="bg-brand-ivory px-4 py-16 overflow-hidden md:px-16 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid items-start border-y border-black/10 md:grid-cols-[1.04fr_0.96fr]">
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/2] overflow-hidden border-b border-black/10 bg-[#f6f6f6] md:border-b-0 md:border-r"
          >
            <img
              src={peptideImage}
              alt="Peptide lip tint hydration and fuller lip benefits"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-brand-ivory/20" />
            <div className="absolute inset-8 hidden border border-white/35 pointer-events-none md:block" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col justify-between bg-brand-ivory px-5 py-10 md:px-16 md:py-20"
          >
            <div className="absolute right-4 top-4 hidden text-[8vw] font-display font-light uppercase leading-none tracking-tight text-black/[0.025] md:block">
              PEPTIDE
            </div>

            <div className="relative">
              <div className="mb-8 flex items-center gap-4 text-[9px] uppercase tracking-[0.45em] font-bold text-brand-gold">
                <span>Lip Science</span>
                <span className="h-px w-12 bg-black/15" />
                <span>Daily Ritual</span>
              </div>

              <h2 className="font-display text-5xl font-light uppercase leading-[0.86] tracking-tight text-black md:text-8xl">
                Fuller<br />
                <span className="font-bold">Hydrated</span><br />
                Lips
              </h2>

              <div className="my-8 h-px w-20 bg-brand-gold md:my-12" />

              <p className="max-w-xl text-[11px] uppercase leading-7 tracking-[0.22em] text-black/60 md:text-sm md:leading-8">
                Peptide lip tint gives the finish customers notice first: a smooth glossy veil, softer feel, and a naturally fuller-looking lip without a heavy makeup look.
              </p>
            </div>

            <div className="relative mt-10 space-y-5 md:mt-14 md:space-y-7">
              {benefits.map((benefit) => (
                <div key={benefit.label} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-black/10 pt-5 md:grid-cols-[3rem_1fr] md:gap-6 md:pt-7">
                  <div className="flex h-10 w-10 items-center justify-center border border-brand-gold/35 text-brand-gold md:h-12 md:w-12">
                    <benefit.icon className="h-4 w-4 stroke-[1.4px]" />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.38em] font-bold text-black">
                      {benefit.label}
                    </h3>
                    <p className="mt-2 max-w-md text-[11px] leading-6 tracking-[0.08em] text-black/50 md:text-sm md:leading-7">
                      {benefit.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-10 border-t border-black/10 pt-8 md:mt-14 md:pt-10">
              <div className="mb-7 grid grid-cols-3 divide-x divide-black/10 border border-black/10 text-center">
                {["Hydrates", "Plumps", "Boosts Glow"].map((item) => (
                  <span key={item} className="px-2 py-4 text-[8px] uppercase tracking-[0.25em] font-bold text-black/55 md:text-[10px]">
                    {item}
                  </span>
                ))}
              </div>

              <a
                href="#bundles"
                className="group flex h-14 w-full items-center justify-center gap-4 bg-black px-6 text-[9px] uppercase tracking-[0.32em] font-bold text-white transition-colors hover:bg-brand-gold md:w-fit md:min-w-80 md:text-[10px]"
              >
                Shop The Peptide Edit
                <ArrowDownRight className="h-5 w-5 stroke-[1px] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
