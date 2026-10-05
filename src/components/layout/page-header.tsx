import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  /** Right-aligned (end-aligned in RTL) slot, e.g. a filter or button. */
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mt-4 mb-3 flex items-center justify-between gap-3", className)}>
      <h1 className="text-xl font-bold">{title}</h1>
      {actions}
    </div>
  );
}
