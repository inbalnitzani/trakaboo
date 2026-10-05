"use client";

import { cn } from "@/lib/utils";

import { ChartTooltip } from "./chart-tooltip";
import { useHighlight } from "./use-highlight";

export type Bar = {
  id: string;
  value: number;
  /** Tooltip content for this bar. */
  tooltip: React.ReactNode;
};

type BarChartProps = {
  bars: readonly Bar[];
  /** Indexes of bars that get an x-axis label, with the label text. */
  xTicks: readonly { index: number; label: string }[];
  /** Short y-axis label, e.g. 1000 → "1k". */
  formatAxis?: (value: number) => string;
  color?: string;
  ariaLabel: string;
  height?: number;
  className?: string;
};

const W = 360;
const PAD_LEFT = 30;
const PAD_BOTTOM = 18;
const PAD_TOP = 6;

/** Picks a "nice" grid step so the axis shows 2–5 lines. */
export function niceStep(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const factor of [0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10]) {
    const step = factor * magnitude;
    if (max / step <= 5) return step;
  }
  return magnitude * 10;
}

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

const compact = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v));

/** Vertical bar chart (e.g. spend per day) with hover/tap tooltips. Always laid out left-to-right. */
export function BarChart({
  bars,
  xTicks,
  formatAxis = compact,
  color = "var(--series-4)",
  ariaLabel,
  height = 150,
  className,
}: BarChartProps) {
  const { active, hover, leave, toggle } = useHighlight<number>();

  const max = Math.max(0, ...bars.map((b) => b.value));
  const step = niceStep(max);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const base = height - PAD_BOTTOM;
  const slot = (W - PAD_LEFT) / Math.max(bars.length, 1);
  const y = (v: number) => base - (v / top) * (base - PAD_TOP);
  const grid = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  const activeBar = active === null ? null : bars[active];

  return (
    <div className={cn("relative", className)} dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="block w-full"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={leave}
      >
        {grid.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} x2={W} y1={y(v)} y2={y(v)} className="stroke-border" />
            <text
              x={PAD_LEFT - 5}
              y={y(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatAxis(v)}
            </text>
          </g>
        ))}
        {xTicks.map(({ index, label }) => (
          <text
            key={index}
            x={PAD_LEFT + (index + 0.5) * slot}
            y={height - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {label}
          </text>
        ))}
        {bars.map((bar, i) => {
          const x = PAD_LEFT + i * slot + 1;
          const w = Math.max(slot - 2, 2);
          const h = base - y(bar.value);
          const r = Math.min(4, w / 2, h);
          return (
            <g key={bar.id}>
              {bar.value > 0 && (
                <path
                  d={`M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + w - r} Q${x + w},${base - h} ${x + w},${base - h + r} V${base} Z`}
                  fill={color}
                  className={cn("transition-[filter]", active === i && "brightness-90")}
                />
              )}
              {/* Full-height hit area so thin bars are easy to hover and tap. */}
              <rect
                x={PAD_LEFT + i * slot}
                y={PAD_TOP}
                width={slot}
                height={base - PAD_TOP}
                fill="transparent"
                onMouseEnter={() => hover(i)}
                onClick={() => toggle(i)}
              />
            </g>
          );
        })}
      </svg>
      {activeBar && active !== null && (
        <ChartTooltip
          x={pct(PAD_LEFT + (active + 0.5) * slot, W)}
          y={pct(y(activeBar.value), height)}
        >
          {activeBar.tooltip}
        </ChartTooltip>
      )}
    </div>
  );
}
