import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DECO, KHEJUR_ASSET, RIBBON_TEXT, ROAD_STOPS, toBanglaDigits, type DecoSpec } from "./content";
import { MotionShape, Shape, shapePath, shapeFill, type ShapeName } from "./shapes";

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Adds .in to every [data-io] block inside the root as it scrolls into view (drives the .rise/.pop entrances).
export function useRevealOnScroll(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    }), { threshold: 0.2 });
    el.querySelectorAll("[data-io]").forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [root]);
}

// Background stickers that drift with scroll. Rendered at the start of a section.
export function Deco({ set }: { set: keyof typeof DECO }) {
  return <>{DECO[set].map((spec, i) => <DecoSticker key={i} spec={spec} index={i} />)}</>;
}

function DecoSticker({ spec, index }: { spec: DecoSpec; index: number }) {
  const [name, color, x, y, size, motion, parallax] = spec;
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section || prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.translate = `0 ${(r.top + r.height / 2 - window.innerHeight / 2) * parallax}px`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [parallax]);
  return (
    <span ref={ref} className="deco pop" style={{ "--d": `${300 + index * 90}ms`, left: `${x}%`, top: `${y}%`, width: size, height: size } as CSSProperties}>
      <MotionShape name={name} color={color} motion={motion} style={{ "--t": `${10 + index * 4}s` } as CSSProperties} />
    </span>
  );
}

// "আজ সকালের ঝোলা / বীজ / পাটালি" word that rolls every 2.3s.
const ROLL = [["ঝোলা", "#c2451d"], ["বীজ", "#c78a12"], ["পাটালি", "#a33a1c"]] as const;
export function RollWord() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setCurrent((value) => { setPrevious(value); return (value + 1) % ROLL.length; }), 2300);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (previous === null) return;
    const id = window.setTimeout(() => setPrevious(null), 500);
    return () => window.clearTimeout(id);
  }, [previous]);
  return (
    <span className="roll">
      {ROLL.map(([word, color], i) => (
        <span key={word} className={i === current ? "cur" : i === previous ? "off" : undefined} style={{ background: color }}>{word}</span>
      ))}
    </span>
  );
}

// Wavy ribbon: the band ripples and the text flows along it.
export function Ribbon() {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextPathElement>(null);
  useEffect(() => {
    const box = boxRef.current, svg = svgRef.current, fill = fillRef.current, line = lineRef.current, tp = textRef.current;
    if (!box || !svg || !fill || !line || !tp) return;
    const reduce = prefersReducedMotion();
    const A = 9, Lw = 300, H = 78, top = 16, bot = 60, mid = 38;
    let W = 0, chunkLen = 600, off = 0, ph = 0, last = 0, frame = 0, alive = true;
    const y = (x: number, base: number) => base + A * Math.sin((x / Lw) * 2 * Math.PI + ph);
    const paths = () => {
      const xs: number[] = [];
      for (let x = -40; x <= W + 40; x += 12) xs.push(x);
      fill.setAttribute("d", "M" + xs.map((x) => `${x} ${y(x, top).toFixed(1)}`).join(" L") + " L" + xs.slice().reverse().map((x) => `${x} ${y(x, bot).toFixed(1)}`).join(" L") + "Z");
      line.setAttribute("d", "M" + xs.map((x) => `${x} ${y(x, mid).toFixed(1)}`).join(" L"));
    };
    const setup = () => {
      W = box.clientWidth;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      paths();
      tp.textContent = RIBBON_TEXT;
      chunkLen = tp.getComputedTextLength() || 600;
      tp.textContent = RIBBON_TEXT.repeat(Math.ceil((W + 200) / chunkLen) + 2);
    };
    const tick = (t: number) => {
      if (!alive) return;
      const dt = Math.min(50, t - (last || t));
      last = t;
      if (!reduce) {
        ph += dt * 0.0012;
        paths();
        off -= dt * 0.045;
        if (off < -chunkLen) off += chunkLen;
        tp.setAttribute("startOffset", off.toFixed(1));
      }
      frame = requestAnimationFrame(tick);
    };
    document.fonts.ready.then(() => { if (!alive) return; setup(); frame = requestAnimationFrame(tick); });
    window.addEventListener("resize", setup);
    return () => { alive = false; cancelAnimationFrame(frame); window.removeEventListener("resize", setup); };
  }, []);
  return (
    <div className="wave-band" ref={boxRef} aria-hidden="true">
      <svg ref={svgRef}><path className="wb-fill" ref={fillRef} /><path className="wb-line" id="khejurWaveLine" ref={lineRef} /><text><textPath href="#khejurWaveLine" ref={textRef} /></text></svg>
    </div>
  );
}

