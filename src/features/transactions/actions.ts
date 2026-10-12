"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { getTransactionsRepository, isDemoMode } from "@/data/repository";
import { redirect } from "@/i18n/navigation";
import { todayIso, toMonthKey } from "@/lib/dates/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type NewTransactionErrors, parseNewTransaction } from "@/lib/transactions/new-transaction";

export type AddTransactionState = {
  errors?: NewTransactionErrors;
  /** What was submitted, so the form can keep it after an error. */
  values?: Partial<Record<(typeof FIELDS)[number], string>>;
  /** Something went wrong saving (not the user's input). */
  failed?: boolean;
};

const FIELDS = ["amount", "merchant", "date", "categoryId", "note"] as const;

/** Saves a manually entered expense, then returns to the overview. */
export async function addTransaction(
  _prev: AddTransactionState,
  form: FormData,
): Promise<AddTransactionState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(form.get(field) ?? "")]),
  ) as AddTransactionState["values"];
  const parsed = parseNewTransaction(values!, todayIso());
  if (!parsed.ok) return { errors: parsed.errors, values };

  // Server actions are reachable by direct POST, so check the session here too (RLS is the backstop).
  if (!isDemoMode()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect({ href: "/login", locale: await getLocale() });
  }

  try {
    const repository = await getTransactionsRepository();
    await repository.create(parsed.transaction);
  } catch (error) {
    console.error("addTransaction failed", error);
    return { failed: true, values };
  }

  revalidatePath("/[locale]", "layout");
  // Land on the month the expense counts in, so it's visible right away.
  const month = toMonthKey(parsed.transaction.date);
  redirect({ href: { pathname: "/", query: { month } }, locale: await getLocale() });
  return {}; // unreachable: redirect throws
}
