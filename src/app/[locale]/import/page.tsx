import { use } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { initLocale } from "@/i18n/server";

export default function ImportPage({ params }: PageProps<"/[locale]/import">) {
  initLocale(use(params).locale);
  return <PlaceholderPage titleKey="import" icon="📄" />;
}
