"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { normalizeEmail, normalizeOtp } from "./validation";

export type LoginState =
  | { step: "email"; error?: "invalidEmail" | "sendFailed" }
  | { step: "code"; email: string; error?: "invalidCode" | "wrongCode" };

/** Step 1: email a 6-digit sign-in code. */
export async function sendLoginCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = normalizeEmail(form.get("email"));
  if (!email) return { step: "email", error: "invalidEmail" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    console.error("signInWithOtp failed", error.message);
    return { step: "email", error: "sendFailed" };
  }
  return { step: "code", email };
}

/** Step 2: verify the code, then go to the overview. */
export async function verifyLoginCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = normalizeEmail(form.get("email"));
  if (!email) return { step: "email", error: "invalidEmail" };

  const token = normalizeOtp(form.get("code"));
  if (!token) return { step: "code", email, error: "invalidCode" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, error: "wrongCode" };

  redirect({ href: "/", locale: await getLocale() });
  return { step: "code", email }; // unreachable: redirect throws
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: await getLocale() });
}
