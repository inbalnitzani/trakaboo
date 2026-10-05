import { describe, expect, it } from "vitest";

import { isCategoryId } from "@/config/categories";
import { isIsoDate } from "@/lib/dates/dates";

import { generateDemoTransactions } from "./demo-transactions";

describe("generateDemoTransactions", () => {
  const today = "2026-10-05";
  const data = generateDemoTransactions(today, 4);

  it("is deterministic", () => {
    expect(generateDemoTransactions(today, 4)).toEqual(data);
  });

  it("covers the requested months and never goes past today", () => {
    const months = new Set(data.map((t) => t.date.slice(0, 7)));
    expect([...months].sort()).toEqual(["2026-07", "2026-08", "2026-09", "2026-10"]);
    expect(data.every((t) => t.date <= today)).toBe(true);
  });

  it("produces valid transactions", () => {
    for (const t of data) {
      expect(isIsoDate(t.date)).toBe(true);
      expect(isCategoryId(t.categoryId)).toBe(true);
      expect(t.amount).toBeGreaterThan(0);
    }
    expect(new Set(data.map((t) => t.id)).size).toBe(data.length);
  });
});
