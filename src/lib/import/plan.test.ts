import { describe, expect, it } from "vitest";

import type { Transaction } from "@/lib/transactions/types";

import { planImport, similarMerchants } from "./plan";
import type { ParsedStatement, StatementRow } from "./types";

const row = (over: Partial<StatementRow>): StatementRow => ({
  date: "2026-09-10",
  amount: 45.9,
  merchant: "AROMA TLV",
  categoryId: "other",
  cardLast4: "4321",
  note: null,
  externalRef: `ref-${Math.random()}`,
  ...over,
});

const statement = (...rows: StatementRow[]): ParsedStatement => ({
  source: "cal",
  cardLast4: "4321",
  total: null,
  rows,
});

const saved = (over: Partial<Transaction>): Transaction => ({
  id: `t-${Math.random()}`,
  date: "2026-09-10",
  amount: 45.9,
  currency: "ILS",
  merchant: "Aroma Espresso Bar",
  categoryId: "food",
  source: "apple_pay",
  ...over,
});

const statuses = (planned: { status: string }[]) => planned.map((p) => p.status);

describe("similarMerchants", () => {
  it.each([
    ["AROMA TLV", "Aroma Espresso Bar", true],
    ["שופרסל דיל", "שופרסל אונליין", true],
    ["Wolt", "Cafe Xoho", false],
    ["AM PM", "am:pm", false], // words under 3 letters don't count
  ])("%s ~ %s → %s", (a, b, expected) => {
    expect(similarMerchants(a, b)).toBe(expected);
  });
});

describe("planImport", () => {
  it("marks rows saved by an earlier import", () => {
    const r = row({ externalRef: "cal|1" });
    const existing = [saved({ source: "cal", externalRef: "cal|1", amount: 999 })];
    expect(statuses(planImport(statement(r, row({ amount: 12 })), existing))).toEqual([
      "alreadyImported",
      "new",
    ]);
  });

  it("matches an Apple Pay payment with the same amount within two days", () => {
    const applePay = saved({ id: "ap1", date: "2026-09-08" });
    const [planned] = planImport(statement(row({})), [applePay]);
    expect(planned).toMatchObject({
      status: "applePay",
      match: { id: "ap1", date: "2026-09-08", merchant: "Aroma Espresso Bar" },
    });
  });

  it("doesn't match different amounts, far dates, refunds, or other sources", () => {
    const existing = [
      saved({ amount: 45.8 }),
      saved({ date: "2026-09-13" }),
      saved({ source: "manual" }),
      saved({ amount: -45.9 }),
    ];
    expect(statuses(planImport(statement(row({}), row({ amount: -45.9 })), existing))).toEqual([
      "new",
      "new",
    ]);
  });

  it("uses each Apple Pay payment once, preferring a similar merchant", () => {
    const aroma = saved({ id: "aroma", date: "2026-09-10" });
    const other = saved({ id: "other", merchant: "Cafe Xoho", date: "2026-09-10" });
    const planned = planImport(
      statement(row({ merchant: "קפה צ'וחו" }), row({ merchant: "AROMA TLV" }), row({})),
      [other, aroma],
    );
    expect(planned.map((p) => p.match?.id ?? p.status)).toEqual(["other", "aroma", "new"]);
  });

  it("prefers the closest date among equally similar payments", () => {
    const far = saved({ id: "far", date: "2026-09-12" });
    const near = saved({ id: "near", date: "2026-09-11" });
    expect(planImport(statement(row({})), [far, near])[0].match?.id).toBe("near");
  });
});
