"use client";

import { HandCoins, PackageCheck, TreePine, type LucideIcon } from "lucide-react";

export type LogoCloudItem = {
  title: string;
  text: string;
};

type LogoCloudBlockProps = {
  items: readonly LogoCloudItem[];
};

const itemIcons: LucideIcon[] = [TreePine, PackageCheck, HandCoins];

export default function LogoCloudBlock({ items }: LogoCloudBlockProps) {
  return (
    <section
      aria-label="ম্যাংগো লাভারের প্রতিশ্রুতি"
      className="flex w-full flex-col items-center overflow-hidden border-b border-[#fffaf0]/20 bg-[#19382d] px-6 py-8 text-[#fffaf0]"
    >
      <style>{`
        @keyframes honey-trust-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .honey-trust-track {
          animation: honey-trust-marquee 32s linear infinite;
        }
        .honey-trust-mask:hover .honey-trust-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .honey-trust-track {
            animation: none;
          }
        }
      `}</style>

      <div className="w-full max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f5c456]">
          বিশ্বাস করে অর্ডার করার ৩টি কারণ
        </p>

        <div className="honey-trust-mask relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="honey-trust-track flex w-max items-stretch">
            {[...items, ...items].map(({ title, text }, index) => {
              const Icon = itemIcons[index % itemIcons.length];
              return (
                <div
                  key={`${title}-${index}`}
                  className="flex w-[18rem] shrink-0 items-center gap-3 border-r border-[#fffaf0]/20 px-8 text-left last:border-r-0 sm:w-[22rem]"
                  aria-hidden={index >= items.length ? "true" : undefined}
                >
                  <Icon className="size-6 shrink-0 text-[#f5c456]" aria-hidden="true" />
                  <div>
                    <strong className="block font-serif text-lg font-medium tracking-tight">
                      {title}
                    </strong>
                    <span className="mt-1 block text-sm leading-6 text-[#f4ecd9]">{text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
