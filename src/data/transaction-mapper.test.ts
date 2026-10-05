import { describe, expect, it } from "vitest";

import type { TransactionRow } from "@/lib/supabase/database.types";

import { fromRow, toInsert } from "./transaction-mapper";

const row: TransactionRow = {
  id: "abc",
  user_id: "u1",
  date: "2026-09-14",
  amount: "34.50" as unknown as number,
  currency: "ILS",
  merchant: "McDonald's",
  category_id: "food",
  source: "apple_pay",
  card_last4: "1234",
  note: null,
  external_ref: null,
  created_at: "2026-09-14T10:00:00Z",
  updated_at: "2026-09-14T10:00:00Z",
};

describe("fromRow", () => {
  it("maps snake_case columns and numeric strings", () => {
    expect(fromRow(row)).toEqual({
      id: "abc",
      date: "2026-09-14",
      amount: 34.5,
      currency: "ILS",
      merchant: "McDonald's",
      categoryId: "food",
      source: "apple_pay",
      cardLast4: "1234",
      note: null,
    });
  });

  it("falls back to Other for unknown categories", () => {
    expect(fromRow({ ...row, category_id: "deleted-category" }).categoryId).toBe("other");
  });
});

describe("toInsert", () => {
  it("maps to columns, trims the merchant, and never sends user_id", () => {
    const insert = toInsert(
      {
        date: "2026-09-14",
        amount: 12,
        currency: "ILS",
        merchant: "  Wolt ",
        categoryId: "food",
        source: "manual",
      },
      "ref-1",
    );
    expect(insert).toEqual({
      date: "2026-09-14",
      amount: 12,
      currency: "ILS",
      merchant: "Wolt",
      category_id: "food",
      source: "manual",
      card_last4: null,
      note: null,
      external_ref: "ref-1",
    });
    expect(insert).not.toHaveProperty("user_id");
  });
});
