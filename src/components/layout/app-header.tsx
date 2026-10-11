import { PlusIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function AppHeader() {
  const t = await getTranslations("app");
  const tc = await getTranslations("common");

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark size="sm" />
        <span dir="ltr" className="font-display text-2xl font-bold tracking-tight">
          Trakaboo
        </span>
        <span className="sr-only">{t("tagline")}</span>
      </Link>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <Link
          href="/add"
          aria-label={tc("addExpense")}
          className={buttonVariants({ size: "icon-sm" })}
        >
          <PlusIcon strokeWidth={2.75} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
