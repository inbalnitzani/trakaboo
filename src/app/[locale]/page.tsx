import { use } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { initLocale } from "@/i18n/server";

export default function OverviewPage({ params }: PageProps<"/[locale]">) {
  initLocale(use(params).locale);
  return <PlaceholderPage titleKey="overview" icon="💸" />;
}
