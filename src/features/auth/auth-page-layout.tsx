import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";

/** Centered, tab-bar-free layout for the login / password screens. */
export function AuthPageLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("app");

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
          <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
