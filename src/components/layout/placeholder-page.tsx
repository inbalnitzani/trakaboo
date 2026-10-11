import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { LogoMark } from "@/components/ui/logo-mark";
import type { NavItem } from "@/config/navigation";

import { PageHeader } from "./page-header";

type PlaceholderPageProps = {
  titleKey: NavItem["labelKey"];
};

/** Temporary page body until a screen's feature is built. */
export function PlaceholderPage({ titleKey }: PlaceholderPageProps) {
  const t = useTranslations();

  return (
    <>
      <PageHeader title={t(`nav.${titleKey}`)} />
      <EmptyState icon={<LogoMark size="lg" />} title={t("common.comingSoon")} />
    </>
  );
}
