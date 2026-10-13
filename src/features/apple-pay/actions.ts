"use server";

import { getLocale } from "next-intl/server";

import { saveIngestToken } from "@/data/apple-pay-ingest";
import { isDemoMode } from "@/data/repository";
import { redirect } from "@/i18n/navigation";
import { generateIngestToken } from "@/lib/apple-pay/token";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type IngestTokenState = { token?: string; failed?: boolean };

/** Creates (or replaces) the signed-in user's Apple Pay token and returns it once. */
export async function createIngestToken(): Promise<IngestTokenState> {
  if (isDemoMode()) return { failed: true };

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect({ href: "/login", locale: await getLocale() });

  const token = generateIngestToken();
  try {
    await saveIngestToken(token);
  } catch (error) {
    console.error("createIngestToken failed", error);
    return { failed: true };
  }
  return { token };
}
