import { daysBetween } from "@/lib/dates/dates";
import type { Transaction } from "@/lib/transactions/types";

import type { ParsedStatement, StatementRow } from "./types";

/** How far apart (in days) an Apple Pay payment and a statement row can be and still match. */
export const APPLE_PAY_MATCH_DAYS = 2;

export type PlannedRow = StatementRow & {
  /** new: import it · alreadyImported: saved before · applePay: probably the same purchase. */
  status: "new" | "alreadyImported" | "applePay";
  /** The Apple Pay payment this row seems to duplicate. */
  match?: Pick<Transaction, "id" | "date" | "merchant">;
};

const words = (merchant: string) =>
  new Set(
    merchant
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 3),
  );

/** Shares a meaningful word ("AROMA TLV" ~ "Aroma Espresso Bar"). */
export function similarMerchants(a: string, b: string): boolean {
  const wb = words(b);
  return [...words(a)].some((w) => wb.has(w));
}

/**
 * Decides what to do with each statement row, given transactions already saved
 * around those dates. Apple Pay payments are matched by equal amount within
 * `APPLE_PAY_MATCH_DAYS`, preferring a similar merchant name, then the closest date;
 * each payment matches at most one row.
 */
export function planImport(
  statement: ParsedStatement,
  existing: readonly Transaction[],
): PlannedRow[] {
  const savedRefs = new Set(
    existing
      .filter((t) => t.source === statement.source && t.externalRef)
      .map((t) => t.externalRef),
  );
  const unmatched = existing.filter((t) => t.source === "apple_pay");
  const cents = (n: number) => Math.round(n * 100);

  return statement.rows.map((row): PlannedRow => {
    if (savedRefs.has(row.externalRef)) return { ...row, status: "alreadyImported" };
    if (row.amount <= 0) return { ...row, status: "new" };

    const candidates = unmatched
      .filter(
        (t) =>
          cents(t.amount) === cents(row.amount) &&
          Math.abs(daysBetween(t.date, row.date)) <= APPLE_PAY_MATCH_DAYS,
      )
      .sort(
        (a, b) =>
          Number(similarMerchants(b.merchant, row.merchant)) -
            Number(similarMerchants(a.merchant, row.merchant)) ||
          Math.abs(daysBetween(a.date, row.date)) - Math.abs(daysBetween(b.date, row.date)),
      );
    const match = candidates[0];
    if (!match) return { ...row, status: "new" };

    unmatched.splice(unmatched.indexOf(match), 1);
    return {
      ...row,
      status: "applePay",
      match: { id: match.id, date: match.date, merchant: match.merchant },
    };
  });
}
