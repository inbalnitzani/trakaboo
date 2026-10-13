"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

import { createIngestToken, type IngestTokenState } from "./actions";

type ApplePaySettingsProps = {
  /** Full URL of the ingest endpoint, for the Shortcut. */
  endpoint: string;
  /** Localized creation date of the current token, or null if there's none. */
  tokenSince: string | null;
  /** Demo mode has a fixed token and nothing to create. */
  demoToken?: string;
};

/** Endpoint, token and setup steps for the Apple Pay Shortcut. */
export function ApplePaySettings({ endpoint, tokenSince, demoToken }: ApplePaySettingsProps) {
  const t = useTranslations("applePay");
  const [state, action, pending] = useActionState<IngestTokenState>(createIngestToken, {});
  const token = state.token ?? demoToken;
  const hasToken = !!state.token || !!tokenSince;

  return (
    <div className="grid gap-4 text-sm">
      <p className="text-muted-foreground">{t("description")}</p>

      <CopyField label={t("endpoint")} value={endpoint} />

      {token ? (
        <>
          <CopyField label={t("token")} value={token} />
          {state.token && <Notice icon="!">{t("copyNow")}</Notice>}
        </>
      ) : (
        <p className="text-muted-foreground">
          {tokenSince ? t("tokenSince", { date: tokenSince }) : t("noToken")}
        </p>
      )}

      {!demoToken && (
        <form action={action} className="grid gap-2">
          <Button type="submit" variant={hasToken ? "outline" : "default"} disabled={pending}>
            {pending ? t("creating") : hasToken ? t("replaceToken") : t("createToken")}
          </Button>
          {hasToken && <p className="text-muted-foreground">{t("replaceWarning")}</p>}
          {state.failed && <p className="text-destructive">{t("failed")}</p>}
        </form>
      )}

      <ol className="grid list-decimal gap-1.5 ps-5">
        {(["step1", "step2", "step3", "step4"] as const).map((step) => (
          <li key={step}>{t(`steps.${step}`)}</li>
        ))}
      </ol>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const t = useTranslations("applePay");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-1.5">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate rounded-xl border-2 bg-surface px-3 py-2 text-start font-mono text-xs"
        >
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? t("copied") : t("copy", { label })}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </div>
  );
}
