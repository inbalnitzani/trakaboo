import { cn } from "@/lib/utils";

type CheckerBandProps = {
  /** Number of squares across. */
  squares?: number;
  className?: string;
};

/** A full-width strip of alternating pink and milk squares between ink rules. Decorative. */
export function CheckerBand({ squares = 13, className }: CheckerBandProps) {
  return (
    <div
      aria-hidden
      className={cn("grid h-7.5 border-y-2", className)}
      style={{ gridTemplateColumns: `repeat(${squares}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: squares }, (_, i) => (
        <span key={i} className={i % 2 === 0 ? "bg-primary" : "bg-card"} />
      ))}
    </div>
  );
}
