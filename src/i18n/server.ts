import "server-only";

import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "./locales";
import { routing } from "./routing";

/**
 * Validates the `[locale]` route param and enables static rendering for it.
 * Call at the top of every layout/page under `app/[locale]`.
 */
export function initLocale(locale: string): Locale {
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
