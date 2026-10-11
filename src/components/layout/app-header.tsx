import { getTranslations } from "next-intl/server";

import { LogoMark } from "@/components/ui/logo-mark";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function AppHeader() {
  const t = await getTranslations("app");

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark size="sm" />
        <span dir="ltr" className="font-display text-2xl font-bold tracking-tight">
          Trakaboo
        </span>
        <span className="sr-only">{t("tagline")}</span>
      </Link>
      <LocaleSwitcher />
    </header>
  );
}
