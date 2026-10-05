import { DirectionProvider } from "@base-ui/react/direction-provider";
import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";
import { getDirection } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { initLocale } from "@/i18n/server";

import "../globals.css";

const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#fff8f1",
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("name"), description: t("tagline") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = initLocale((await params).locale);
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={rubik.variable}>
      <body>
        <NextIntlClientProvider>
          <DirectionProvider direction={dir}>
            {children}
            <Toaster position="top-center" />
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
