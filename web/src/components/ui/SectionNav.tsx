"use client";

import { useEffect, useState } from "react";

const BEATS = [
  { id: "hook", label: "Hook" },
  { id: "raw-data", label: "Raw data" },
  { id: "cleaning", label: "Cleaning" },
  { id: "findings", label: "Findings" },
  { id: "dashboard", label: "Dashboard" },
  { id: "prediction", label: "Prediction" },
  { id: "recommendation", label: "Recommendation" },
] as const;

export default function SectionNav() {
  const [active, setActive] = useState<string>("hook");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const doc = document.documentElement;
    const onScroll = () => {
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const b of BEATS) {
      const el = document.getElementById(b.id);
      if (el) obs.observe(el);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Scroll progress — all sizes */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5">
        <div
          className="h-full bg-accent"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-label="Reading progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Beat dot-nav — desktop */}
      <nav
        aria-label="Section navigation"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col items-end gap-1">
          {BEATS.map((b) => {
            const on = active === b.id;
            return (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  aria-label={b.label}
                  aria-current={on ? "true" : undefined}
                  className="group relative flex items-center justify-end py-1.5"
                >
                  <span className="pointer-events-none absolute right-5 whitespace-nowrap rounded border border-border bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-body opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {b.label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full transition-colors ${
                      on ? "bg-accent" : "bg-border group-hover:bg-dim"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
