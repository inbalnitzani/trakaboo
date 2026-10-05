"use client";

import { cn } from "@/lib/utils";

import { useHighlight } from "./use-highlight";

export type DonutSegment = {
  id: string;
  label: React.ReactNode;
  value: number;
  /** Any CSS color, e.g. "var(--series-1)". */
  color: string;
  /** Extra lines shown when the segment is highlighted (e.g. what "Other" contains). */
  detail?: React.ReactNode;
};

type DonutChartProps = {
  segments: readonly DonutSegment[];
  formatValue: (value: number) => string;
  /** Small text above the center value. */
  centerLabel?: React.ReactNode;
  /** Big text in the middle; defaults to the formatted total. */
  centerValue?: React.ReactNode;
  /** Accessible description of the chart. */
  ariaLabel: string;
  size?: number;
  className?: string;
};

const RADIUS = 62;
const INNER = 40;
const VIEW = 150;
const C = VIEW / 2;

function point(radius: number, angle: number) {
  return `${C + radius * Math.cos(angle)},${C + radius * Math.sin(angle)}`;
}

function arcPath(start: number, end: number) {
  // A full circle can't be drawn with one arc; nudge the end slightly.
  const stop = end - start >= Math.PI * 2 ? end - 0.0001 : end;
  const large = stop - start > Math.PI ? 1 : 0;
  return [
    `M${point(RADIUS, start)}`,
    `A${RADIUS},${RADIUS} 0 ${large} 1 ${point(RADIUS, stop)}`,
    `L${point(INNER, stop)}`,
    `A${INNER},${INNER} 0 ${large} 0 ${point(INNER, start)}`,
    "Z",
  ].join(" ");
}

/** Turns segment values into SVG arc paths, starting at 12 o'clock and going clockwise. */
function toArcs(segments: readonly DonutSegment[], total: number) {
  const visible = segments.filter((s) => s.value > 0);
  const starts = visible.map((_, i) =>
    visible.slice(0, i).reduce((angle, s) => angle + (s.value / total) * Math.PI * 2, -Math.PI / 2),
  );
  return visible.map((s, i) => ({
    ...s,
    d: arcPath(starts[i], starts[i] + (s.value / total) * Math.PI * 2),
  }));
}

/** Donut chart with a legend; hovering or tapping a slice or legend row highlights it. */
export function DonutChart({
  segments,
  formatValue,
  centerLabel,
  centerValue,
  ariaLabel,
  size = 170,
  className,
}: DonutChartProps) {
  const { active, selected, hover, leave, toggle } = useHighlight<string>();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const percent = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  const arcs = toArcs(segments, total);

  const activeSegment = segments.find((s) => s.id === active);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={size}
        height={size}
        role="img"
        aria-label={ariaLabel}
      >
        {arcs.map((s) => (
          <path
            key={s.id}
            d={s.d}
            fill={s.color}
            stroke="var(--card)"
            strokeWidth={2}
            strokeLinejoin="round"
            className={cn(
              "cursor-pointer transition-opacity",
              active && active !== s.id && "opacity-35",
            )}
            onMouseEnter={() => hover(s.id)}
            onMouseLeave={leave}
            onClick={() => toggle(s.id)}
          />
        ))}
        <text x={C} y={C - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          {activeSegment ? `${percent(activeSegment.value)}%` : centerLabel}
        </text>
        <text
          x={C}
          y={C + 12}
          textAnchor="middle"
          className="fill-foreground text-[15px] font-bold"
        >
          {activeSegment ? formatValue(activeSegment.value) : (centerValue ?? formatValue(total))}
        </text>
      </svg>

      <ul className="grid w-full gap-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-1.5 py-0.5 text-start transition-colors",
                active === s.id && "bg-muted",
              )}
              onMouseEnter={() => hover(s.id)}
              onMouseLeave={leave}
              onClick={() => toggle(s.id)}
              aria-pressed={selected === s.id}
            >
              <span
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span className="font-semibold tabular-nums">{formatValue(s.value)}</span>
              <span className="w-9 text-end text-muted-foreground tabular-nums">
                {percent(s.value)}%
              </span>
            </button>
            {active === s.id && s.detail && (
              <div className="ps-6 pt-1 text-xs text-muted-foreground">{s.detail}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
