import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { ApplePayPayment } from "@/lib/apple-pay/payload";
import { hashIngestToken } from "@/lib/apple-pay/token";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getTransactionsRepository, isDemoMode } from "./repository";

export type IngestResult = "created" | "duplicate" | "unauthorized";
export type IngestApplePay = (token: string, payment: ApplePayPayment) => Promise<IngestResult>;

/** In demo mode the Shortcut can use this fixed token to try the flow end to end. */
export const DEMO_INGEST_TOKEN = "demo";
const demoRefs = new Set<string>();

/**
 * Saves an Apple Pay payment for the owner of `token`. There's no session here, so this
 * goes through the `ingest_transaction` database function (anon key), which checks the token.
 */
export const ingestApplePay: IngestApplePay = async (token, payment) => {
  if (isDemoMode()) {
    if (token !== DEMO_INGEST_TOKEN) return "unauthorized";
    if (demoRefs.has(payment.externalRef)) return "duplicate";
    demoRefs.add(payment.externalRef);
    const repository = await getTransactionsRepository();
    await repository.create({
      date: payment.date,
      amount: payment.amount,
      currency: payment.currency,
      merchant: payment.merchant,
      categoryId: "other",
      source: "apple_pay",
      cardLast4: payment.cardLast4,
    });
    return "created";
  }

  const { url, publishableKey } = requireSupabaseEnv();
  const db = createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.rpc("ingest_transaction", {
    p_token: token,
    p_date: payment.date,
    p_amount: payment.amount,
    p_currency: payment.currency,
    p_merchant: payment.merchant,
    p_card_last4: payment.cardLast4,
    p_external_ref: payment.externalRef,
  });
  if (error?.code === "28000") return "unauthorized";
  if (error) throw error;
  return data;
};

/** When the signed-in user's current ingest token was created, or null if they have none. */
export async function getIngestTokenCreatedAt(): Promise<string | null> {
  if (isDemoMode()) return null;
  const db = await createSupabaseServerClient();
  const { data, error } = await db.from("ingest_tokens").select("created_at").maybeSingle();
  if (error) throw error;
  return data?.created_at ?? null;
}

/** Replaces the signed-in user's ingest token (the old one stops working immediately). */
export async function saveIngestToken(token: string): Promise<void> {
  const db = await createSupabaseServerClient();
  const { error } = await db
    .from("ingest_tokens")
    .upsert({ token_hash: hashIngestToken(token), created_at: new Date().toISOString() });
  if (error) throw error;
}
