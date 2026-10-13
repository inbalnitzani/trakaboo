import { isCategoryId } from "@/config/categories";
import { type IsoDate, isIsoDate } from "@/lib/dates/dates";
import {
  AMOUNT_MAX,
  MERCHANT_MAX_LENGTH,
  NOTE_MAX_LENGTH,
} from "@/lib/transactions/new-transaction";

import type { StatementRow } from "./types";

/** Most rows one import may send (a few years of a busy card). */
export const IMPORT_MAX_ROWS = 2000;
const REF_MAX_LENGTH = 300;

const isString = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

function isRow(value: unknown, today: IsoDate): value is StatementRow {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.date === "string" &&
    isIsoDate(r.date) &&
    r.date <= today &&
    typeof r.amount === "number" &&
    Number.isFinite(r.amount) &&
    r.amount !== 0 &&
    Math.abs(r.amount) <= AMOUNT_MAX &&
    Math.round(r.amount * 100) === r.amount * 100 &&
    isString(r.merchant, MERCHANT_MAX_LENGTH) &&
    typeof r.categoryId === "string" &&
    isCategoryId(r.categoryId) &&
    (r.cardLast4 === null || (typeof r.cardLast4 === "string" && /^\d{4}$/.test(r.cardLast4))) &&
    (r.note === null || (typeof r.note === "string" && r.note.length <= NOTE_MAX_LENGTH)) &&
    isString(r.externalRef, REF_MAX_LENGTH)
  );
}

/**
 * Checks statement rows that arrive from the browser (where the file is parsed).
 * Returns clean copies, or null if anything is off — the client never sends bad rows,
 * so a bad one means a tampered request and the whole batch is refused.
 */
export function validateStatementRows(input: unknown, today: IsoDate): StatementRow[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > IMPORT_MAX_ROWS) return null;
  if (!input.every((r) => isRow(r, today))) return null;
  return input.map((r: StatementRow) => ({
    date: r.date,
    amount: r.amount,
    merchant: r.merchant.trim(),
    categoryId: r.categoryId,
    cardLast4: r.cardLast4,
    note: r.note,
    externalRef: r.externalRef,
  }));
}
