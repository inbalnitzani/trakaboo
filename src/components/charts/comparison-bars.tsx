import { cn } from "@/lib/utils";

export type ComparisonRow = {
  id: string;
  label: React.ReactNode;
  current: number;
  previous: number;
  /** Already formatted change, e.g. "▲ 12%" or "new". */
  change: string;
  trend: "up" | "down" | "flat";
  /** Accessible summary of the row. */
  title?: string;
};

type ComparisonBarsProps = {
  rows: readonly ComparisonRow[];
  currentLabel: string;
  previousLabel: string;
  currentColor?: string;
  previousColor?: string;
  className?: string;
};

const TREND_CLASS = {
  up: "text-trend-up",
  down: "text-trend-down",
  flat: "text-muted-foreground",
} as const;

/** Paired horizontal bars per row (current vs previous) on one shared scale. */
export function ComparisonBars({
  rows,
  currentLabel,
  previousLabel,
  currentColor = "var(--series-4)",
  previousColor = "var(--series-prev)",
  className,
}: ComparisonBarsProps) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.current, r.previous]));
  const width = (v: number) => `${(v / max) * 100}%`;

  return (
    <div className={className}>
      <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
        <LegendKey color={currentColor} label={currentLabel} />
        <LegendKey color={previousColor} label={previousLabel} />
      </div>
      <ul className="grid gap-1">
        {rows.map((row) => (
          <li
            key={row.id}
            title={row.title}
            className="grid grid-cols-[6rem_1fr_3.5rem] items-center gap-2 py-1 text-sm"
          >
            <span className="truncate">{row.label}</span>
            <span className="grid gap-0.5" aria-hidden>
              <span
                className="h-2 min-w-0.5 rounded-e-sm"
                style={{ width: width(row.current), background: currentColor }}
              />
              <span
                className="h-2 min-w-0.5 rounded-e-sm"
                style={{ width: width(row.previous), background: previousColor }}
              />
            </span>
            <span
              className={cn("text-end text-xs font-semibold tabular-nums", TREND_CLASS[row.trend])}
            >
              {row.change}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-[3px]" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}
