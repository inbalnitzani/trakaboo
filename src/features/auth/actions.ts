"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { normalizeEmail, validatePassword } from "./validation";

export type AuthMode = "signIn" | "signUp";

export type AuthState = {
  mode: AuthMode;
  email?: string;
  error?: "invalidEmail" | "invalidPassword" | "wrongCredentials" | "notConfirmed" | "signUpFailed";
  notice?: "checkEmail";
};

function readCredentials(form: FormData) {
  return {
    email: normalizeEmail(form.get("email")),
    password: validatePassword(form.get("password")),
  };
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(form);
  if (!email) return { mode: "signIn", error: "invalidEmail" };
  if (!password) return { mode: "signIn", email, error: "wrongCredentials" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
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

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/api/auth/callback` },
  });
  if (error) {
    console.error("signUp failed", error.code);
    return { mode: "signUp", email, error: "signUpFailed" };
  }
  // Same response whether or not the address already has an account (no account enumeration).
  return { mode: "signIn", email, notice: "checkEmail" };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: await getLocale() });
}
