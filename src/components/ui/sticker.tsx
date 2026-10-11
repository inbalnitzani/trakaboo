import { cn } from "@/lib/utils";

export type StickerTone = "lime" | "peach" | "lilac" | "milk";

type StickerProps = {
  children: React.ReactNode;
  tone?: StickerTone;
  /** Slight rotation for a hand-placed look. */
  tilt?: "left" | "right" | "none";
  className?: string;
};

const TONE: Record<StickerTone, string> = {
  lime: "bg-pop-lime",
  peach: "bg-pop-peach",
  lilac: "bg-pop-lilac",
  milk: "bg-card",
};

const TILT = { left: "-rotate-6", right: "rotate-3", none: "" } as const;

/** A small outlined pill that looks stuck on: trends, counts, file formats. */
export function Sticker({ children, tone = "lime", tilt = "left", className }: StickerProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border-2 px-3.5 py-1 font-display text-[0.9375rem] font-semibold text-foreground",
        TONE[tone],
        TILT[tilt],
        className,
      )}
    >
      {children}
    </span>
  );
}
