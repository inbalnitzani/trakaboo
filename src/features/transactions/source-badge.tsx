import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { TransactionSource } from "@/lib/transactions/types";
import { cn } from "@/lib/utils";

/** Small pill showing where a transaction came from. */
export function SourceBadge({
  source,
  className,
}: {
  source: TransactionSource;
  className?: string;
}) {
  const t = useTranslations("sources");
  return (
    <Badge
      variant="outline"
      className={cn("h-4.5 border-[1.5px] px-1.5 text-[11px] text-foreground", className)}
    >
      {t(source)}
    </Badge>
  );
}
