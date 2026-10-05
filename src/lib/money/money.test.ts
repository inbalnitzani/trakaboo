import { describe, expect, it } from "vitest";

import { formatMoney, parseAmount, sumAmounts } from "./money";

describe("formatMoney", () => {
  it("formats whole shekels without decimals", () => {
    expect(formatMoney(5208, { locale: "en-US" })).toBe("₪5,208");
  });

  it("keeps two decimals for fractional amounts", () => {
    expect(formatMoney(40.9, { locale: "en-US" })).toBe("₪40.90");
  });

  it("respects an explicit number of decimals", () => {
    expect(formatMoney(12, { locale: "en-US", fractionDigits: 2 })).toBe("₪12.00");
  });

  it("uses the locale's conventions", () => {
    expect(formatMoney(5208, { locale: "he-IL" })).toContain("5,208");
    expect(formatMoney(5208, { locale: "he-IL" })).toContain("₪");
  });

  it("supports other currencies", () => {
    expect(formatMoney(10, { locale: "en-US", currency: "USD" })).toBe("$10");
  });
});

describe("parseAmount", () => {
  it.each([
    ["55.00 ₪", 55],
    ["1,165.00 ₪", 1165],
    ["₪ 2,477.26", 2477.26],
    ["  -40.90 ", -40.9],
    ["ILS 100.00", 100],
    [42, 42],
  ])("parses %j → %d", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each([[""], ["no number"], [null], [undefined], [Number.NaN]])(
    "returns null for %j",
    (input) => {
      expect(parseAmount(input)).toBeNull();
    },
  );
});

describe("sumAmounts", () => {
  it("avoids floating point drift", () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sumAmounts([40.9, 60, 18.76, 5.34])).toBe(125);
  });

  it("returns 0 for an empty list", () => {
    expect(sumAmounts([])).toBe(0);
  });
});
