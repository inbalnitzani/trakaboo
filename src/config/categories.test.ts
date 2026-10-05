import { describe, expect, it } from "vitest";

import en from "@/i18n/messages/en.json";
import he from "@/i18n/messages/he.json";

import { CATEGORIES, getCategory, isCategoryId } from "./categories";

describe("categories", () => {
  it("have unique ids", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("use each chart slot at most once", () => {
    const slots = CATEGORIES.map((c) => c.chartSlot).filter((s) => s !== null);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("have a label in every language", () => {
    for (const { id } of CATEGORIES) {
      expect(en.categories).toHaveProperty(id);
      expect(he.categories).toHaveProperty(id);
    }
  });

  it("fall back to Other for unknown ids", () => {
    expect(isCategoryId("food")).toBe(true);
    expect(isCategoryId("nope")).toBe(false);
    expect(getCategory("nope").id).toBe("other");
  });
});
