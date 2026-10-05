import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  /** Secondary text aligned to the end of the header. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** White rounded card with a small header — the building block of dashboard sections. */
export function SectionCard({ title, aside, children, className }: SectionCardProps) {
  return (
    <section className={cn("rounded-3xl bg-card p-4 shadow-soft", className)}>
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {aside && <span className="text-sm text-muted-foreground">{aside}</span>}
      </header>
      {children}
    </section>
  );
}
