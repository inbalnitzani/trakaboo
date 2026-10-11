import { useTranslations } from "next-intl";

import { ShareBar } from "@/components/charts/share-bar";
import { SERIES_COLOR } from "@/config/categories";
import type { CategoryTotal } from "@/lib/transactions/stats";

import { toCategorySegments } from "./category-segments";

/** The month's split by category as one segmented bar, in fixed chart-slot order. */
export function CategoryShare({ totals }: { totals: readonly CategoryTotal[] }) {
  const t = useTranslations("overview");
  const segments = toCategorySegments(totals).map((segment) =>
    segment.kind === "other"
      ? { id: "other", value: segment.total, color: SERIES_COLOR.other }
      : { id: segment.categoryId, value: segment.total, color: SERIES_COLOR[segment.slot] },
  );

  return <ShareBar segments={segments} ariaLabel={t("byCategory")} />;
}
