import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatementImport } from "@/features/import/statement-import";
import { initLocale } from "@/i18n/server";

export default async function ImportPage({ params }: PageProps<"/[locale]/import">) {
  initLocale((await params).locale);
  const t = await getTranslations();

  return (
    <div className="grid gap-3">
      <PageHeader title={t("nav.import")} />
      <SectionCard title={t("import.calTitle")}>
        <StatementImport />
      </SectionCard>
    </div>
  );
}
