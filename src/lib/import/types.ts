import type { CategoryId } from "@/config/categories";
import type { IsoDate } from "@/lib/dates/dates";
import type { TransactionSource } from "@/lib/transactions/types";

/** One transaction read from a card statement, before it's saved. */
export type StatementRow = {
  /** Purchase date (decides the month). */
  date: IsoDate;
  /** What was charged on this statement; negative for refunds. */
  amount: number;
  merchant: string;
  categoryId: CategoryId;
  cardLast4: string | null;
  note: string | null;
  /** Stable id within the issuer, so importing the same statement twice saves nothing new. */
  externalRef: string;
};

export type ParsedStatement = {
  source: Extract<TransactionSource, "cal" | "max">;
  cardLast4: string | null;
  /** The statement's own total, when it states one. */
  total: number | null;
  rows: StatementRow[];
};

export type StatementError = "notAStatement" | "noTransactions" | "unreadable";

export type StatementParseResult =
  { ok: true; statement: ParsedStatement } | { ok: false; error: StatementError };
