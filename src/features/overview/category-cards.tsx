import { useTranslations } from "next-intl";

import { getCategory, TINT_BG_CLASS } from "@/config/categories";
import { useFormatters } from "@/i18n/use-formatters";
import type { CategoryTotal } from "@/lib/transactions/stats";
import { cn } from "@/lib/utils";

/** Horizontally scrolling cards: one per category with spend this month, largest first. */
export function CategoryCards({ totals }: { totals: readonly CategoryTotal[] }) {
  const t = useTranslations("categories");
  const format = useFormatters();

  return (
    <ul className="-mx-4 flex snap-x [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 py-1">
      {totals.map(({ categoryId, total }) => {
        const category = getCategory(categoryId);
        return (
          <li
            key={categoryId}
            className={cn(
              "w-28 shrink-0 snap-start rounded-2xl p-3.5",
              TINT_BG_CLASS[category.tint],
            )}
          >
            <span aria-hidden className="text-2xl">
              {category.emoji}
            </span>
            <p className="mt-1.5 text-sm font-medium text-muted-foreground">{t(category.id)}</p>
            <p className="text-lg font-bold tabular-nums">{format.money(Math.round(total))}</p>
          </li>
        );
      })}
    </ul>
  );
}
