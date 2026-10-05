import { describe, expect, it } from "vitest";

import {
  compareByCategory,
  dailyTotals,
  percentChange,
  summarizeMonth,
  totalsByCategory,
  totalSpent,
} from "./stats";
import type { Transaction } from "./types";

type Spend = Pick<Transaction, "date" | "amount" | "categoryId">;

const spend: Spend[] = [
  { date: "2026-08-03", amount: 100, categoryId: "food" },
  { date: "2026-08-20", amount: 50, categoryId: "transport" },
  { date: "2026-09-01", amount: 40.9, categoryId: "food" },
  { date: "2026-09-01", amount: 18.76, categoryId: "groceries" },
  { date: "2026-09-14", amount: 60, categoryId: "food" },
  { date: "2026-09-30", amount: 5.34, categoryId: "transfers" },
  { date: "2026-10-01", amount: 999, categoryId: "travel" },
];

describe("percentChange", () => {
  it("rounds to whole percent", () => {
    expect(percentChange(110, 100)).toBe(10);
    expect(percentChange(50, 200)).toBe(-75);
  });

  it("is null without a previous value", () => {
    expect(percentChange(10, 0)).toBeNull();
  });
});

describe("totals", () => {
  it("sums spend without float drift", () => {
    expect(totalSpent(spend.slice(2, 6))).toBe(125);
  });

  it("totals per category, largest first", () => {
    expect(totalsByCategory(spend.slice(2, 6))).toEqual([
      { categoryId: "food", total: 100.9 },
      { categoryId: "groceries", total: 18.76 },
      { categoryId: "transfers", total: 5.34 },
    ]);
  });

  it("totals per day of the month, only for that month", () => {
    const daily = dailyTotals(spend, "2026-09");
    expect(daily).toHaveLength(30);
    expect(daily[0]).toBe(59.66);
    expect(daily[13]).toBe(60);
    expect(daily[29]).toBe(5.34);
    expect(daily[1]).toBe(0);
  });
});

describe("compareByCategory", () => {
  it("includes categories from either month, with change", () => {
    const rows = compareByCategory(
      [{ categoryId: "food", total: 120 }],
      [
        { categoryId: "food", total: 100 },
        { categoryId: "transport", total: 50 },
      ],
    );
    expect(rows).toEqual([
      { categoryId: "food", current: 120, previous: 100, changePct: 20 },
      { categoryId: "transport", current: 0, previous: 50, changePct: -100 },
    ]);
  });
});

describe("summarizeMonth", () => {
  it("builds the overview for a month against the previous one", () => {
    const s = summarizeMonth(spend, "2026-09");
    expect(s.total).toBe(125);
    expect(s.previousTotal).toBe(150);
    expect(s.changePct).toBe(-17);
    expect(s.count).toBe(4);
    expect(s.byCategory[0]).toEqual({ categoryId: "food", total: 100.9 });
    expect(s.comparison.find((c) => c.categoryId === "transport")).toMatchObject({
      current: 0,
      previous: 50,
    });
  });

  it("handles an empty month", () => {
    const s = summarizeMonth([], "2026-02");
    expect(s).toMatchObject({ total: 0, previousTotal: 0, changePct: null, count: 0 });
    expect(s.daily).toHaveLength(28);
  });
});
