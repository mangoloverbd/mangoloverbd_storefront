import type { CSSProperties } from "react";
import { KHEJUR_ASSET } from "./content";
import { Shape, type ShapeColor, type ShapeName } from "./shapes";
import { Sweet, type SweetName } from "./sweets";

// "দায়িত্বশীল তথ্য": the nutritionist's note as a bento grid of geometric tiles.
const QUOTE = "খেজুরের গুড় শুধু মিষ্টি নয়, এটি বাঙালির শীতকালীন ঐতিহ্যের এক অবিচ্ছেদ্য অংশ। ভাপা পিঠা, পায়েস কিংবা পাটিসাপটার স্বাদে এর জুড়ি নেই। তবে প্রাকৃতিক উৎস থেকে তৈরি হলেও গুড় মূলত চিনিসমৃদ্ধ একটি খাবার। তাই স্বাস্থ্যসচেতন জীবনযাপনে এর আসল স্বাদ উপভোগ করুন পরিমিত পরিমাণে।";

const FACTS: readonly { title: string; note: string; bg: string; shape: ShapeName; sweet: SweetName; spin: string }[] = [
  { title: "ডায়াবেটিস থাকলে", note: "চিকিৎসকের পরামর্শ মেনে চলুন", bg: "#1f5fd6", shape: "scallop", sweet: "sandesh", spin: "spin r" },
];

const SWEETS: readonly [SweetName, string, string][] = [
  ["bhapa", "ভাপা পিঠা", "-6deg"],
  ["patishapta", "পাটিসাপটা", "5deg"],
  ["chitoi", "চিতই", "-4deg"],
  ["moa", "মোয়া", "6deg"],
  ["rosogolla", "রসগোল্লা", "-5deg"],
];

const PINS: readonly { n: string; left: string; top: string; shape: ShapeName; color: ShapeColor; delay: number }[] = [
  { n: "১", left: "84%", top: "34%", shape: "burst", color: "coral", delay: 500 },
  { n: "২", left: "26%", top: "90%", shape: "flower", color: "green", delay: 650 },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function NutritionistBento() {
  return (
    <section className="nb" data-io aria-labelledby="nb-h">
      <div className="wrap">
        <p className="kick rise" style={{ textAlign: "center" }}>দায়িত্বশীল তথ্য</p>
        <h2 className="nb-title rise" id="nb-h" style={d(80)}>খেজুরের গুড় নিয়ে<br /><em>পুষ্টিবিদের কথা</em></h2>
        <div className="nb-grid">
          <div className="nb-tile nb-photo rise" style={d(150)}>
            <img src={KHEJUR_ASSET("gachhi.webp")} alt="খেজুর গাছে রস নামানোর প্রস্তুতি নিচ্ছেন একজন গাছি" width={720} height={1080} loading="lazy" />
            <svg className="nb-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M84 34 L84 16 L56 12" style={{ "--len": 46 } as CSSProperties} />
              <path d="M26 90 L26 80 L40 76" style={{ "--len": 26 } as CSSProperties} />
            </svg>
            {PINS.map((pin) => (
              <span key={pin.n} className="nb-pin pop" style={{ left: pin.left, top: pin.top, ...d(pin.delay) }} aria-hidden="true">
                <span><Shape name={pin.shape} color={pin.color} /></span><b>{pin.n}</b>
              </span>
            ))}
            <span className="nb-tag rise" style={{ left: 8, top: "6%", ...d(900) }}>গাছ চাঁছা</span>
            <span className="nb-tag rise" style={{ left: "40%", top: "70%", ...d(1000) }}>রসের হাঁড়ি</span>
          </div>
          <figure className="nb-tile nb-quote rise" style={d(250)}>
            <span className="nb-big spin" style={{ "--t": "36s" } as CSSProperties}><Shape name="flower" color="#ffffff" /></span>
            <i className="spin" style={{ "--t": "18s" } as CSSProperties}><Shape name="sparkle" color="coral" /></i>
            <blockquote>“{QUOTE}”</blockquote>
            <figcaption>— পুষ্টিবিদ মুরাদ পারভেজ</figcaption>
          </figure>
          {FACTS.map((fact, i) => (
            <div key={fact.title} className="nb-tile nb-fact rise" style={{ background: fact.bg, ...d(350 + i * 100) }}>
              <span className={`nb-big ${fact.spin}`} style={{ "--t": `${30 + i * 4}s` } as CSSProperties}><Shape name={fact.shape} color="#ffffff" /></span>
              <Sweet name={fact.sweet} className="stk bob" style={{ "--t": `${5 + i * 0.4}s` } as CSSProperties} />
              <b>{fact.title}</b><small>{fact.note}</small>
            </div>
          ))}
          <div className="nb-tile nb-sweets rise" style={d(650)}>
            <span className="nb-big2 spin" style={{ "--t": "40s" } as CSSProperties}><Shape name="scallop" color="yellow" /></span>
            <p><b>গুড় দিয়ে যা বানাবেন</b><small>শীতের পিঠা-পুলি থেকে মিষ্টি</small></p>
            <div className="nb-row">
              {SWEETS.map(([name, label, rotate], i) => (
                <Sweet key={name} name={name} label={label} className="stk bob" style={{ "--t": `${5 + i * 0.3}s`, rotate } as CSSProperties} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
