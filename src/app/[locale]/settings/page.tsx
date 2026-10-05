import { use } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { initLocale } from "@/i18n/server";

export default function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  initLocale(use(params).locale);
  return <PlaceholderPage titleKey="settings" icon="⚙️" />;
}