const KM_STONE = (n: number) => `<svg viewBox="0 0 30 36"><path d="M3 34 V12 A12 12 0 0 1 27 12 V34Z" fill="#fffaf2" stroke="#1d2430" stroke-width="2"/><path d="M3 14 A12 12 0 0 1 27 14 V16 H3Z" fill="#f47b5c"/><text x="15" y="29" text-anchor="middle" font-family="Noto Serif Bengali" font-size="11" font-weight="900" fill="#1d2430">${toBanglaDigits(n)}</text></svg>`;
const TREE = (name: ShapeName) => `<svg class="shp" viewBox="-50 -50 100 100" aria-hidden="true"><path d="${shapePath(name)}" fill="${shapeFill("green")}"/></svg>`;

// "গুড়ের রাস্তা": a road winds between the stops and the van follows the scroll position.
export function GurRoad({ onOrder }: { onOrder: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
  const vanRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const head = headRef.current;
    if (!head) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) head.classList.add("on"); }, { threshold: 0.4 });
    io.observe(head);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const body = bodyRef.current, svg = svgRef.current, props = propsRef.current, van = vanRef.current;
    if (!body || !svg || !props || !van) return;
    const done = svg.querySelector<SVGPathElement>(".rd-done");
    if (!done) return;
    const reduce = prefersReducedMotion();
    let len = 0, stopsAt: number[] = [], cur = 0, target = 0, ang = 90, running = false, puff = 0, scrollFrame = 0, alive = true;
    let kms: HTMLElement[] = [];
    const stops = () => Array.from(body.querySelectorAll<HTMLElement>(".rs"));

    const atY = (y: number) => {
      let lo = 0, hi = len;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (done.getPointAtLength(m).y < y) lo = m; else hi = m; }
      return lo;
    };
    const draw = (at: number) => {
      done.style.strokeDashoffset = String(len - at);
      const a = done.getPointAtLength(at), b = done.getPointAtLength(Math.min(len, at + 3));
      const want = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      ang += (((want - ang + 540) % 360) - 180) * 0.25;
      van.style.transform = `translate(${a.x}px,${a.y}px) rotate(${ang}deg)`;
      stops().forEach((el, i) => el.classList.toggle("lit", at >= stopsAt[i] - 120 || reduce));
      kms.forEach((k) => k.classList.toggle("on", at >= Number(k.dataset.l) - 20));
      return a;
    };
    const loop = (t: number) => {
      if (!alive) return;
      const prev = cur;
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.4) cur = target;
      const a = draw(cur);
      if (Math.abs(cur - prev) > 1.2 && t - puff > 110) {
        puff = t;
        const r = (ang * Math.PI) / 180, p = document.createElement("span");
        p.className = "puff";
        p.style.left = `${a.x - Math.cos(r) * 30}px`;
        p.style.top = `${a.y - Math.sin(r) * 30}px`;
        body.append(p);
        window.setTimeout(() => p.remove(), 950);
      }
      if (cur !== target) requestAnimationFrame(loop); else running = false;
    };
    const onScroll = () => {
      scrollFrame = 0;
      if (!len) return;
      const B = body.getBoundingClientRect();
      target = reduce ? len : Math.max(0, Math.min(len, atY(window.innerHeight * 0.58 - B.top + 40)));
      if (reduce) { cur = target; draw(cur); return; }
      if (!running) { running = true; requestAnimationFrame(loop); }
    };
    const build = () => {
      if (!alive) return;
      const B = body.getBoundingClientRect();
      if (!B.width) return;
      const W = B.width;
      const rows = stops().map((st) => {
        const r = st.getBoundingClientRect(), im = st.querySelector(".rs-st")!.getBoundingClientRect();
        return { left: st.dataset.side === "l", top: r.top - B.top, bot: r.bottom - B.top, mid: im.top - B.top + im.height / 2 };
      });
      if (!rows.length) return;
      const lane = (left: boolean) => (left ? W * 0.86 : W * 0.14);
      let d = `M${lane(rows[0].left)} ${rows[0].top - 6} L${lane(rows[0].left)} ${rows[0].top + 20}`;
      rows.forEach((s, i) => {
        const x0 = lane(s.left), n = rows[i + 1];
        if (n) { const x1 = lane(n.left), y0 = s.bot + 6, y1 = n.top + 10, g = y1 - y0; d += ` L${x0} ${y0} C${x0} ${y0 + g * 0.8}, ${x1} ${y1 - g * 0.8}, ${x1} ${y1}`; }
        else d += ` L${x0} ${s.bot - 30}`;
      });
      const H = rows[rows.length - 1].bot;
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H + 40));
      svg.setAttribute("viewBox", `0 -40 ${W} ${H + 40}`);
      svg.style.top = "-40px";
      svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
      len = done.getTotalLength();
      done.style.strokeDasharray = String(len);
      stopsAt = rows.map((s) => atY(s.mid));
      const at = (L: number) => {
        const a = done.getPointAtLength(L), b = done.getPointAtLength(Math.min(len, L + 1));
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        return { x: a.x, y: a.y, nx: -Math.sin(angle), ny: Math.cos(angle), angle };
      };
      let html = "";
      for (let L = 220, k = 1; L < len - 80; L += 300, k++) {
        const p = at(L), side = k % 2 ? 1 : -1, oy = p.y + p.ny * 44 * side;
        let ox = p.x + p.nx * 44 * side;
        if (ox < 18 || ox > W - 18) ox = p.x - p.nx * 44 * side;
        html += `<span class="km" data-l="${L}" style="left:${ox}px;top:${oy}px">${KM_STONE(k * 2)}</span>`;
        const q = at(L + 150), ts = -side;
        html += `<span class="tree" style="left:${q.x + q.nx * 46 * ts}px;top:${q.y + q.ny * 46 * ts}px">${TREE((["clover", "blob", "flower"] as const)[k % 3])}</span>`;
      }
      const e = at(len - 2);
      html += `<span class="finish" style="left:${e.x}px;top:${e.y}px;transform:rotate(${(e.angle * 180) / Math.PI + 90}deg)"></span>`;
      props.innerHTML = html;
      kms = Array.from(props.querySelectorAll<HTMLElement>(".km"));
      cur = Math.min(cur, len);
      onScroll();
      draw(cur);
    };

    const scroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); };
    const ro = new ResizeObserver(() => build());
    ro.observe(body);
    document.fonts.ready.then(build);
    const settle = window.setTimeout(build, 700);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      alive = false;
      ro.disconnect();
      window.clearTimeout(settle);
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  return (
    <section className="ra" aria-labelledby="ra-h">
      <Deco set="road" />
      <div className="wrap ra-head" ref={headRef}>
        <p className="ra-kick"><span><Shape name="sparkle" color="coral" /></span>গাছ থেকে আপনার দরজা<span><Shape name="sparkle" color="coral" /></span></p>
        <h2 className="ra-title" id="ra-h"><span className="w1">গুড়ের</span><span className="w2">রাস্তা<svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 14 C 50 4, 110 4, 196 12" /></svg></span></h2>
        <p>নিচে স্ক্রল করুন — ভ্যান রওনা দিয়েছে</p>
      </div>
      <div className="ra-body" ref={bodyRef}>
        <svg className="ra-svg" ref={svgRef} aria-hidden="true"><path className="rd-shade" /><path className="rd-edge" /><path className="rd-top" /><path className="rd-line" /><path className="rd-dash" /><path className="rd-done" /></svg>
        <div className="rd-props" ref={propsRef} aria-hidden="true" />
        <div className="van2" ref={vanRef} aria-hidden="true">
          <svg viewBox="0 0 60 36"><ellipse cx="30" cy="31" rx="26" ry="4" fill="#0006" /><rect x="2" y="4" width="38" height="26" rx="5" fill="#fffaf2" stroke="#1d2430" strokeWidth="2" /><rect x="38" y="6" width="19" height="22" rx="6" fill="#f47b5c" stroke="#1d2430" strokeWidth="2" /><rect x="48" y="9" width="6" height="16" rx="2.5" fill="#0f3b4f" /><circle cx="12" cy="17" r="5" fill="#fbd772" /><circle cx="25" cy="17" r="5" fill="#3f8f6b" /><circle cx="58" cy="9" r="2" fill="#fff6c9" /><circle cx="58" cy="25" r="2" fill="#fff6c9" /></svg>
          <span className="beam" />
        </div>
        <div>
          {ROAD_STOPS.map((stop, i) => (
            <article key={stop.title} className="rs" data-side={i % 2 ? "l" : "r"} style={{ "--r1": stop.r1, "--r2": stop.r2 } as CSSProperties}>
              <div className={stop.kind === "trio" ? "rs-st" : `rs-st cutw cutw-${stop.kind}`}>
                {stop.kind === "tap" ? <img className="rs-ground" src={KHEJUR_ASSET("road-ground.webp")} alt="" width={1165} height={276} loading="lazy" /> : null}
                <img className={stop.kind === "trio" ? "trio-st" : `cut-st cut-${stop.kind}`} src={KHEJUR_ASSET(stop.image)} alt={stop.title} loading="lazy" />
              </div>
              <div className="rs-sign"><small><i>{toBanglaDigits(i + 1)}</i>{stop.time}</small><h3>{stop.title}</h3></div>
              <p className="rs-p">{stop.body}</p>
              {i === ROAD_STOPS.length - 1 ? <a className="btn sm" href="#orderK" onClick={(event) => { event.preventDefault(); onOrder(); }}>এই গুড় অর্ডার করুন</a> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
