import { describe, expect, it } from "vitest";

import { toCategorySegments } from "./category-segments";

describe("toCategorySegments", () => {
  it("orders slotted categories by slot and folds the rest into Other", () => {
    const segments = toCategorySegments([
      { categoryId: "groceries", total: 300 },
      { categoryId: "transfers", total: 120 },
      { categoryId: "food", total: 200 },
      { categoryId: "health", total: 30.5 },
    ]);
    expect(segments).toEqual([
      { kind: "category", categoryId: "food", slot: 1, total: 200 },
      { kind: "category", categoryId: "groceries", slot: 2, total: 300 },
      {
        kind: "other",
        total: 150.5,
        parts: [
          { categoryId: "transfers", total: 120 },
          { categoryId: "health", total: 30.5 },
        ],
      },
    ]);
  });

  it("skips empty totals and omits Other when nothing folds", () => {
    expect(
      toCategorySegments([
        { categoryId: "fun", total: 10 },
        { categoryId: "bills", total: 0 },
      ]),
    ).toEqual([{ kind: "category", categoryId: "fun", slot: 5, total: 10 }]);
  });
});
