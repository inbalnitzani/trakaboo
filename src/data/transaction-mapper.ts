import { FALLBACK_CATEGORY_ID, isCategoryId } from "@/config/categories";
import type { IsoDate } from "@/lib/dates/dates";
import type { TransactionInsert, TransactionRow } from "@/lib/supabase/database.types";
import type { NewTransaction, Transaction } from "@/lib/transactions/types";

/** Database row (snake_case, numeric strings) → domain model. */
export function fromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date as IsoDate,
    // Postgres numeric can arrive as a string; normalize to number.
    amount: Number(row.amount),
    currency: row.currency,
    merchant: row.merchant,
    categoryId: isCategoryId(row.category_id) ? row.category_id : FALLBACK_CATEGORY_ID,
    source: row.source,
    cardLast4: row.card_last4,
    note: row.note,
  };
}

/** Domain model → insert payload. `user_id` is filled in by the database (auth.uid()). */
export function toInsert(input: NewTransaction, externalRef?: string): TransactionInsert {
  return {
    date: input.date,
    amount: input.amount,
    currency: input.currency,
    merchant: input.merchant.trim(),
    category_id: input.categoryId,
    source: input.source,
    card_last4: input.cardLast4 ?? null,
    note: input.note ?? null,
    external_ref: externalRef ?? null,
  };
}
