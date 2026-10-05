import type { CategoryId } from "@/config/categories";
import type { IsoDate } from "@/lib/dates/dates";
import type { CurrencyCode } from "@/lib/money/money";

/** Where a transaction came from. Drives badges and duplicate detection. */
export const TRANSACTION_SOURCES = ["apple_pay", "cal", "max", "manual"] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

export type Transaction = {
  id: string;
  /** Purchase date (decides the month it counts in — see DESIGN.md). */
  date: IsoDate;
  /** Positive amount spent, in `currency`. */
  amount: number;
  currency: CurrencyCode;
  merchant: string;
  categoryId: CategoryId;
  source: TransactionSource;
  /** Last 4 digits of the card, when known. */
  cardLast4?: string | null;
  note?: string | null;
};

export type NewTransaction = Omit<Transaction, "id">;
