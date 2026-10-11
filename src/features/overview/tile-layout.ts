/** Most categories shown as big tiles; the rest become compact pills below. */
export const MAX_TILES = 5;

export type TileShape = "tall" | "wide" | "regular";

/**
 * Shapes for a 2-column tile grid that never leaves an empty cell:
 * an odd count of 3+ makes the first tile two rows tall, a single tile spans both columns.
 */
export function tileShapes(count: number): TileShape[] {
  const n = Math.min(Math.max(count, 0), MAX_TILES);
  return Array.from({ length: n }, (_, i): TileShape => {
    if (i > 0) return "regular";
    if (n === 1) return "wide";
    return n % 2 === 1 ? "tall" : "regular";
  });
}
