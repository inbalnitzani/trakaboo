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
