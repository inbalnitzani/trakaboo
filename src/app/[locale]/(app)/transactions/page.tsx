import { use } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { initLocale } from "@/i18n/server";

export default function TransactionsPage({ params }: PageProps<"/[locale]/transactions">) {
  initLocale(use(params).locale);
  return <PlaceholderPage titleKey="transactions" icon="🧾" />;
}
