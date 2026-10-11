"use client";

import { useTranslations } from "next-intl";

import { BarChart } from "@/components/charts/bar-chart";
import { ColorDot } from "@/components/ui/color-dot";
import { useFormatters } from "@/i18n/use-formatters";
import { type IsoDate, type MonthKey } from "@/lib/dates/dates";

type DailySpendingProps = {
  month: MonthKey;
  /** Spend per day, index 0 = day 1. */
  daily: readonly number[];
  /** Purchases per day, same indexing. */
  counts: readonly number[];
  /** Index of today's bar when this is the current month. */
  todayIndex?: number;
  /** Daily average, drawn as a dashed line. */
  average?: number;
};

const TICK_DAYS = [1, 8, 15, 22, 29];

export function DailySpending({ month, daily, counts, todayIndex, average }: DailySpendingProps) {
  const t = useTranslations("overview");
  const format = useFormatters();

  const bars = daily.map((value, i) => {
    const date = `${month}-${String(i + 1).padStart(2, "0")}` as IsoDate;
    return {
      id: date,
      value,
      tooltip: (
        <>
          <b>{format.date(date, { weekday: "short", day: "numeric", month: "short" })}</b>
          <br />
          {format.money(value, 2)}, {t("dailyTooltip", { count: counts[i] })}
        </>
      ),
    };
  });

  return (
    <div className="grid gap-3">
      <BarChart
        bars={bars}
        xTicks={TICK_DAYS.filter((d) => d <= daily.length).map((d) => ({
          index: d - 1,
          label: String(d),
        }))}
        highlightIndex={todayIndex}
        referenceValue={average}
        ariaLabel={t("daily")}
      />
      {(todayIndex !== undefined || average !== undefined) && (
        <div className="flex items-center gap-4 text-[0.8125rem] text-soft-foreground">
          {todayIndex !== undefined && (
            <span className="flex items-center gap-1.5">
              <ColorDot color="var(--primary)" size="sm" />
              {t("today")}
            </span>
          )}
          {average !== undefined && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="w-4.5 border-t-2 border-dashed border-foreground/55" />
              {t("average")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
