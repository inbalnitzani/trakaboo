import { type CategoryId, type ChartSlot, getCategory } from "@/config/categories";
import { sumAmounts } from "@/lib/money/money";
import type { CategoryTotal } from "@/lib/transactions/stats";

type SlottedSegment = { kind: "category"; categoryId: CategoryId; slot: ChartSlot; total: number };
type OtherSegment = { kind: "other"; total: number; parts: CategoryTotal[] };
export type CategorySegment = SlottedSegment | OtherSegment;

/**
 * Prepares category totals for a categorical chart: categories with a chart slot
 * keep their fixed color (in slot order, so validated neighbours stay adjacent);
 * everything else folds into one "Other" segment at the end.
 */
export function toCategorySegments(totals: readonly CategoryTotal[]): CategorySegment[] {
  const slotted: SlottedSegment[] = [];
  const rest: CategoryTotal[] = [];

  for (const total of totals) {
    if (total.total <= 0) continue;
    const { chartSlot } = getCategory(total.categoryId);
    if (chartSlot === null) rest.push(total);
    else
      slotted.push({
        kind: "category",
        categoryId: total.categoryId,
        slot: chartSlot,
        total: total.total,
      });
  }

  const segments: CategorySegment[] = slotted.sort((a, b) => a.slot - b.slot);
  if (rest.length) {
    segments.push({ kind: "other", total: sumAmounts(rest.map((r) => r.total)), parts: rest });
  }
  return segments;
}
