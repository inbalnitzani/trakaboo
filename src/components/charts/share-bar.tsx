import { cn } from "@/lib/utils";

export type ShareSegment = {
  id: string;
  value: number;
  /** Any CSS color, e.g. "var(--series-1)". */
  color: string;
};

type ShareBarProps = {
  segments: readonly ShareSegment[];
  /** Accessible description, e.g. "By category". */
  ariaLabel: string;
  className?: string;
};

/** One outlined pill split into rounded segments sized by share of the total. */
export function ShareBar({ segments, ariaLabel, className }: ShareBarProps) {
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("flex h-6 gap-1 rounded-full border-2 bg-surface p-[3px]", className)}
    >
      {visible.map((s) => (
        <span
          key={s.id}
          data-segment={s.id}
          className="min-w-1.5 rounded-full"
          style={{ flexGrow: s.value / total, flexBasis: 0, background: s.color }}
        />
      ))}
    </div>
  );
}
