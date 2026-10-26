import type { CSSProperties } from "react";

// Sticker shape library for the খেজুরের গুড় landing. Paths use a -50..50 viewBox.
export const SHAPE_COLORS = {
  blue: "#1f5fd6",
  yellow: "#fbd772",
  coral: "#f47b5c",
  green: "#3f8f6b",
  lilac: "#e3c4ec",
  navy: "#0f3b4f",
} as const;

export type ShapeName = "scallop" | "flower" | "burst" | "star" | "sparkle" | "clover" | "blob" | "wave" | "rays" | "ring";
export type ShapeColor = keyof typeof SHAPE_COLORS | `#${string}`;

const f = (p: readonly [number, number]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const pol = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const;
const circ = (x: number, y: number, r: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

function burst(n = 18, r1 = 48, r2 = 34) {
  let d = "";
  for (let i = 0; i < 2 * n; i++) d += (i ? " L" : "M") + f(pol(i % 2 ? r2 : r1, (i / (2 * n)) * 2 * Math.PI - Math.PI / 2));
  return d + "Z";
}

const BUILDERS: Record<ShapeName, () => string> = {
  scallop() {
    const n = 16;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      d += (i ? "" : "M" + f(pol(41, a0))) + ` Q${f(pol(54, (a0 + a1) / 2))} ${f(pol(41, a1))}`;
    }
    return d + "Z";
  },
  flower() {
    const n = 8;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI;
      const a1 = ((i + 1) / n) * 2 * Math.PI;
      const k = (a1 - a0) * 0.1;
      d += (i ? "" : "M" + f(pol(22, a0))) + ` C${f(pol(64, a0 + k))} ${f(pol(64, a1 - k))} ${f(pol(22, a1))}`;
    }
    return d + "Z";
  },
  burst: () => burst(),
  star: () => burst(8, 48, 22),
  sparkle: () => "M0 -48 C4 -8 8 -4 48 0 C8 4 4 8 0 48 C-4 8 -8 4 -48 0 C-8 -4 -4 -8 0 -48Z",
  clover: () => [circ(-20, 0, 24), circ(20, 0, 24), circ(0, -20, 24), circ(0, 20, 24), circ(0, 0, 20)].join(" "),
  blob() {
    let d = circ(0, 0, 26);
    for (let i = 0; i < 5; i++) {
      const [x, y] = pol(24, (i / 5) * 2 * Math.PI - Math.PI / 2);
      d += " " + circ(x, y, 22);
    }
    return d;
  },
  wave() {
    const left: (readonly [number, number])[] = [];
    const right: (readonly [number, number])[] = [];
    for (let i = 0; i <= 40; i++) {
      const y = -48 + i * 2.4;
      const w = 9 * Math.sin((i / 40) * Math.PI * 4);
      left.push([-14 + w, y]);
      right.push([14 + w, y]);
    }
    return "M" + left.map(f).join(" L") + " L" + right.reverse().map(f).join(" L") + "Z";
  },
  rays() {
    let d = "M-50 46 H50 V50 H-50Z";
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + ((i + 0.5) / 9) * Math.PI;
      const w = 0.07;
      const p = [pol(14, a - w), pol(50, a - w * 0.6), pol(50, a + w * 0.6), pol(14, a + w)].map(([x, y]) => [x, y + 46] as const);
      d += " M" + p.map(f).join(" L") + "Z";
    }
    return d;
  },
  ring: () => circ(0, 0, 46) + " " + circ(0, 0, 26),
};

const pathCache = new Map<ShapeName, string>();
export function shapePath(name: ShapeName) {
  let d = pathCache.get(name);
  if (!d) {
    d = BUILDERS[name]();
    pathCache.set(name, d);
  }
  return d;
}

export function shapeFill(color: ShapeColor) {
  return color in SHAPE_COLORS ? SHAPE_COLORS[color as keyof typeof SHAPE_COLORS] : color;
}

export function Shape({ name, color }: { name: ShapeName; color: ShapeColor }) {
  return (
    <svg className="shp" viewBox="-50 -50 100 100" aria-hidden="true">
      <path d={shapePath(name)} fill={shapeFill(color)} fillRule={name === "ring" ? "evenodd" : "nonzero"} />
    </svg>
  );
}

// A shape wrapped in an animated span (spin / twk / bob / wig) — the sticker motif used throughout the page.
export function MotionShape({ name, color, motion, style }: { name: ShapeName; color: ShapeColor; motion: string; style?: CSSProperties }) {
  return (
    <span className={motion} style={{ display: "block", width: "100%", height: "100%", ...style }}>
      <Shape name={name} color={color} />
    </span>
  );
}
