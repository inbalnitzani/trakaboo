import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function AppHeader() {
  const t = await getTranslations("app");

  return (
    <header className="flex items-center justify-between px-4 pt-5 pb-2">
      <Link href="/" className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight">
        <span aria-hidden>👀</span>
        <span dir="ltr">
          Traka<span className="text-accent">boo</span>
        </span>
        <span className="sr-only">{t("tagline")}</span>
      </Link>
      <LocaleSwitcher />
    </header>
  );
}
