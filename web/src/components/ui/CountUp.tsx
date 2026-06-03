"use client";

import { useEffect, useRef, useState } from "react";

// Counts a number up to its value when it enters the viewport. Props are all
// serializable (no function props — this is rendered by Server Components).
// SSR renders the final value (correct with JS disabled); on mount, below-fold
// instances reset to 0 off-screen and count up on scroll. Reduced-motion → final.

export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  thousands = false,
  durationMs = 1000,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  thousands?: boolean;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value); // SSR / no-JS shows the real value
  const started = useRef(false);

  const fmt = (x: number) =>
    prefix +
    (thousands ? Math.round(x).toLocaleString() : x.toFixed(decimals)) +
    suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const animate = () => {
      if (started.current) return;
      started.current = true;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / durationMs);
        setN(value * ease(p));
        if (p < 1) requestAnimationFrame(tick);
        else setN(value);
      };
      requestAnimationFrame(tick);
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animate();
      return;
    }
    setN(0); // reset off-screen (unseen) so it counts up on scroll
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            animate();
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {fmt(n)}
    </span>
  );
}
