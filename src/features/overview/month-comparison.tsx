import { useTranslations } from "next-intl";

import { ComparisonBars, type ComparisonRow } from "@/components/charts/comparison-bars";
import { getCategory } from "@/config/categories";
import { useFormatters } from "@/i18n/use-formatters";
import type { CategoryComparison } from "@/lib/transactions/stats";

export function MonthComparison({ rows }: { rows: readonly CategoryComparison[] }) {
  const t = useTranslations();
  const format = useFormatters();

  const data: ComparisonRow[] = rows.map((row) => {
    const category = getCategory(row.categoryId);
    const name = t(`categories.${category.id}`);
    const pct = row.changePct;
    return {
      id: category.id,
      label: `${category.emoji} ${name}`,
      current: row.current,
      previous: row.previous,
      change:
        pct === null
          ? t("overview.changeNew")
          : `${pct > 0 ? "▲" : pct < 0 ? "▼" : ""} ${Math.abs(pct)}%`,
      trend: pct === null || pct === 0 ? "flat" : pct > 0 ? "up" : "down",
      title: `${name}: ${format.money(Math.round(row.current))} / ${format.money(Math.round(row.previous))}`,
    };
  });

  return (
    <ComparisonBars
      rows={data}
      currentLabel={t("overview.thisMonth")}
      previousLabel={t("overview.lastMonth")}
    />
  );
}
