"use client";

import { useEffect, useRef, useState } from "react";

// Defers mounting its children (a Recharts chart) until the area scrolls into
// view, so the chart's draw-in animation plays on scroll rather than off-screen
// at hydration. A reserved min-height keeps the layout stable (no shift).

export default function MountOnView({
  children,
  minHeight,
}: {
  children: React.ReactNode;
  minHeight: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight }}>
      {shown ? children : null}
    </div>
  );
}
