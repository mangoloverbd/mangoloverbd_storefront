import type { CSSProperties } from "react";

// Hand-drawn stickers of sweets made with খেজুরের গুড়. Static, trusted SVG markup (no user input).
const SWEET_ART = {
  bhapa: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <path d="M30 22c-4 6 4 9 0 15M60 14c-4 6 4 9 0 15M90 22c-4 6 4 9 0 15" fill="none" stroke="#b9ab98" stroke-linecap="round"/> <ellipse cx="60" cy="96" rx="50" ry="12" fill="#fffaf2"/> <path d="M22 58c0 30 76 30 76 0" fill="#efe6d6"/> <ellipse cx="60" cy="58" rx="38" ry="15" fill="#fffdf8"/> <path d="M44 56c4-7 28-7 32 0c-2 6-30 6-32 0z" fill="#9a4a1c"/> <path d="M70 60c4 6 6 12 2 18" fill="none" stroke="#9a4a1c" stroke-width="4" stroke-linecap="round"/></g> <g fill="#fff"><rect x="38" y="50" width="4" height="2" rx="1"/><rect x="78" y="60" width="5" height="2" rx="1"/><rect x="52" y="66" width="4" height="2" rx="1"/></g>`,
  payesh: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <path d="M14 48h92c-4 38-24 50-46 50s-42-12-46-50z" fill="#c86a3c"/> <path d="M22 62c10 6 66 6 76 0" fill="none" stroke="#a24f26" stroke-width="2"/> <ellipse cx="60" cy="48" rx="46" ry="12" fill="#fff3dc"/> <path d="M34 47c8-6 18 4 26-2s18 4 26-2" fill="none" stroke="#8a3d14" stroke-width="4" stroke-linecap="round"/> <path d="M80 30c10-10 22-6 24 2c-8 6-18 6-24-2z" fill="#3f8f6b"/></g> <g fill="#fff"><ellipse cx="44" cy="51" rx="3" ry="1.4"/><ellipse cx="66" cy="52" rx="3" ry="1.4"/><ellipse cx="78" cy="49" rx="3" ry="1.4"/></g>`,
  patishapta: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <ellipse cx="60" cy="90" rx="52" ry="14" fill="#fffaf2"/> <rect x="18" y="56" width="70" height="24" rx="12" fill="#f3d79a" transform="rotate(-8 53 68)"/> <circle cx="86" cy="63" r="12" fill="#f3d79a"/> <path d="M86 63m-6 0a6 6 0 1 1 6 6a3 3 0 1 1-3-3" fill="none" stroke="#8b4513" stroke-width="3"/> <rect x="28" y="38" width="64" height="22" rx="11" fill="#f6dfaa" transform="rotate(6 60 49)"/> <path d="M30 44l8 10l8-10l8 10l8-10l8 10l8-10" fill="none" stroke="#8a3d14" stroke-width="3.4" stroke-linecap="round"/></g>`,
  sandesh: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <ellipse cx="60" cy="94" rx="48" ry="11" fill="#fffaf2"/> <path d="M18 84c0-30 18-50 38-50c22 0 40 20 40 50z" fill="#d9a066"/> <path d="M57 36v48M40 44c4 12 6 26 6 40M74 44c-4 12-6 26-6 40M27 60c6 8 9 16 10 24M88 60c-6 8-9 16-10 24" fill="none" stroke="#a8692e" stroke-width="2.2"/> <circle cx="57" cy="40" r="4" fill="#3f8f6b"/></g>`,
  chitoi: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <ellipse cx="60" cy="80" rx="52" ry="20" fill="#b9673a"/> <ellipse cx="60" cy="74" rx="44" ry="15" fill="#fffaf2"/> <ellipse cx="50" cy="66" rx="30" ry="12" fill="#fbf3e4"/> <path d="M70 76c12-4 22 0 18 6c-6 4-20 2-18-6z" fill="#8a3d14"/></g> <g fill="#e2d2b6"><circle cx="40" cy="64" r="2"/><circle cx="50" cy="61" r="1.6"/><circle cx="60" cy="66" r="2"/><circle cx="46" cy="70" r="1.6"/><circle cx="62" cy="60" r="1.4"/><circle cx="34" cy="68" r="1.4"/></g>`,
  moa: `<g stroke="#1d2430" stroke-width="2.6"> <ellipse cx="60" cy="96" rx="48" ry="10" fill="#fffaf2"/> <circle cx="38" cy="74" r="22" fill="#f4c766"/><circle cx="82" cy="74" r="22" fill="#eeb94f"/><circle cx="60" cy="48" r="22" fill="#f6d27a"/></g> <g fill="#fff6d6"><circle cx="30" cy="68" r="3"/><circle cx="42" cy="80" r="3"/><circle cx="46" cy="66" r="2.4"/><circle cx="76" cy="68" r="3"/><circle cx="88" cy="80" r="2.4"/><circle cx="54" cy="42" r="3"/><circle cx="66" cy="52" r="2.6"/><circle cx="62" cy="38" r="2"/></g>`,
  rosogolla: `<g stroke="#1d2430" stroke-width="2.6" stroke-linejoin="round"> <path d="M14 52h92c-3 32-22 46-46 46s-43-14-46-46z" fill="#fffaf2"/> <ellipse cx="60" cy="52" rx="46" ry="12" fill="#a8541f"/> <circle cx="42" cy="46" r="13" fill="#b8743a"/><circle cx="76" cy="46" r="13" fill="#b07035"/><circle cx="59" cy="38" r="13" fill="#c0803f"/></g> <g fill="#fff8" ><circle cx="38" cy="41" r="3"/><circle cx="72" cy="41" r="3"/><circle cx="55" cy="33" r="3"/></g>`,
} as const;

export type SweetName = keyof typeof SWEET_ART;

export function Sweet({ name, className = "stk", style, label }: { name: SweetName; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <span className={className} style={style}>
      <svg viewBox="0 0 120 112" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SWEET_ART[name] }} />
      {label ? <em>{label}</em> : null}
    </span>
  );
}
