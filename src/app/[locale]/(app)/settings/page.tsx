import { LogOutIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { isDemoMode } from "@/data/repository";
import { signOut } from "@/features/auth/actions";
import { initLocale } from "@/i18n/server";

export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  initLocale((await params).locale);
  const t = await getTranslations();

  return (
    <div className="grid gap-3">
      <PageHeader title={t("nav.settings")} />

      <SectionCard title={t("common.language")}>
        <LocaleSwitcher variant="full" />
      </SectionCard>

      {!isDemoMode() && (
        <form action={signOut}>
          <Button type="submit" variant="outline" size="lg" className="w-full rounded-2xl">
            <LogOutIcon />
            {t("auth.signOut")}
          </Button>
        </form>
      )}
    </div>
  );
}
