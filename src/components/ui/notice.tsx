import { cn } from "@/lib/utils";

type NoticeProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** A lime sticker-style banner for non-critical information. */
export function Notice({ icon, children, className }: NoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-[1.375rem] border-2 bg-pop-lime px-4 py-3 text-sm text-foreground",
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="font-display text-lg leading-5">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
