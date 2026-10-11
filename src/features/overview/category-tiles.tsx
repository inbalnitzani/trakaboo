import { useTranslations } from "next-intl";

import { ColorDot } from "@/components/ui/color-dot";
import { categoryColor, getCategory, TINT_BG_CLASS } from "@/config/categories";
import { useFormatters } from "@/i18n/use-formatters";
import type { CategoryComparison, CategoryTotal } from "@/lib/transactions/stats";
import { cn } from "@/lib/utils";

import { type TileShape, tileShapes } from "./tile-layout";

type CategoryTilesProps = {
  /** Largest first. */
  totals: readonly CategoryTotal[];
  /** Change vs. last month per category; omit to hide the change pills. */
  comparison?: readonly CategoryComparison[];
};

const SHAPE_CLASS: Record<TileShape, string> = {
  tall: "row-span-2",
  wide: "col-span-2",
  regular: "",
};

/** Colorful tiles for the biggest categories, compact pills for the rest. */
export function CategoryTiles({ totals, comparison }: CategoryTilesProps) {
  const t = useTranslations();
  const format = useFormatters();
  const grandTotal = totals.reduce((sum, c) => sum + c.total, 0);
  const changes = new Map(comparison?.map((c) => [c.categoryId, c.changePct]));
  const shapes = tileShapes(totals.length);
  const tiles = totals.slice(0, shapes.length);
  const rest = totals.slice(shapes.length);

  const changeLabel = (pct: number | null) =>
    pct === null
      ? t("overview.changeNew")
      : pct === 0
        ? t("overview.same")
        : `${pct > 0 ? "▲" : "▼"}${Math.abs(pct)}%`;

  return (
    <div className="grid gap-3">
      <ul className="grid auto-rows-[7.5rem] grid-cols-2 gap-3">
        {tiles.map(({ categoryId, total }, i) => {
          const category = getCategory(categoryId);
          const pct = changes.get(categoryId);
          return (
            <li
              key={categoryId}
              className={cn(
                "flex min-w-0 flex-col justify-between rounded-[1.625rem] border-2 p-3.5",
                TINT_BG_CLASS[category.tint],
                SHAPE_CLASS[shapes[i]],
              )}
            >
              <span className="flex items-center gap-2 text-[0.9375rem] font-medium">
                <ColorDot color={categoryColor(categoryId)} />
                {t(`categories.${categoryId}`)}
              </span>
              <span className="grid gap-1.5">
                <span
                  className={cn(
                    "font-display leading-none font-bold tracking-tight tabular-nums",
                    shapes[i] === "tall" ? "text-[2.5rem]" : "text-[1.625rem]",
                  )}
                >
                  {format.money(Math.round(total))}
                </span>
                <span className="flex items-center gap-1.5 text-[0.8125rem]">
                  <span className="text-soft-foreground tabular-nums">
                    {grandTotal ? Math.round((total / grandTotal) * 100) : 0}%
                  </span>
                  {pct !== undefined && (
                    <span
                      dir="ltr"
                      className={cn(
                        "rounded-full border-[1.5px] px-2 font-medium tabular-nums",
                        pct === null || pct === 0
                          ? "bg-surface"
                          : pct > 0
                            ? "bg-pop-peach"
                            : "bg-pop-lime",
                      )}
                    >
                      {changeLabel(pct)}
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {rest.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {rest.map(({ categoryId, total }) => (
            <li
              key={categoryId}
              className={cn(
                "flex h-12 min-w-[calc(50%-0.3125rem)] flex-1 items-center gap-2 rounded-full border-2 px-3.5 text-sm font-medium",
                TINT_BG_CLASS[getCategory(categoryId).tint],
              )}
            >
              <ColorDot color={categoryColor(categoryId)} size="sm" />
              <span className="flex-1 truncate">{t(`categories.${categoryId}`)}</span>
              <span className="font-display text-[1.0625rem] font-semibold tabular-nums">
                {format.money(Math.round(total))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
