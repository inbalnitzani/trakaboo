"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";

import { type AuthMode, type AuthState, signIn, signUp } from "./actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "./validation";

type LoginFormProps = {
  /** Shown after the user followed the confirmation link from their email. */
  justConfirmed?: boolean;
};

const fieldClass = "h-12 rounded-2xl bg-card text-base";

/** Email + password sign-in, with a one-time "create account" mode. */
export function LoginForm({ justConfirmed }: LoginFormProps) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<AuthMode>("signIn");

  const [state, submit, pending] = useActionState(
    async (prev: AuthState, form: FormData) => {
      const next = await (mode === "signIn" ? signIn : signUp)(prev, form);
      setMode(next.mode);
      return next;
    },
    { mode: "signIn" } satisfies AuthState,
  );

  const isSignUp = mode === "signUp";
  const error = state.mode === mode ? state.error : undefined;

  return (
    <form action={submit} className="grid gap-3">
      {justConfirmed && !state.notice && <Notice icon="✅">{t("notices.confirmed")}</Notice>}
      {state.notice && <Notice icon="📬">{t(`notices.${state.notice}`)}</Notice>}

      <Label htmlFor="email">{t("email")}</Label>
      <Input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete={isSignUp ? "email" : "username"}
        defaultValue={state.email}
        dir="ltr"
        required
        className={fieldClass}
      />

      <Label htmlFor="password">{t("password")}</Label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        minLength={isSignUp ? PASSWORD_MIN : undefined}
        maxLength={PASSWORD_MAX}
        dir="ltr"
        required
        className={fieldClass}
        aria-describedby={isSignUp ? "password-hint" : undefined}
      />
      {isSignUp && (
        <p id="password-hint" className="-mt-1 text-xs text-muted-foreground">
          {t("passwordHint", { min: PASSWORD_MIN })}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 h-12 rounded-2xl" disabled={pending}>
        {pending ? t("working") : isSignUp ? t("createAccount") : t("signIn")}
      </Button>

      <button
        type="button"
        onClick={() => setMode(isSignUp ? "signIn" : "signUp")}
        className="text-sm font-medium text-accent"
      >
        {isSignUp ? t("haveAccount") : t("noAccount")}
      </button>
    </form>
  );
}
