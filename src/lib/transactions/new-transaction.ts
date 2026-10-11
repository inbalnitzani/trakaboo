import { isCategoryId } from "@/config/categories";
import { isIsoDate, type IsoDate } from "@/lib/dates/dates";
import { DEFAULT_CURRENCY, parseAmount } from "@/lib/money/money";

import type { NewTransaction } from "./types";

export const MERCHANT_MAX_LENGTH = 80;
export const NOTE_MAX_LENGTH = 200;
/** Upper bound for a single manual expense — catches typos like an extra zero or three. */
export const AMOUNT_MAX = 1_000_000;

export type NewTransactionField = "amount" | "merchant" | "date" | "categoryId" | "note";
export type NewTransactionError =
  | "required"
  | "invalidAmount"
  | "tooLarge"
  | "tooLong"
  | "invalidDate"
  | "futureDate"
  | "invalidCategory";

export type NewTransactionErrors = Partial<Record<NewTransactionField, NewTransactionError>>;

export type ParseResult =
  { ok: true; transaction: NewTransaction } | { ok: false; errors: NewTransactionErrors };

type RawInput = Partial<Record<NewTransactionField, unknown>>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Validates a manually entered expense (e.g. from a form) into a `NewTransaction`.
 * Amounts must be positive and are rounded to agorot; the date can't be after `today`.
 */
export function parseNewTransaction(input: RawInput, today: IsoDate): ParseResult {
  const errors: NewTransactionErrors = {};

  const amountText = text(input.amount);
  const amount = amountText ? parseAmount(amountText) : null;
  if (!amountText) errors.amount = "required";
  else if (amount === null || amount <= 0) errors.amount = "invalidAmount";
  else if (amount > AMOUNT_MAX) errors.amount = "tooLarge";

  const merchant = text(input.merchant).replace(/\s+/g, " ");
  if (!merchant) errors.merchant = "required";
  else if (merchant.length > MERCHANT_MAX_LENGTH) errors.merchant = "tooLong";

  const date = text(input.date);
  if (!date) errors.date = "required";
  else if (!isIsoDate(date)) errors.date = "invalidDate";
  else if (date > today) errors.date = "futureDate";

  const categoryId = text(input.categoryId);
  if (!isCategoryId(categoryId)) errors.categoryId = "invalidCategory";

  const note = text(input.note);
  if (note.length > NOTE_MAX_LENGTH) errors.note = "tooLong";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    transaction: {
      date: date as IsoDate,
      amount: Math.round(amount! * 100) / 100,
      currency: DEFAULT_CURRENCY,
      merchant,
      categoryId: categoryId as NewTransaction["categoryId"],
      source: "manual",
      note: note || null,
    },
  };
}
