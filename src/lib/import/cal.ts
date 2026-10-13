import { type IsoDate, isIsoDate, parseDayMonthYear } from "@/lib/dates/dates";
import { parseAmount } from "@/lib/money/money";
import { MERCHANT_MAX_LENGTH } from "@/lib/transactions/new-transaction";

import { categorizeMerchant } from "./categorize";
import type { StatementParseResult, StatementRow } from "./types";

/** A sheet as read from the workbook: rows of cells (text, number, date or empty). */
export type WorkbookSheet = { sheet: string; data: unknown[][] };

const ILS_SHEET = "חיובים בשקלים";

/** Header labels in the Cal export (row 5). Matched by text, so column order can change. */
const HEADERS = {
  date: "תאריך עסקה",
  merchant: "שם העסק",
  amount: "סכום עסקה",
  charge: "סכום חיוב",
  details: "פירוט",
} as const;

const text = (cell: unknown) =>
  typeof cell === "string"
    ? cell.trim().replace(/\s+/g, " ")
    : typeof cell === "number"
      ? String(cell)
      : "";

function toDate(cell: unknown): IsoDate | null {
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
    const iso = cell.toISOString().slice(0, 10);
    return isIsoDate(iso) ? iso : null;
  }
  return parseDayMonthYear(text(cell));
}

function toAmount(cell: unknown): number | null {
  const value = typeof cell === "number" ? cell : parseAmount(text(cell));
  return value === null ? null : Math.round(value * 100) / 100;
}

/** "label : value" from the summary rows above the header, e.g. "כרטיס : 1234". */
function summaryValue(rows: unknown[][], label: string): string | null {
  for (const row of rows) {
    for (const cell of row) {
      const match = new RegExp(`^${label}\\s*:\\s*(.+)$`).exec(text(cell));
      if (match) return match[1].trim();
    }
  }
  return null;
}

/**
 * Reads a Cal (.xlsx) statement's shekel sheet into statement rows.
 * Uses the charge amount (what this statement bills — an installment, or a negative refund),
 * dated by the purchase date. Rows without a valid date or amount (totals, notes) are skipped.
 */
export function parseCalStatement(sheets: WorkbookSheet[]): StatementParseResult {
  const sheet =
    sheets.find((s) => s.sheet.trim() === ILS_SHEET) ??
    sheets.find((s) => s.data.some((row) => row.some((cell) => text(cell) === HEADERS.date)));
  if (!sheet) return { ok: false, error: "notAStatement" };

  const headerIndex = sheet.data.findIndex(
    (row) =>
      row.some((cell) => text(cell) === HEADERS.date) &&
      row.some((cell) => text(cell) === HEADERS.merchant),
  );
  if (headerIndex < 0) return { ok: false, error: "notAStatement" };

  const header = sheet.data[headerIndex].map(text);
  const col = (label: string) => header.indexOf(label);
  const dateCol = col(HEADERS.date);
  const merchantCol = col(HEADERS.merchant);
  const chargeCol = col(HEADERS.charge) >= 0 ? col(HEADERS.charge) : col(HEADERS.amount);
  const detailsCol = col(HEADERS.details);
  if (chargeCol < 0) return { ok: false, error: "notAStatement" };

  const summary = sheet.data.slice(0, headerIndex);
  const cardLast4 = /(\d{4})\s*$/.exec(summaryValue(summary, "כרטיס") ?? "")?.[1] ?? null;
  const totalText = summaryValue(summary, 'סה"כ חיובים בשקלים');
  const total = totalText ? toAmount(totalText) : null;

  const rows: StatementRow[] = [];
  const seen = new Map<string, number>();
  for (const row of sheet.data.slice(headerIndex + 1)) {
    const date = toDate(row[dateCol]);
    const amount = toAmount(row[chargeCol]);
    const merchant = text(row[merchantCol]).slice(0, MERCHANT_MAX_LENGTH).trim();
    if (!date || amount === null || amount === 0 || !merchant) continue;

    // Identical rows (same day, amount and place) are real separate purchases: number them.
    const key = `cal|${cardLast4 ?? ""}|${date}|${amount}|${merchant}`;
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);

    rows.push({
      date,
      amount,
      merchant,
      categoryId: categorizeMerchant(merchant),
      cardLast4,
      note: (detailsCol >= 0 && text(row[detailsCol])) || null,
      externalRef: `${key}|${n}`,
    });
  }

  if (rows.length === 0) return { ok: false, error: "noTransactions" };
  return { ok: true, statement: { source: "cal", cardLast4, total, rows } };
}
