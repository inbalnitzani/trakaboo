import "server-only";

import { cache } from "react";

import { todayIso } from "@/lib/dates/dates";
import {
  createInMemoryRepository,
  type TransactionsRepository,
} from "@/lib/transactions/repository";

import { generateDemoTransactions } from "./demo-transactions";

/** True until a real database is configured (see .env.example). */
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// One demo store per server process, so manual changes survive navigation in dev.
let demoRepository: TransactionsRepository | undefined;

/** The repository for the current request. Features import this, never a concrete store. */
export const getTransactionsRepository = cache((): TransactionsRepository => {
  if (isDemoMode()) {
    demoRepository ??= createInMemoryRepository(generateDemoTransactions(todayIso()));
    return demoRepository;
  }
  // Supabase implementation is added with the auth/database feature.
  throw new Error("Supabase repository not implemented yet");
});
