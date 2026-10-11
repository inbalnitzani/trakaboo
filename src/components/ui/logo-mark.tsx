import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: {
    box: "size-10 rounded-[0.8rem] gap-0.5 border-2",
    eye: "size-3.5 border-[1.5px] p-px",
    pupil: "size-1.5",
  },
  md: {
    box: "size-14 rounded-[1.1rem] gap-1 border-2",
    eye: "size-5 border-2 p-0.5",
    pupil: "size-2",
  },
  lg: {
    box: "size-28 rounded-[2.25rem] gap-2 border-[2.5px] shadow-pop-lg",
    eye: "size-10 border-[2.5px] p-1",
    pupil: "size-4",
  },
} as const;

/** The Trakaboo mark: two googly eyes peeking out of a tilted pink tile. Decorative. */
export function LogoMark({ size = "md", className }: LogoMarkProps) {
  const s = SIZE[size];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 -rotate-6 items-center justify-center bg-primary",
        s.box,
        className,
      )}
    >
      {[0, 1].map((i) => (
        <span key={i} className={cn("flex items-end justify-end rounded-full bg-surface", s.eye)}>
          <span className={cn("rounded-full bg-foreground", s.pupil)} />
        </span>
      ))}
    </span>
  );
}
