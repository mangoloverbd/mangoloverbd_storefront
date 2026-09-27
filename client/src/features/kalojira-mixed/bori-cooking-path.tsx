import { motion } from "framer-motion";

export type BoriCookingStep = { title: string; body: string; image: string; imageAlt: string };

// Geometry is in a 400×1120 viewBox. Photo and text positions are percentages of that box so the layout scales with width.
const VIEW_W = 400;
const VIEW_H = 1120;
const PHOTO_SIZE = "46%";
const PATH_D = "M 230 0 C 230 70 150 40 120 170 C 95 290 150 360 250 360 C 360 360 350 285 300 320 C 250 360 250 430 280 540 C 310 660 170 640 110 700 C 50 760 60 820 120 900 C 210 930 240 1010 225 1120";
const SPARKLE_D = "M0 -16 C2 -4 4 -2 16 0 C4 2 2 4 0 16 C-2 4 -4 2 -16 0 C-4 -2 -2 -4 0 -16Z";

const LAYOUT = [
  { center: [110, 175], rays: { color: "#eab308", from: 165, to: 295 }, label: "ভাজুন •", labelArc: "M 7.8 234 A 118 118 0 0 0 212.2 234", sparkle: { at: [190, 70], scale: 1.1, color: "#19382d" }, numeral: "০১", text: { left: "57%", top: "7%", width: "40%", align: "left" as const } },
  { center: [288, 525], rays: { color: "#f28c28", from: -75, to: 15 }, label: "মেশান •", labelArc: "M 185.8 584 A 118 118 0 0 0 390.2 584", sparkle: { at: [385, 405], scale: 1.3, color: "#2f9e5b" }, numeral: "০২", text: { left: "3%", top: "39%", width: "44%", align: "right" as const } },
  { center: [112, 874], rays: { color: "#2f9e5b", from: 165, to: 295 }, label: "পরিবেশন •", labelArc: "M 9.8 933 A 118 118 0 0 0 214.2 933", sparkle: { at: [222, 770], scale: 1, color: "#f28c28" }, numeral: "০৩", text: { left: "57%", top: "71%", width: "40%", align: "left" as const } },
];

function rayLines(from: number, to: number, count = 16, inner = 106, outer = 134) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    return { x1: Math.cos(angle) * inner, y1: Math.sin(angle) * inner, x2: Math.cos(angle) * outer, y2: Math.sin(angle) * outer };
  });
}

export function BoriCookingPath({ steps, className = "" }: { steps: BoriCookingStep[]; className?: string }) {
  return <ol className={`relative w-full ${className}`} style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
    <svg aria-hidden="true" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <defs>{LAYOUT.map((spot, idx) => <path key={spot.label} id={`bori-cook-arc-${idx}`} d={spot.labelArc} />)}</defs>
      {LAYOUT.map((spot) => <g key={spot.label} transform={`translate(${spot.center[0]} ${spot.center[1]})`} stroke={spot.rays.color} strokeWidth={7} strokeLinecap="round">{rayLines(spot.rays.from, spot.rays.to).map((line, i) => <line key={i} {...line} />)}</g>)}
      <motion.path d={PATH_D} fill="none" stroke="#eab308" strokeWidth={9} strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 2.2, ease: "easeInOut" }} />
      {LAYOUT.map((spot) => <path key={spot.label} d={SPARKLE_D} fill={spot.sparkle.color} transform={`translate(${spot.sparkle.at[0]} ${spot.sparkle.at[1]}) scale(${spot.sparkle.scale})`} />)}
      {LAYOUT.map((spot, idx) => <text key={spot.label} fontSize={15} fontWeight={700} fill="#b98500" letterSpacing={0.5}><textPath href={`#bori-cook-arc-${idx}`} startOffset="50%" textAnchor="middle">{spot.label}</textPath></text>)}
    </svg>
    {steps.map((step, idx) => {
      const spot = LAYOUT[idx];
      if (!spot) return null;
      return <li key={step.title}>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_30px_-12px_rgba(25,56,45,0.45)]" style={{ left: `${(spot.center[0] / VIEW_W) * 100}%`, top: `${(spot.center[1] / VIEW_H) * 100}%`, width: PHOTO_SIZE }}>
          <img src={step.image} alt={step.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }} className={`absolute ${spot.text.align === "right" ? "text-right" : "text-left"}`} style={{ left: spot.text.left, top: spot.text.top, width: spot.text.width }}>
          <p aria-hidden="true" className="text-[40px] font-black leading-none text-[#19382d]">{spot.numeral}</p>
          <h3 className="mt-1.5 text-[19px] font-bold leading-tight text-[#19382d]">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-[#19382d]/70">{step.body}</p>
        </motion.div>
      </li>;
    })}
  </ol>;
}
