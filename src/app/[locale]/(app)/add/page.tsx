import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { AddTransactionForm } from "@/features/transactions/add-transaction-form";
import { initLocale } from "@/i18n/server";
import { todayIso } from "@/lib/dates/dates";

export default async function AddTransactionPage({ params }: PageProps<"/[locale]/add">) {
  initLocale((await params).locale);
  const t = await getTranslations("addTransaction");

  return (
    <>
      <PageHeader title={t("title")} />
      <AddTransactionForm today={todayIso()} />
    </>
  );
}
