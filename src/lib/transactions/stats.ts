import type { CategoryId } from "@/config/categories";
import { sortBy, sumBy } from "@/lib/collections/collections";
import { dayOfMonth, daysInMonth, isInMonth, type MonthKey, shiftMonth } from "@/lib/dates/dates";
import { sumAmounts } from "@/lib/money/money";

import type { Transaction } from "./types";

type Spend = Pick<Transaction, "date" | "amount" | "categoryId">;

export type CategoryTotal = { categoryId: CategoryId; total: number };

export type CategoryComparison = {
  categoryId: CategoryId;
  current: number;
  previous: number;
  /** Percent change vs. previous; null when there was no previous spend. */
  changePct: number | null;
};

export type MonthSummary = {
  month: MonthKey;
  total: number;
  previousTotal: number;
  changePct: number | null;
  byCategory: CategoryTotal[];
  /** Spend per day, index 0 = day 1. */
  daily: number[];
  comparison: CategoryComparison[];
  count: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Percent change rounded to a whole number; null when there's nothing to compare to. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function inMonth<T extends Pick<Transaction, "date">>(items: readonly T[], month: MonthKey) {
  return items.filter((t) => isInMonth(t.date, month));
}

export function totalSpent(items: readonly Pick<Transaction, "amount">[]): number {
  return sumAmounts(items.map((t) => t.amount));
}

/** Totals per category, largest first. */
export function totalsByCategory(items: readonly Spend[]): CategoryTotal[] {
  const totals = sumBy(
    items,
    (t) => t.categoryId,
    (t) => t.amount,
  );
  return sortBy(
    [...totals].map(([categoryId, total]) => ({ categoryId, total: round2(total) })),
    (c) => c.total,
    "desc",
  );
}

/** Spend per day of `month`; days without purchases are 0. */
export function dailyTotals(items: readonly Spend[], month: MonthKey): number[] {
  const days = Array<number>(daysInMonth(month)).fill(0);
  for (const t of inMonth(items, month)) days[dayOfMonth(t.date) - 1] += t.amount;
  return days.map(round2);
}

/** Per-category current vs. previous, ordered by current spend (largest first). */
export function compareByCategory(
  current: readonly CategoryTotal[],
  previous: readonly CategoryTotal[],
): CategoryComparison[] {
  const prev = new Map(previous.map((c) => [c.categoryId, c.total]));
  const cur = new Map(current.map((c) => [c.categoryId, c.total]));
  const ids = new Set([...cur.keys(), ...prev.keys()]);

  const rows = [...ids].map((categoryId) => {
    const a = cur.get(categoryId) ?? 0;
    const b = prev.get(categoryId) ?? 0;
    return { categoryId, current: a, previous: b, changePct: percentChange(a, b) };
  });
  return rows.sort((a, b) => b.current - a.current || b.previous - a.previous);
}

/** Everything the overview screen needs for one month, in one pass over the data. */
export function summarizeMonth(items: readonly Spend[], month: MonthKey): MonthSummary {
  const current = inMonth(items, month);
  const previous = inMonth(items, shiftMonth(month, -1));
  const byCategory = totalsByCategory(current);
  const total = totalSpent(current);
  const previousTotal = totalSpent(previous);

  return {
    month,
    total,
    previousTotal,
    changePct: percentChange(total, previousTotal),
    byCategory,
    daily: dailyTotals(current, month),
    comparison: compareByCategory(byCategory, totalsByCategory(previous)),
    count: current.length,
  };
}
