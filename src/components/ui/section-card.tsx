import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  /** Secondary text or a link aligned to the end of the header. */
  aside?: React.ReactNode;
  /** "card" draws an outlined milk card; "plain" is just the header and content on the page. */
  variant?: "card" | "plain";
  children: React.ReactNode;
  className?: string;
};

/** A titled section, the building block of dashboard screens. */
export function SectionCard({
  title,
  aside,
  variant = "card",
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        variant === "card" && "rounded-[1.75rem] border-2 bg-card p-5 text-card-foreground",
        className,
      )}
    >
      <header className="mb-3.5 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {aside && <span className="text-sm text-soft-foreground">{aside}</span>}
      </header>
      {children}
    </section>
  );
}
