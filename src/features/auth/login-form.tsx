"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";

import { type AuthMode, type AuthState, requestPasswordReset, signIn, signUp } from "./actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "./validation";

/** Result of following a link from an auth email (see /api/auth/callback). */
export type LinkStatus = "confirmed" | "linkExpired";

const ACTIONS = { signIn, signUp, forgot: requestPasswordReset } as const;
const SUBMIT_LABEL = {
  signIn: "signIn",
  signUp: "createAccount",
  forgot: "sendResetLink",
} as const;

const fieldClass = "h-12 rounded-2xl bg-card text-base";

/** Email + password sign-in, with "create account" and "forgot password" modes. */
export function LoginForm({ linkStatus }: { linkStatus?: LinkStatus }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<AuthMode>("signIn");

  const [state, submit, pending] = useActionState(
    async (prev: AuthState, form: FormData) => {
      const next = await ACTIONS[mode](prev, form);
      setMode(next.mode);
      return next;
    },
    { mode: "signIn" } satisfies AuthState,
  );

  const error = state.mode === mode ? state.error : undefined;
  const needsPassword = mode !== "forgot";

  return (
    <form action={submit} className="grid gap-3">
      {state.notice ? (
        <Notice icon="📬">{t(`notices.${state.notice}`)}</Notice>
      ) : (
        linkStatus && (
          <Notice icon={linkStatus === "confirmed" ? "✅" : "⏳"}>
            {t(`notices.${linkStatus}`)}
          </Notice>
        )
      )}
      {mode === "forgot" && <p className="text-sm text-muted-foreground">{t("forgotIntro")}</p>}

      <Label htmlFor="email">{t("email")}</Label>
      <Input
        // Remount when the server echoes the email back, instead of changing defaultValue.
        key={state.email ?? "empty"}
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete={mode === "signUp" ? "email" : "username"}
        defaultValue={state.email}
        dir="ltr"
        required
        className={fieldClass}
      />

      {needsPassword && (
        <>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">{t("password")}</Label>
            {mode === "signIn" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs font-medium text-accent"
              >
                {t("forgotPassword")}
              </button>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            minLength={mode === "signUp" ? PASSWORD_MIN : undefined}
            maxLength={PASSWORD_MAX}
            dir="ltr"
            required
            className={fieldClass}
            aria-describedby={mode === "signUp" ? "password-hint" : undefined}
          />
          {mode === "signUp" && (
            <p id="password-hint" className="-mt-1 text-xs text-muted-foreground">
              {t("passwordHint", { min: PASSWORD_MIN })}
            </p>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 h-12 rounded-2xl" disabled={pending}>
        {pending ? t("working") : t(SUBMIT_LABEL[mode])}
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        className="text-sm font-medium text-accent"
      >
        {mode === "signIn" ? t("noAccount") : t("backToSignIn")}
      </button>
    </form>
  );
}
