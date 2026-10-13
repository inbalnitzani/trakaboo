import { useTranslations } from "next-intl";

import { getCategory } from "@/config/categories";
import { CategoryIcon } from "@/features/transactions/category-icon";
import { useFormatters } from "@/i18n/use-formatters";
import type { PlannedRow } from "@/lib/import/plan";
import { cn } from "@/lib/utils";

type ImportRowProps = {
  row: PlannedRow;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** One statement row in the import preview, with a checkbox to include it. */
export function ImportRow({ row, checked, onCheckedChange }: ImportRowProps) {
  const t = useTranslations("import");
  const tc = useTranslations("categories");
  const format = useFormatters();
  const done = row.status === "alreadyImported";

  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-[1.375rem] border-2 bg-surface px-3.5 py-2.5",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
        done ? "opacity-60" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={done}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="size-5 shrink-0 accent-primary"
      />
      <CategoryIcon categoryId={row.categoryId} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{row.merchant}</p>
        <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
          {format.date(row.date)} · {tc(getCategory(row.categoryId).id)}
          {row.note && ` · ${row.note}`}
        </p>
        {row.status !== "new" && (
          <p className="mt-0.5 text-[0.8125rem] font-medium text-accent">
            {t(`status.${row.status}`)}
          </p>
        )}
        {row.match && (
          <p className="text-[0.8125rem] text-muted-foreground">
            <bdi>{row.match.merchant}</bdi> · {format.date(row.match.date)}
          </p>
        )}
      </div>
      <span className="font-display text-lg font-semibold tabular-nums">
        {format.money(row.amount, 2)}
      </span>
    </label>
  );
}
