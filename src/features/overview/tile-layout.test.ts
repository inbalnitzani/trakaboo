import { describe, expect, it } from "vitest";

import { MAX_TILES, tileShapes } from "./tile-layout";

/** Grid cells used: tall = 2, wide = 2, regular = 1. */
const cells = (shapes: string[]) => shapes.reduce((n, s) => n + (s === "regular" ? 1 : 2), 0);

describe("tileShapes", () => {
  it("returns nothing for no categories", () => {
    expect(tileShapes(0)).toEqual([]);
  });

  it("stretches a single tile across both columns", () => {
    expect(tileShapes(1)).toEqual(["wide"]);
  });

  it("makes the first tile tall for odd counts", () => {
    expect(tileShapes(3)).toEqual(["tall", "regular", "regular"]);
    expect(tileShapes(5)[0]).toBe("tall");
  });

  it("keeps even counts regular", () => {
    expect(tileShapes(4)).toEqual(["regular", "regular", "regular", "regular"]);
  });

  it(`caps at ${MAX_TILES} tiles`, () => {
    expect(tileShapes(11)).toHaveLength(MAX_TILES);
  });

  it.each([1, 2, 3, 4, 5, 9])("fills whole rows of 2 for %d categories", (count) => {
    expect(cells(tileShapes(count)) % 2).toBe(0);
  });
});
