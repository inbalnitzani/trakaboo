import "server-only";

import { cache } from "react";

import { todayIso } from "@/lib/dates/dates";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createInMemoryRepository,
  type TransactionsRepository,
} from "@/lib/transactions/repository";

import { generateDemoTransactions } from "./demo-transactions";
import { createSupabaseRepository } from "./supabase-repository";

/** True until Supabase is configured (see .env.example). */
export function isDemoMode(): boolean {
  return getSupabaseEnv() === null;
}

// One demo store per server process, so manual changes survive navigation in dev.
let demoRepository: TransactionsRepository | undefined;

/** The repository for the current request. Features import this, never a concrete store. */
export const getTransactionsRepository = cache(async (): Promise<TransactionsRepository> => {
  if (isDemoMode()) {
    demoRepository ??= createInMemoryRepository(generateDemoTransactions(todayIso()));
    return demoRepository;
  }
  return createSupabaseRepository(await createSupabaseServerClient());
});
