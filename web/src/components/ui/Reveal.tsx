"use client";

import { useEffect, useRef, useState } from "react";

// One orchestrated reveal per section: a restrained fade + slide-up when the
// section enters the viewport. SSR renders it visible (so it works with JS
// disabled and never causes layout shift — only opacity/transform animate);
// below-the-fold sections are hidden on mount (off-screen, unseen) and revealed
// on scroll. prefers-reduced-motion → no animation, always visible.

type State = "initial" | "hidden" | "shown";

export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("initial");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("shown");
      return;
    }
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      setState("shown");
      return;
    }
    setState("hidden");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setState("shown");
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const motion =
    state === "hidden"
      ? "opacity-0 translate-y-5"
      : state === "shown"
        ? "opacity-100 translate-y-0"
        : "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${motion} ${className}`}
    >
      {children}
    </div>
  );
}
