"use client";

import { useTranslations } from "next-intl";

import { BarChart } from "@/components/charts/bar-chart";
import { useFormatters } from "@/i18n/use-formatters";
import { type IsoDate, type MonthKey } from "@/lib/dates/dates";

type DailySpendingProps = {
  month: MonthKey;
  /** Spend per day, index 0 = day 1. */
  daily: readonly number[];
  /** Purchases per day, same indexing. */
  counts: readonly number[];
};

const TICK_DAYS = [1, 8, 15, 22, 29];

export function DailySpending({ month, daily, counts }: DailySpendingProps) {
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
          {format.money(value, 2)} · {t("dailyTooltip", { count: counts[i] })}
        </>
      ),
    };
  });

  return (
    <BarChart
      bars={bars}
      xTicks={TICK_DAYS.filter((d) => d <= daily.length).map((d) => ({
        index: d - 1,
        label: String(d),
      }))}
      ariaLabel={t("daily")}
    />
  );
}
