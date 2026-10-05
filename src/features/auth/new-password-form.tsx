"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { setNewPassword } from "./actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "./validation";

export function NewPasswordForm() {
  const t = useTranslations("auth");
  const [state, submit, pending] = useActionState(setNewPassword, {});

  return (
    <form action={submit} className="grid gap-3">
      <Label htmlFor="password">{t("newPassword")}</Label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN}
        maxLength={PASSWORD_MAX}
        dir="ltr"
        required
        autoFocus
        className="h-12 rounded-2xl bg-card text-base"
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="-mt-1 text-xs text-muted-foreground">
        {t("passwordHint", { min: PASSWORD_MIN })}
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${state.error}`)}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 rounded-2xl" disabled={pending}>
        {pending ? t("working") : t("savePassword")}
      </Button>
    </form>
  );
}
