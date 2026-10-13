import { describe, expect, it } from "vitest";

import { categorizeMerchant } from "./categorize";

describe("categorizeMerchant", () => {
  it.each([
    ["PAYBOX", "transfers"],
    ["Bit העברה", "transfers"],
    ["ביט", "transfers"],
    ["פייבוקס", "transfers"],
    ["Habit Coffee", "other"],
    ["שופרסל", "other"],
  ])("%s → %s", (merchant, category) => {
    expect(categorizeMerchant(merchant)).toBe(category);
  });
});
