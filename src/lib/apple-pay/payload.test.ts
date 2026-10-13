import { describe, expect, it } from "vitest";

import { AMOUNT_MAX, MERCHANT_MAX_LENGTH } from "@/lib/transactions/new-transaction";

import { parseApplePayPayload } from "./payload";

const NOW = new Date("2026-10-13T12:00:00Z");

describe("parseApplePayPayload", () => {
  it("parses a typical Shortcut payload", () => {
    expect(
      parseApplePayPayload(
        {
          amount: "₪45.90",
          merchant: " Aroma  Dizengoff ",
          card: "Visa •••• 1234",
          time: "2026-10-13T08:15:00Z",
        },
        NOW,
      ),
    ).toEqual({
      ok: true,
      payment: {
        date: "2026-10-13",
        amount: 45.9,
        currency: "ILS",
        merchant: "Aroma Dizengoff",
        cardLast4: "1234",
        externalRef: "2026-10-13T08:15:00.000Z|45.9|Aroma Dizengoff",
      },
    });
  });

  it("uses Israel time for the purchase date", () => {
    // 22:30 UTC is already the next day in Israel.
    const result = parseApplePayPayload(
      { amount: "10", merchant: "AM:PM", time: "2026-10-12T22:30:00Z" },
      NOW,
    );
    expect(result.ok && result.payment.date).toBe("2026-10-13");
  });

  it("defaults the time to now", () => {
    const result = parseApplePayPayload({ amount: 10, merchant: "Wolt" }, NOW);
    expect(result.ok && result.payment).toMatchObject({
      date: "2026-10-13",
      externalRef: "2026-10-13T12:00:00.000Z|10|Wolt",
    });
  });

  it.each([
    ["₪1,234.50", 1234.5, "ILS"],
    ["1,234.50 ₪", 1234.5, "ILS"],
    ["$12.00", 12, "USD"],
    ["€ 7.333", 7.33, "EUR"],
    ["99", 99, "ILS"],
  ])("amount %j → %d %s", (amount, value, currency) => {
    const result = parseApplePayPayload({ amount, merchant: "Shop" }, NOW);
    expect(result.ok && result.payment).toMatchObject({ amount: value, currency });
  });

  it("keeps card last 4 only when the card name has digits", () => {
    const parse = (card: unknown) => {
      const result = parseApplePayPayload({ amount: "5", merchant: "Shop", card }, NOW);
      return result.ok ? result.payment.cardLast4 : undefined;
    };
    expect(parse("Max 5678")).toBe("5678");
    expect(parse("Cal Visa")).toBeNull();
    expect(parse(undefined)).toBeNull();
  });

  it("shortens very long merchant names", () => {
    const result = parseApplePayPayload({ amount: "5", merchant: "x".repeat(200) }, NOW);
    expect(result.ok && result.payment.merchant).toHaveLength(MERCHANT_MAX_LENGTH);
  });

  it.each([
    [{}, { amount: "required", merchant: "required" }],
    [{ amount: "abc", merchant: "Shop" }, { amount: "invalidAmount" }],
    [{ amount: "-5", merchant: "Shop" }, { amount: "invalidAmount" }],
    [{ amount: true, merchant: "Shop" }, { amount: "invalidAmount" }],
    [{ amount: String(AMOUNT_MAX + 1), merchant: "Shop" }, { amount: "tooLarge" }],
    [{ amount: "5", merchant: "Shop", time: "yesterday-ish" }, { time: "invalidTime" }],
    [{ amount: "5", merchant: "Shop", time: "2026-10-14T12:00:00Z" }, { time: "futureTime" }],
  ])("rejects %j", (body, errors) => {
    expect(parseApplePayPayload(body, NOW)).toEqual({ ok: false, errors });
  });

  it("rejects a body that isn't an object", () => {
    expect(parseApplePayPayload("nope", NOW).ok).toBe(false);
    expect(parseApplePayPayload(null, NOW).ok).toBe(false);
  });
});
