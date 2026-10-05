import { cn } from "@/lib/utils";

type ChartTooltipProps = {
  /** Anchor point inside the chart container (px number or CSS length like "40%"). */
  x: number | string;
  y: number | string;
  children: React.ReactNode;
  className?: string;
};

/** Small dark label that floats above a hovered mark. Place inside a `relative` container. */
export function ChartTooltip({ x, y, children, className }: ChartTooltipProps) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-2.5 py-1.5",
        "text-xs leading-snug whitespace-nowrap text-background shadow-lg",
        className,
      )}
      style={{ left: x, top: `calc(${typeof y === "number" ? `${y}px` : y} - 8px)` }}
    >
      {children}
    </div>
  );
}
