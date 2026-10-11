import { describe, expect, it } from "vitest";

import {
  AMOUNT_MAX,
  MERCHANT_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  parseNewTransaction,
} from "./new-transaction";

const TODAY = "2026-10-11";
const valid = { amount: "42.5", merchant: "Aroma", date: "2026-10-10", categoryId: "food" };

describe("parseNewTransaction", () => {
  it("builds a manual ILS transaction from valid input", () => {
    expect(parseNewTransaction({ ...valid, note: " with Dana " }, TODAY)).toEqual({
      ok: true,
      transaction: {
        date: "2026-10-10",
        amount: 42.5,
        currency: "ILS",
        merchant: "Aroma",
        categoryId: "food",
        source: "manual",
        note: "with Dana",
      },
    });
  });

  it("tidies amounts and merchant names", () => {
    const result = parseNewTransaction(
      { ...valid, amount: "₪ 1,165.005", merchant: "  Super   Pharm " },
      TODAY,
    );
    expect(result).toMatchObject({
      ok: true,
      transaction: { amount: 1165.01, merchant: "Super Pharm", note: null },
    });
  });

  it("accepts today's date", () => {
    expect(parseNewTransaction({ ...valid, date: TODAY }, TODAY).ok).toBe(true);
  });

  it("reports every missing field", () => {
    expect(parseNewTransaction({}, TODAY)).toEqual({
      ok: false,
      errors: {
        amount: "required",
        merchant: "required",
        date: "required",
        categoryId: "invalidCategory",
      },
    });
  });

  it.each([
    ["amount", "abc", "invalidAmount"],
    ["amount", "0", "invalidAmount"],
    ["amount", "-12", "invalidAmount"],
    ["amount", String(AMOUNT_MAX + 1), "tooLarge"],
    ["merchant", "x".repeat(MERCHANT_MAX_LENGTH + 1), "tooLong"],
    ["date", "2026-02-30", "invalidDate"],
    ["date", "10/10/2026", "invalidDate"],
    ["date", "2026-10-12", "futureDate"],
    ["categoryId", "rent", "invalidCategory"],
    ["note", "x".repeat(NOTE_MAX_LENGTH + 1), "tooLong"],
  ] as const)("rejects %s %j as %s", (field, value, error) => {
    expect(parseNewTransaction({ ...valid, [field]: value }, TODAY)).toEqual({
      ok: false,
      errors: { [field]: error },
    });
  });

  it("ignores non-string values", () => {
    expect(parseNewTransaction({ ...valid, merchant: 42 }, TODAY)).toEqual({
      ok: false,
      errors: { merchant: "required" },
    });
  });
});
