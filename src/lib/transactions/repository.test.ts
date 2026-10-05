import { describe, expect, it } from "vitest";

import { createInMemoryRepository } from "./repository";
import type { NewTransaction, Transaction } from "./types";

const base: NewTransaction = {
  date: "2026-09-14",
  amount: 34,
  currency: "ILS",
  merchant: "McDonald's",
  categoryId: "food",
  source: "manual",
};

const seed: Transaction[] = [
  { ...base, id: "a", date: "2026-08-31" },
  { ...base, id: "b", date: "2026-09-01" },
  { ...base, id: "c", date: "2026-09-30" },
];

describe("in-memory repository", () => {
  it("lists an inclusive date range, newest first", async () => {
    const repo = createInMemoryRepository(seed);
    const rows = await repo.listBetween({ from: "2026-09-01", to: "2026-09-30" });
    expect(rows.map((r) => r.id)).toEqual(["c", "b"]);
  });

  it("creates with a generated id", async () => {
    const repo = createInMemoryRepository([], () => "new-id");
    const created = await repo.create(base);
    expect(created).toEqual({ ...base, id: "new-id" });
    expect(await repo.listBetween({ from: "2026-09-14", to: "2026-09-14" })).toHaveLength(1);
  });

  it("updates a category and removes rows", async () => {
    const repo = createInMemoryRepository(seed);
    await repo.updateCategory("b", "fun");
    await repo.remove("c");
    const rows = await repo.listBetween({ from: "2026-09-01", to: "2026-09-30" });
    expect(rows).toEqual([{ ...seed[1], categoryId: "fun" }]);
  });

  it("does not leak internal state to callers", async () => {
    const repo = createInMemoryRepository(seed);
    const [row] = await repo.listBetween({ from: "2026-09-30", to: "2026-09-30" });
    row.merchant = "changed";
    const [again] = await repo.listBetween({ from: "2026-09-30", to: "2026-09-30" });
    expect(again.merchant).toBe("McDonald's");
  });

  it("rejects updates to unknown ids", async () => {
    await expect(createInMemoryRepository().updateCategory("x", "fun")).rejects.toThrow();
  });
});
