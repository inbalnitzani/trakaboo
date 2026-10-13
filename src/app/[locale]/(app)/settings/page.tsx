import { LogOutIcon } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { DEMO_INGEST_TOKEN, getIngestTokenCreatedAt } from "@/data/apple-pay-ingest";
import { isDemoMode } from "@/data/repository";
import { ApplePaySettings } from "@/features/apple-pay/apple-pay-settings";
import { signOut } from "@/features/auth/actions";
import { LOCALES } from "@/i18n/locales";
import { initLocale } from "@/i18n/server";
import { formatDate, todayIso } from "@/lib/dates/dates";

/** The public URL of the Apple Pay endpoint, as the phone will reach it. */
async function applePayEndpoint() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/api/apple-pay`;
}

export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations();
  const demo = isDemoMode();
  const createdAt = await getIngestTokenCreatedAt();
  const tokenSince = createdAt
    ? formatDate(todayIso("Asia/Jerusalem", new Date(createdAt)), LOCALES[locale].intl, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="grid gap-3">
      <PageHeader title={t("nav.settings")} />

      <SectionCard title={t("common.language")}>
        <LocaleSwitcher variant="full" />
      </SectionCard>

      <SectionCard title={t("applePay.title")}>
        <ApplePaySettings
          endpoint={await applePayEndpoint()}
          tokenSince={tokenSince}
          demoToken={demo ? DEMO_INGEST_TOKEN : undefined}
        />
      </SectionCard>

      {!demo && (
        <form action={signOut}>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <LogOutIcon />
            {t("auth.signOut")}
          </Button>
        </form>
      )}
    </div>
  );
}
