import { cn } from "@/lib/utils";

type ColorDotProps = {
  /** Any CSS color, e.g. "var(--series-1)". */
  color: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE = { sm: "size-3", md: "size-3.5" } as const;

/** An ink-outlined color dot that keys an item to its chart color. Decorative. */
export function ColorDot({ color, size = "md", className }: ColorDotProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full border-2", SIZE[size], className)}
      style={{ background: color }}
    />
  );
}
