import { useTranslations } from "next-intl";
import { use } from "react";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { LoginForm } from "@/features/auth/login-form";
import { initLocale } from "@/i18n/server";

export default function LoginPage({ params }: PageProps<"/[locale]/login">) {
  initLocale(use(params).locale);
  const t = useTranslations();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-6">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-8">
        <header className="text-center">
          <div className="mb-3 text-6xl" aria-hidden>
            👀💸
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" dir="ltr">
            Traka<span className="text-accent">boo</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("app.tagline")}</p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
