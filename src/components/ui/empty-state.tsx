import { cn } from "@/lib/utils";

type EmptyStateProps = {
  /** Mark or icon element shown above the title. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional call to action (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-3" aria-hidden>
          {icon}
        </div>
      )}
      <p className="font-display text-xl font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-soft-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
