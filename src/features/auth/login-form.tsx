"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type LoginState, sendLoginCode, verifyLoginCode } from "./actions";
import { OTP_LENGTH } from "./validation";

const INITIAL: LoginState = { step: "email" };

/** Two-step passwordless sign-in: email → 6-digit code. Works inside an installed PWA. */
export function LoginForm() {
  const t = useTranslations("auth");
  const [sendState, send, sending] = useActionState(sendLoginCode, INITIAL);
  const [verifyState, verify, verifying] = useActionState(verifyLoginCode, INITIAL);

  const state = verifyState.step === "code" ? verifyState : sendState;

  if (state.step === "email") {
    return (
      <form action={send} className="grid gap-3.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          required
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "email-error" : undefined}
        />
        {state.error && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {t(`errors.${state.error}`)}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-1 w-full" disabled={sending}>
          {sending ? t("sending") : t("sendCode")}
        </Button>
      </form>
    );
  }

  return (
    <form action={verify} className="grid gap-3.5">
      <p className="text-[0.9375rem] text-soft-foreground">
        {t("codeSent", { email: state.email })}
      </p>
      <input type="hidden" name="email" value={state.email} />
      <Label htmlFor="code">{t("code")}</Label>
      <Input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 \-]*"
        maxLength={OTP_LENGTH + 2}
        dir="ltr"
        required
        autoFocus
        className="h-15 text-center font-display text-3xl font-bold tracking-[0.5em]"
        aria-invalid={!!state.error}
        aria-describedby={state.error ? "code-error" : undefined}
      />
      {state.error && (
        <p id="code-error" role="alert" className="text-sm text-destructive">
          {t(`errors.${state.error}`)}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-1 w-full" disabled={verifying}>
        {verifying ? t("verifying") : t("signIn")}
      </Button>
    </form>
  );
}
