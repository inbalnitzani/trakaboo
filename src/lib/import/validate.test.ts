import { describe, expect, it } from "vitest";

import type { StatementRow } from "./types";
import { IMPORT_MAX_ROWS, validateStatementRows } from "./validate";

const TODAY = "2026-10-13";
const good: StatementRow = {
  date: "2026-09-03",
  amount: 38,
  merchant: "קפה",
  categoryId: "other",
  cardLast4: "4321",
  note: null,
  externalRef: "cal|4321|2026-09-03|38|קפה|1",
};

describe("validateStatementRows", () => {
  it("accepts good rows and drops unknown fields", () => {
    const result = validateStatementRows([{ ...good, user_id: "someone-else" }], TODAY);
    expect(result).toEqual([good]);
  });

  it("accepts refunds", () => {
    expect(validateStatementRows([{ ...good, amount: -89.9 }], TODAY)).not.toBeNull();
  });

  it.each([
    ["not an array", "nope"],
    ["empty", []],
    ["too many", Array(IMPORT_MAX_ROWS + 1).fill(good)],
    ["future date", [{ ...good, date: "2026-10-14" }]],
    ["bad date", [{ ...good, date: "2026-02-30" }]],
    ["zero amount", [{ ...good, amount: 0 }]],
    ["fractional agorot", [{ ...good, amount: 1.234 }]],
    ["amount as text", [{ ...good, amount: "38" }]],
    ["blank merchant", [{ ...good, merchant: "  " }]],
    ["unknown category", [{ ...good, categoryId: "yachts" }]],
    ["bad card", [{ ...good, cardLast4: "12" }]],
    ["missing ref", [{ ...good, externalRef: "" }]],
    ["one bad row in many", [good, { ...good, amount: NaN }]],
  ])("refuses %s", (_, input) => {
    expect(validateStatementRows(input, TODAY)).toBeNull();
  });
});
