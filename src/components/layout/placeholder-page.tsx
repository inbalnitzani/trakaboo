import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import type { NavItem } from "@/config/navigation";

import { PageHeader } from "./page-header";

type PlaceholderPageProps = {
  titleKey: NavItem["labelKey"];
  icon: string;
};

/** Temporary page body until a screen's feature is built. */
export function PlaceholderPage({ titleKey, icon }: PlaceholderPageProps) {
  const t = useTranslations();

  return (
    <>
      <PageHeader title={t(`nav.${titleKey}`)} />
      <EmptyState icon={icon} title={t("common.comingSoon")} />
    </>
  );
}
