"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_CODES, LOCALES, type Locale } from "@/i18n/locales";

type LocaleSwitcherProps = {
  /** "short" for the header (עב / EN), "full" for settings (עברית / English). */
  variant?: "short" | "full";
  className?: string;
};

export function LocaleSwitcher({ variant = "short", className }: LocaleSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const options = LOCALE_CODES.map((code) => ({
    value: code,
    label: variant === "short" ? LOCALES[code].short : LOCALES[code].label,
    ariaLabel: LOCALES[code].label,
  }));

  const onValueChange = (next: Locale) =>
    startTransition(() => router.replace(pathname, { locale: next }));

  return (
    <SegmentedControl
      label={t("language")}
      options={options}
      value={locale}
      onValueChange={onValueChange}
      disabled={isPending}
      className={className}
    />
  );
}
