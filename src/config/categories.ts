/**
 * Starter categories. Labels live in i18n messages under `categories.<id>`.
 * `chartSlot` is the fixed chart color (1–6, validated order); categories without
 * a slot are folded into "Other" in charts. Order here = display order in pickers.
 */
export const CATEGORIES = [
  { id: "food", emoji: "🍔", tint: "pink", chartSlot: 1 },
  { id: "groceries", emoji: "🛒", tint: "sky", chartSlot: 2 },
  { id: "transport", emoji: "🚗", tint: "peach", chartSlot: 3 },
  { id: "shopping", emoji: "🛍️", tint: "lilac", chartSlot: 4 },
  { id: "fun", emoji: "🎉", tint: "mint", chartSlot: 5 },
  { id: "bills", emoji: "🏠", tint: "butter", chartSlot: 6 },
  { id: "health", emoji: "💊", tint: "aqua", chartSlot: null },
  { id: "travel", emoji: "✈️", tint: "sky", chartSlot: null },
  { id: "subscriptions", emoji: "📱", tint: "lilac", chartSlot: null },
  { id: "transfers", emoji: "💸", tint: "rose", chartSlot: null },
  { id: "other", emoji: "❓", tint: "gray", chartSlot: null },
] as const satisfies readonly CategoryDef[];

export type Tint =
  "pink" | "sky" | "peach" | "lilac" | "mint" | "butter" | "rose" | "aqua" | "gray";
export type ChartSlot = 1 | 2 | 3 | 4 | 5 | 6;

type CategoryDef = {
  id: string;
  emoji: string;
  tint: Tint;
  chartSlot: ChartSlot | null;
};

export type Category = (typeof CATEGORIES)[number];
export type CategoryId = Category["id"];

export const FALLBACK_CATEGORY_ID: CategoryId = "other";

const byId = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]));

export function isCategoryId(value: string): value is CategoryId {
  return byId.has(value);
}

/** Looks up a category, falling back to "Other" for unknown ids. */
export function getCategory(id: string): Category {
  return byId.get(id) ?? byId.get(FALLBACK_CATEGORY_ID)!;
}

/**
 * Static class names so Tailwind can see them (never build class names dynamically).
 * Tints are for decorative backgrounds; series colors are for chart marks.
 */
export const TINT_BG_CLASS: Record<Tint, string> = {
  pink: "bg-tint-pink",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
  lilac: "bg-tint-lilac",
  mint: "bg-tint-mint",
  butter: "bg-tint-butter",
  rose: "bg-tint-rose",
  aqua: "bg-tint-aqua",
  gray: "bg-tint-gray",
};

/** CSS variables for chart marks, by slot. "other" is the folded remainder. */
export const SERIES_COLOR: Record<ChartSlot | "other", string> = {
  1: "var(--series-1)",
  2: "var(--series-2)",
  3: "var(--series-3)",
  4: "var(--series-4)",
  5: "var(--series-5)",
  6: "var(--series-6)",
  other: "var(--series-other)",
};
