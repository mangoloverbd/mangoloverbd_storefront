import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, type PointerEvent } from "react";
import { Link } from "wouter";

const ORDER_HREF = "/collection/jaggery";

const STORIES = [
  {
    src: "/hero-stories/village.webp",
    alt: "গ্রামের পটভূমিতে ম্যাংগো লাভার খেজুরের বীজ গুড় ও ঝোলা গুড়ের জার, পাটালি ও মাটির বাটিতে গুড়",
    title: "শীতের প্রথম ব্যাচ",
    step: "রস নামানো",
    time: "ভোর ৪টা",
    at: 0,
    caption: "গ্রামের গাছিদের হাতে বানানো খেজুরের গুড়",
  },
  {
    src: "/hero-stories/jhola-gur.webp",
    alt: "ম্যাংগো লাভার খেজুরের ঝোলা গুড়ের জার ও চামচে গুড়",
    title: "ঝোলা গুড়",
    step: "ঝোলা গুড়",
    time: "সকাল ৮টা",
    at: 50,
    caption: "রুটি, মুড়ি আর পায়েসে এক চামচ",
  },
  {
    src: "/hero-stories/bij-gur.webp",
    alt: "ম্যাংগো লাভার খেজুরের বীজ গুড়ের জার",
    title: "বীজ গুড়",
    step: "বীজ গুড়",
    time: "সকাল ১০টা",
    at: 75,
    caption: "দানাদার আর ঘন, পিঠার জন্য সেরা",
  },
  {
    src: "/hero-stories/patali.webp",
    alt: "তালপাতার উপর খেজুরের পাটালি",
    title: "পাটালি",
    step: "পাটালি",
    time: "দুপুর ১২টা",
    at: 100,
    caption: "ভেতরে দানাদার, শীতের সকালের সঙ্গী",
  },
];

const STORY_DURATION_MS = 4500;
const ease = [0.23, 1, 0.32, 1] as const;

