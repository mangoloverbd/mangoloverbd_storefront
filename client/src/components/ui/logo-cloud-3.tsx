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
      className="flex w-full flex-col items-center overflow-hidden border-b border-[#19382d]/25 bg-[#FBBB14] px-4 py-4 text-[#19382d]"
    >
      <style>{`
        @keyframes honey-trust-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .honey-trust-track {
          animation: honey-trust-marquee 26s linear infinite;
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
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#19382d]">
          বিশ্বাস করে অর্ডার করার ৩টি কারণ
        </p>

        <div className="honey-trust-mask relative mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="honey-trust-track flex w-max items-stretch">
            {[...items, ...items].map(({ title, text }, index) => {
              const Icon = itemIcons[index % itemIcons.length];
              return (
                <div
                  key={`${title}-${index}`}
                  className="flex w-[15rem] shrink-0 items-center gap-2.5 border-r border-[#19382d]/25 px-5 text-left last:border-r-0 sm:w-[18rem]"
                  aria-hidden={index >= items.length ? "true" : undefined}
                >
                  <Icon className="size-5 shrink-0 text-[#19382d]" aria-hidden="true" />
                  <div>
                    <strong className="block font-serif text-base font-medium tracking-tight">
                      {title}
                    </strong>
                    <span className="mt-0.5 block text-xs leading-5 text-[#19382d]/80">{text}</span>
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
