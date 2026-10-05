import type { CategoryId } from "@/config/categories";
import {
  daysInMonth,
  type IsoDate,
  type MonthKey,
  monthRange,
  shiftMonth,
  toMonthKey,
} from "@/lib/dates/dates";
import type { Transaction, TransactionSource } from "@/lib/transactions/types";

/** [merchant, min amount, max amount] */
type MerchantSpec = readonly [string, number, number];

const MERCHANTS: Partial<Record<CategoryId, readonly MerchantSpec[]>> = {
  food: [
    ["Wolt", 45, 110],
    ["ארומה", 22, 48],
    ["McDonald's", 30, 62],
    ["קפה קפה", 55, 140],
  ],
  groceries: [
    ["שופרסל", 40, 320],
    ["רמי לוי", 80, 380],
    ["AM:PM", 12, 60],
  ],
  transport: [
    ["רב-קו", 5.5, 16],
    ["Gett", 28, 75],
    ["פנגו", 8, 30],
  ],
  shopping: [
    ["H&M", 60, 240],
    ["סופר-פארם", 25, 140],
  ],
  fun: [
    ["יס פלאנט", 45, 95],
    ["סטודיו יוגה", 40, 55],
  ],
  health: [["מכבי", 30, 90]],
  transfers: [
    ["BIT", 50, 300],
    ["PAYBOX", 40, 200],
  ],
};

/** Purchases per 30 days, by category. */
const FREQUENCY: Partial<Record<CategoryId, number>> = {
  food: 14,
  groceries: 8,
  transport: 10,
  shopping: 4,
  fun: 3,
  health: 2,
  transfers: 3,
};

const FIXED_MONTHLY: readonly [CategoryId, string, number, number][] = [
  ["bills", "חברת החשמל", 3, 340],
  ["bills", "פרטנר", 9, 79],
  ["subscriptions", "Spotify", 2, 19.9],
  ["subscriptions", "Netflix", 14, 54.9],
];

const SOURCES: readonly TransactionSource[] = ["apple_pay", "apple_pay", "cal", "max", "manual"];

/** Small deterministic PRNG so demo data is stable across reloads. */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Generates realistic-looking sample spending for the `months` months up to and
 * including `today`'s month. Only used when no database is configured.
 */
export function generateDemoTransactions(today: IsoDate, months = 4): Transaction[] {
  const rnd = seeded(7);
  const pick = <T>(items: readonly T[]) => items[Math.floor(rnd() * items.length)];
  const amount = (lo: number, hi: number) => Math.round((lo + rnd() * (hi - lo)) * 100) / 100;

  const current = toMonthKey(today);
  const result: Transaction[] = [];
  let n = 0;

  for (let i = months - 1; i >= 0; i--) {
    const month: MonthKey = shiftMonth(current, -i);
    const lastDay = month === current ? Number(today.slice(8)) : daysInMonth(month);
    const { from } = monthRange(month);
    const date = (day: number) => `${from.slice(0, 8)}${String(day).padStart(2, "0")}` as IsoDate;

    for (const [categoryId, perMonth] of Object.entries(FREQUENCY) as [CategoryId, number][]) {
      const count = Math.round(((perMonth * lastDay) / 30) * (0.75 + rnd() * 0.5));
      for (let k = 0; k < count; k++) {
        const [merchant, lo, hi] = pick(MERCHANTS[categoryId]!);
        result.push({
          id: `demo-${++n}`,
          date: date(1 + Math.floor(rnd() * lastDay)),
          amount: amount(lo, hi),
          currency: "ILS",
          merchant,
          categoryId,
          source: categoryId === "transfers" ? "max" : pick(SOURCES),
        });
      }
    }

    for (const [categoryId, merchant, day, value] of FIXED_MONTHLY) {
      if (day > lastDay) continue;
      result.push({
        id: `demo-${++n}`,
        date: date(day),
        amount: value,
        currency: "ILS",
        merchant,
        categoryId,
        source: "cal",
      });
    }
  }

  return result;
}