export default function StoriesHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (index: number) => setActive((index + STORIES.length) % STORIES.length);
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);
  const holdHandlers = {
    onPointerDown: (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("a")) pause();
    },
    onPointerUp: resume,
    onPointerLeave: resume,
    onPointerCancel: resume,
  };

  // Only the visible layout's bar animates (display:none stops CSS animations), so it alone advances the story.
  const progressBars = (
    <div className="flex gap-[5px]">
      {STORIES.map((story, index) => (
        <span key={story.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
          {index < active && <span className="block h-full w-full bg-white" />}
          {index === active && (
            <span
              key={active}
              className="story-progress block h-full w-full bg-white"
              style={{ animationDuration: `${STORY_DURATION_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
              onAnimationEnd={() => go(active + 1)}
            />
          )}
        </span>
      ))}
    </div>
  );

  return (
    <section className="w-full bg-[#f6f6f6]">
      {/* Mobile: headline, morning timeline, then the story card. */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="px-5 pb-6 pt-1"
        >
          <h1 className="font-['IhtishamDeshlipi'] text-[52px] leading-[1.08] text-[#3d1c0c]">
            খেজুরের
            <br />
            খাঁটি গুড়
          </h1>
          <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#6a4a35]">
            শীতের ভোরের রস, মাটির চুলায় জ্বাল।
          </p>

          {/* Tree-to-jar timeline: hairline axis on an honest 4am–12pm scale, synced to the story card. */}
          <div className="mt-6 max-w-[460px]">
            <ol className="relative h-[100px]">
              <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-[#3d1c0c]/25" />
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-px origin-left bg-[#3d1c0c] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                style={{ width: "100%", transform: `scaleX(${STORIES[active].at / 100})` }}
              />
              {STORIES.map((story, index) => {
                const isActive = index === active;
                const above = index % 2 === 0;
                const align = story.at === 0 ? "left-0 items-start text-left" : story.at === 100 ? "right-0 items-end text-right" : "-translate-x-1/2 items-center text-center";
                return (
                  <li
                    key={story.src}
                    className="absolute inset-y-0"
                    style={story.at === 100 ? { right: 0 } : { left: `${story.at}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => go(index)}
                      aria-current={isActive ? "step" : undefined}
                      className="group absolute inset-y-0 w-0 cursor-pointer"
                      style={story.at === 100 ? { right: 0 } : { left: 0 }}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border transition-colors duration-200 ease-out ${
                          story.at === 100 ? "right-0" : story.at === 0 ? "left-0" : "-translate-x-1/2"
                        } ${
                          isActive ? "border-[#f28c1b] bg-[#f28c1b]" : index < active ? "border-[#3d1c0c] bg-[#3d1c0c]" : "border-[#3d1c0c]/40 bg-[#f6f6f6]"
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute h-3 w-px bg-[#3d1c0c]/25 ${above ? "bottom-[calc(50%+7px)]" : "top-[calc(50%+7px)]"} ${
                          story.at === 100 ? "right-[4.5px]" : story.at === 0 ? "left-[4.5px]" : "left-0"
                        }`}
                      />
                      <span
                        className={`absolute flex w-max flex-col ${align} ${above ? "bottom-[calc(50%+22px)]" : "top-[calc(50%+22px)]"}`}
                      >
                        <span className="text-[11px] leading-tight text-[#9a7a62]">{story.time}</span>
                        <span
                          className={`text-[14px] font-semibold leading-tight transition-colors duration-200 ease-out ${
                            isActive ? "text-[#c2410c]" : "text-[#3d1c0c] group-hover:text-[#c2410c]"
                          }`}
                        >
                          {story.step}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          aria-roledescription="carousel"
          aria-label="খেজুরের গুড়ের ছবি"
          className="relative mx-4 mb-8 aspect-[4/5] select-none overflow-hidden rounded-[4px] bg-[#2a1205]"
          {...holdHandlers}
        >
          {STORIES.map((story, index) => (
            <div
              key={story.src}
              aria-hidden={index !== active}
              className={`absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={story.src}
                alt={story.alt}
                width={960}
                height={960}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_20%,rgba(0,0,0,0)_45%,rgba(20,8,2,0.88)_100%)]" />
              <div className="absolute inset-x-[22px] bottom-[92px] text-white">
                <p className="font-['KaiumSimanto'] text-[34px] leading-[1.05]">{story.title}</p>
                <p className="mt-1.5 text-[15px] text-white/85">{story.caption}</p>
              </div>
            </div>
          ))}

          <div className="absolute inset-x-3.5 top-3.5 z-20">{progressBars}</div>

          <button
            type="button"
            aria-label="আগের ছবি"
            onClick={() => go(active - 1)}
            className="absolute bottom-20 left-0 top-0 z-10 w-[35%] cursor-pointer"
          />
          <button
            type="button"
            aria-label="পরের ছবি"
            onClick={() => go(active + 1)}
            className="absolute bottom-20 right-0 top-0 z-10 w-[65%] cursor-pointer"
          />

          <div className="absolute inset-x-3.5 bottom-3.5 z-20 flex items-center justify-between gap-3 rounded-full bg-white/95 py-2 pl-5 pr-2">
            <span className="text-sm leading-tight text-[#6a4a35]">
              শীতের নতুন
              <b className="block text-[17px] text-[#3d1c0c]">খেজুরের গুড়</b>
            </span>
            <Link
              href={ORDER_HREF}
              className="inline-flex h-[46px] items-center gap-2 rounded-full bg-[#f28c1b] px-5 text-[15px] font-semibold text-[#2a1205] transition-[transform,background-color] duration-150 ease-out hover:bg-[#ff9d33] active:scale-[0.97]"
            >
              অর্ডার করুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Desktop: all four frames in a strip; the playing one opens wide. */}
      <div className="mx-auto hidden max-w-[1500px] px-8 pb-14 pt-9 md:block xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="mb-7 flex items-end justify-between gap-10"
        >
          <div>
            <h1 className="font-['IhtishamDeshlipi'] text-[clamp(64px,5.6vw,80px)] leading-[1.08] text-[#3d1c0c]">
              খেজুরের
              <br />
              খাঁটি গুড়
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-[#6a4a35]">শীতের ভোরের রস, মাটির চুলায় জ্বাল।</p>
          </div>
          <Link
            href={ORDER_HREF}
            className="group inline-flex h-[54px] shrink-0 items-center gap-2.5 rounded-full bg-[#3d1c0c] px-7 text-[17px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-[#2a1107] active:scale-[0.97]"
          >
            অর্ডার করুন
            <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-[3px]" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          aria-roledescription="carousel"
          aria-label="খেজুরের গুড়ের ছবি"
          className="flex h-[460px] select-none gap-2.5"
          {...holdHandlers}
        >
          {STORIES.map((story, index) => {
            const isActive = index === active;
            return (
              <button
                key={story.src}
                type="button"
                onClick={() => !isActive && go(index)}
                aria-label={`${story.time} · ${story.step}`}
                aria-current={isActive ? "step" : undefined}
                className={`group relative min-w-0 basis-0 overflow-hidden rounded-[22px] bg-[#2a1205] text-left transition-[flex-grow] duration-[600ms] ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none ${
                  isActive ? "cursor-default" : "cursor-pointer"
                }`}
                style={{ flexGrow: isActive ? 3.6 : 1 }}
              >
                <img
                  src={story.src}
                  alt={story.alt}
                  width={960}
                  height={960}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-300 ease-out ${
                    isActive ? "" : "brightness-[0.78] saturate-[0.75] group-hover:brightness-90 group-hover:saturate-[0.95]"
                  }`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0)_22%,rgba(0,0,0,0)_48%,rgba(20,8,2,0.86)_100%)]" />
                <div
                  className={`absolute inset-x-[18px] bottom-[18px] text-white transition-opacity duration-200 ease-out ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="text-xs text-white/75">{story.time}</span>
                  <b className="block whitespace-nowrap text-[19px] font-semibold">{story.step}</b>
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-[250ms] ease-out ${
                    isActive ? "opacity-100 delay-[250ms]" : "opacity-0"
                  }`}
                >
                  {isActive && <div className="absolute inset-x-4 top-4">{progressBars}</div>}
                  <span className="absolute left-7 top-[34px] text-[13px] text-white/85">
                    {story.time} · {story.step}
                  </span>
                  <div className="absolute bottom-[30px] left-7 text-white">
                    <p className="whitespace-nowrap font-['KaiumSimanto'] text-[40px] leading-[1.05]">{story.title}</p>
                    <p className="mt-1.5 whitespace-nowrap text-[15px] text-white/85">{story.caption}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        <div aria-hidden="true" className="mt-3.5 flex gap-2.5">
          {STORIES.map((story, index) => (
            <span
              key={story.src}
              className={`h-px basis-0 transition-[flex-grow] duration-[600ms] ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none ${
                index === active ? "bg-[#3d1c0c]" : "bg-[#3d1c0c]/20"
              }`}
              style={{ flexGrow: index === active ? 3.6 : 1 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
