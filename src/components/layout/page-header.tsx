import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  /** Right-aligned (end-aligned in RTL) slot, e.g. a filter or button. */
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mt-3 mb-5 flex items-end justify-between gap-3", className)}>
      <h1 className="font-display text-4xl leading-none font-bold tracking-tight">{title}</h1>
      {actions}
    </div>
  );
}
