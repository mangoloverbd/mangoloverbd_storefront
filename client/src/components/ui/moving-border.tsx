"use client";

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type MovingBorderProps = {
  children: ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
};

export function MovingBorder({
  children,
  duration = 2000,
  rx = "30%",
  ry = "30%",
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (!length) return;
    progress.set((time * (length / duration)) % length);
  });

  const x = useTransform(progress, (value) => pathRef.current?.getPointAtLength(value).x ?? 0);
  const y = useTransform(progress, (value) => pathRef.current?.getPointAtLength(value).y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div
        className="absolute left-0 top-0 inline-block"
        style={{ transform }}
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </>
  );
}
