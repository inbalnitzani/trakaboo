"use client";

import { useTranslations } from "next-intl";

import { DonutChart, type DonutSegment } from "@/components/charts/donut-chart";
import { getCategory, SERIES_COLOR } from "@/config/categories";
import { useFormatters } from "@/i18n/use-formatters";
import type { CategoryTotal } from "@/lib/transactions/stats";

import { toCategorySegments } from "./category-segments";

export function CategoryDonut({ totals }: { totals: readonly CategoryTotal[] }) {
  const t = useTranslations();
  const format = useFormatters();
  const money = (v: number) => format.money(Math.round(v));

  const segments: DonutSegment[] = toCategorySegments(totals).map((segment) => {
    if (segment.kind === "other") {
      return {
        id: "other",
        label: `✨ ${t("categories.other")}`,
        value: segment.total,
        color: SERIES_COLOR.other,
        detail: segment.parts
          .map(
            (p) =>
              `${getCategory(p.categoryId).emoji} ${t(`categories.${p.categoryId}`)} ${money(p.total)}`,
          )
          .join(" · "),
      };
    }
    const category = getCategory(segment.categoryId);
    return {
      id: category.id,
      label: `${category.emoji} ${t(`categories.${category.id}`)}`,
      value: segment.total,
      color: SERIES_COLOR[segment.slot],
    };
  });

  return (
    <DonutChart
      segments={segments}
      formatValue={money}
      centerLabel={t("overview.categoriesCount", { count: totals.length })}
      ariaLabel={t("overview.byCategory")}
    />
  );
}
