import { cn } from "@/lib/utils";

type NoticeProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** A soft inline banner for non-critical information. */
export function Notice({ icon, children, className }: NoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-center gap-2 rounded-2xl bg-tint-butter px-3 py-2 text-xs font-medium text-on-tint-butter",
        className,
      )}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
