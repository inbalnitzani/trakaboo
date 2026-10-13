"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { getTransactionsRepository, isDemoMode } from "@/data/repository";
import { redirect } from "@/i18n/navigation";
import { addDays, todayIso } from "@/lib/dates/dates";
import { APPLE_PAY_MATCH_DAYS, planImport, type PlannedRow } from "@/lib/import/plan";
import type { ParsedStatement } from "@/lib/import/types";
import { validateStatementRows } from "@/lib/import/validate";
import { DEFAULT_CURRENCY } from "@/lib/money/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Source = ParsedStatement["source"];
const SOURCES: readonly Source[] = ["cal", "max"];

export type PlanResult = { planned: PlannedRow[] } | { error: "invalid" | "failed" };
export type ImportResult = { saved: number } | { error: "invalid" | "failed" };

// Server actions are reachable by direct POST, so check the session here too (RLS is the backstop).
async function requireUser() {
  if (isDemoMode()) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect({ href: "/login", locale: await getLocale() });
}

/** Marks which statement rows are new, already imported, or duplicates of Apple Pay payments. */
export async function planStatementImport(source: Source, rows: unknown): Promise<PlanResult> {
  await requireUser();
  const valid = SOURCES.includes(source) ? validateStatementRows(rows, todayIso()) : null;
  if (!valid) return { error: "invalid" };

  try {
    const dates = valid.map((r) => r.date).sort();
    const repository = await getTransactionsRepository();
    const existing = await repository.listBetween({
      from: addDays(dates[0], -APPLE_PAY_MATCH_DAYS),
      to: addDays(dates[dates.length - 1], APPLE_PAY_MATCH_DAYS),
    });
    const statement: ParsedStatement = { source, cardLast4: null, total: null, rows: valid };
    return { planned: planImport(statement, existing) };
  } catch (error) {
    console.error("planStatementImport failed", error);
    return { error: "failed" };
  }
}

/** Saves the chosen statement rows. Rows imported before are skipped, so retrying is safe. */
export async function importStatementRows(source: Source, rows: unknown): Promise<ImportResult> {
  await requireUser();
  const valid = SOURCES.includes(source) ? validateStatementRows(rows, todayIso()) : null;
  if (!valid) return { error: "invalid" };

  try {
    const repository = await getTransactionsRepository();
    const saved = await repository.createMany(
      valid.map((r) => ({ ...r, source, currency: DEFAULT_CURRENCY })),
    );
    revalidatePath("/[locale]", "layout");
    return { saved };
  } catch (error) {
    console.error("importStatementRows failed", error);
    return { error: "failed" };
  }
}
