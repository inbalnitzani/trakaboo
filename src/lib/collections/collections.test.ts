import { describe, expect, it } from "vitest";

import { groupBy, sortBy, sumBy } from "./collections";

const items = [
  { cat: "food", amount: 10 },
  { cat: "fun", amount: 5 },
  { cat: "food", amount: 2.5 },
];

describe("groupBy", () => {
  it("groups by key in first-seen order", () => {
    const groups = groupBy(items, (i) => i.cat);
    expect([...groups.keys()]).toEqual(["food", "fun"]);
    expect(groups.get("food")).toHaveLength(2);
  });

  it("returns an empty map for no items", () => {
    expect(groupBy([], () => "x").size).toBe(0);
  });
});

describe("sumBy", () => {
  it("sums values per key", () => {
    const totals = sumBy(
      items,
      (i) => i.cat,
      (i) => i.amount,
    );
    expect(Object.fromEntries(totals)).toEqual({ food: 12.5, fun: 5 });
  });
});

describe("sortBy", () => {
  it("sorts ascending and descending without mutating", () => {
    const asc = sortBy(items, (i) => i.amount);
    expect(asc.map((i) => i.amount)).toEqual([2.5, 5, 10]);
    expect(sortBy(items, (i) => i.amount, "desc").map((i) => i.amount)).toEqual([10, 5, 2.5]);
    expect(items[0].amount).toBe(10);
  });

  it("sorts strings", () => {
    expect(sortBy(items, (i) => i.cat).map((i) => i.cat)).toEqual(["food", "food", "fun"]);
  });
});
