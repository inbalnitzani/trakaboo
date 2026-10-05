"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { normalizeEmail, validatePassword } from "./validation";

export type AuthMode = "signIn" | "signUp" | "forgot";

export type AuthState = {
  mode: AuthMode;
  email?: string;
  error?:
    "invalidEmail" | "invalidPassword" | "wrongCredentials" | "notConfirmed" | "requestFailed";
  notice?: "checkEmail" | "resetSent";
};

export type NewPasswordState = { error?: "invalidPassword" | "requestFailed" };

function readCredentials(form: FormData) {
  return {
    email: normalizeEmail(form.get("email")),
    password: validatePassword(form.get("password")),
  };
}

/** Absolute URL of our auth callback, which then sends the user on to `next`. */
async function callbackUrl(next?: string) {
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const url = new URL("/api/auth/callback", origin);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = normalizeEmail(form.get("email"));
  const password = form.get("password");
  if (!email) return { mode: "signIn", error: "invalidEmail" };
  if (typeof password !== "string" || !password) {
    return { mode: "signIn", email, error: "wrongCredentials" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Log the reason code only — never credentials.
    console.warn("signIn failed:", error.code);
    const notConfirmed = error.code === "email_not_confirmed";
    return { mode: "signIn", email, error: notConfirmed ? "notConfirmed" : "wrongCredentials" };
  }

  redirect({ href: "/", locale: await getLocale() });
  return { mode: "signIn" }; // unreachable: redirect throws
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(form);
  if (!email) return { mode: "signUp", error: "invalidEmail" };
  if (!password) return { mode: "signUp", email, error: "invalidPassword" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: await callbackUrl() },
  });
  if (error) {
    console.warn("signUp failed:", error.code);
    return { mode: "signUp", email, error: "requestFailed" };
  }
  // Same response whether or not the address already has an account (no account enumeration).
  return { mode: "signIn", email, notice: "checkEmail" };
}

/** Emails a link that signs the user in and opens the "choose a new password" page. */
export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = normalizeEmail(form.get("email"));
  if (!email) return { mode: "forgot", error: "invalidEmail" };

  const supabase = await createSupabaseServerClient();
  const locale = await getLocale();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await callbackUrl(`/${locale}/new-password`),
  });
  if (error) {
    console.warn("resetPasswordForEmail failed:", error.code);
    return { mode: "forgot", email, error: "requestFailed" };
  }
  // Same response whether or not the address has an account.
  return { mode: "signIn", email, notice: "resetSent" };
}

/** Sets a new password for the signed-in user (after following the reset link). */
export async function setNewPassword(
  _prev: NewPasswordState,
  form: FormData,
): Promise<NewPasswordState> {
  const password = validatePassword(form.get("password"));
  if (!password) return { error: "invalidPassword" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.warn("updateUser(password) failed:", error.code);
    return { error: "requestFailed" };
  }
  redirect({ href: "/", locale: await getLocale() });
  return {}; // unreachable: redirect throws
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: await getLocale() });
}
