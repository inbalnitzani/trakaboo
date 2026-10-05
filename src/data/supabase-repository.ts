import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { TransactionsRepository } from "@/lib/transactions/repository";

import { fromRow, toInsert } from "./transaction-mapper";

const COLUMNS =
  "id, user_id, date, amount, currency, merchant, category_id, source, card_last4, note, external_ref, created_at, updated_at";

/**
 * Transactions stored in Supabase. Row-level security scopes every query to the
 * signed-in user, so no user filter is needed (or trusted) here.
 */
export function createSupabaseRepository(db: SupabaseClient<Database>): TransactionsRepository {
  const table = () => db.from("transactions");

  return {
    async listBetween({ from, to }) {
      const { data, error } = await table()
        .select(COLUMNS)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(fromRow);
    },

    async create(input) {
      const { data, error } = await table().insert(toInsert(input)).select(COLUMNS).single();
      if (error) throw error;
      return fromRow(data);
    },

    async updateCategory(id, categoryId) {
      const { error } = await table().update({ category_id: categoryId }).eq("id", id);
      if (error) throw error;
    },

    async remove(id) {
      const { error } = await table().delete().eq("id", id);
      if (error) throw error;
    },
  };
}
