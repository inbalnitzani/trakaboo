import { useTranslations } from "next-intl";
import { use } from "react";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CheckerBand } from "@/components/ui/checker-band";
import { LogoMark } from "@/components/ui/logo-mark";
import { LoginForm } from "@/features/auth/login-form";
import { initLocale } from "@/i18n/server";

export default function LoginPage({ params }: PageProps<"/[locale]/login">) {
  initLocale(use(params).locale);
  const t = useTranslations();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col pt-4 pb-8">
      <div className="flex justify-end px-5">
        <LocaleSwitcher />
      </div>

      <header className="relative flex flex-col items-center gap-3 px-5 pt-8 pb-8 text-center">
        <LogoMark size="lg" />
        <span
          aria-hidden
          className="absolute start-20 top-5 -rotate-12 font-display text-3xl text-pop-lilac"
        >
          ✦
        </span>
        <span aria-hidden className="absolute end-20 top-24 font-display text-xl text-series-5">
          ✦
        </span>
        <h1
          className="mt-3 font-display text-[3.25rem] leading-none font-bold tracking-tight"
          dir="ltr"
        >
          Trakaboo
        </h1>
        <p className="text-[1.0625rem] font-medium text-soft-foreground">{t("app.tagline")}</p>
      </header>

      <CheckerBand />

      <div className="px-5 pt-7">
        <div className="rounded-[2rem] border-2 bg-card px-5 pt-6 pb-5 shadow-pop-lg">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
