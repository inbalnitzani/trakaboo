import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { TransactionSource } from "@/lib/transactions/types";
import { cn } from "@/lib/utils";

const STYLE: Record<TransactionSource, string> = {
  apple_pay: "bg-foreground text-background",
  cal: "bg-tint-sky text-on-tint-sky",
  max: "bg-tint-rose text-on-tint-rose",
  manual: "bg-tint-butter text-on-tint-butter",
};

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
      className={cn("h-4.5 border-0 px-1.5 text-[10.5px] font-semibold", STYLE[source], className)}
    >
      {t(source)}
    </Badge>
  );
}
