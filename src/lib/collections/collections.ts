/** Groups items by a derived key, preserving the order items were seen in. */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Sums a numeric value per key: e.g. amount per category. */
export function sumBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
  valueOf: (item: T) => number,
): Map<K, number> {
  const totals = new Map<K, number>();
  for (const item of items) {
    const key = keyOf(item);
    totals.set(key, (totals.get(key) ?? 0) + valueOf(item));
  }
  return totals;
}

/** Returns a copy sorted by a numeric or string value. */
export function sortBy<T>(
  items: readonly T[],
  valueOf: (item: T) => number | string,
  direction: "asc" | "desc" = "asc",
): T[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = valueOf(a);
    const vb = valueOf(b);
    return va < vb ? -sign : va > vb ? sign : 0;
  });
}
