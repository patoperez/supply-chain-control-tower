import type { ReactNode } from "react";

// Minimal typed shape of what Recharts passes to a custom Tooltip `content`.
export interface TipProps<T> {
  active?: boolean;
  payload?: Array<{ payload: T }>;
}

export function TooltipBox({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-panel px-3 py-2 shadow-lg">
      <p className="text-xs text-bright">{title}</p>
      <div className="mt-1 space-y-0.5 font-mono text-[11px]">{children}</div>
    </div>
  );
}
