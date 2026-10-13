import type { CategoryId } from "@/config/categories";
import type { IsoDate } from "@/lib/dates/dates";

import type { NewTransaction, Transaction } from "./types";

/**
 * Storage-agnostic access to transactions. Features depend on this interface,
 * not on Supabase, so storage can be swapped (and tests use the in-memory one).
 */
export interface TransactionsRepository {
  /** Transactions with `from <= date <= to`, newest first. */
  listBetween(range: { from: IsoDate; to: IsoDate }): Promise<Transaction[]>;
  create(input: NewTransaction): Promise<Transaction>;
  /**
   * Saves many at once, skipping any whose `source` + `externalRef` is already saved
   * (so re-importing a statement is harmless). Returns how many were saved.
   */
  createMany(inputs: readonly NewTransaction[]): Promise<number>;
  updateCategory(id: string, categoryId: CategoryId): Promise<void>;
  remove(id: string): Promise<void>;
}

const newestFirst = (a: Transaction, b: Transaction) =>
  b.date.localeCompare(a.date) || b.id.localeCompare(a.id);

/** In-memory implementation for tests and local prototyping. */
export function createInMemoryRepository(
  seed: readonly Transaction[] = [],
  makeId: () => string = () => crypto.randomUUID(),
): TransactionsRepository {
  const rows = new Map(seed.map((t) => [t.id, { ...t }]));
  const refKey = (t: NewTransaction) => (t.externalRef ? `${t.source}|${t.externalRef}` : null);
  const hasRef = (key: string) => [...rows.values()].some((t) => refKey(t) === key);

  return {
    async listBetween({ from, to }) {
      return [...rows.values()]
        .filter((t) => t.date >= from && t.date <= to)
        .sort(newestFirst)
        .map((t) => ({ ...t }));
    },
    async create(input) {
      const row: Transaction = { ...input, id: makeId() };
      rows.set(row.id, row);
      return { ...row };
    },
    async createMany(inputs) {
      let saved = 0;
      for (const input of inputs) {
        const key = refKey(input);
        if (key && hasRef(key)) continue;
        const row: Transaction = { ...input, id: makeId() };
        rows.set(row.id, row);
        saved++;
      }
      return saved;
    },
    async updateCategory(id, categoryId) {
      const row = rows.get(id);
      if (!row) throw new Error(`Transaction ${id} not found`);
      rows.set(id, { ...row, categoryId });
    },
    async remove(id) {
      rows.delete(id);
    },
  };
}
