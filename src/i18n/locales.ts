/**
 * Supported locales and their metadata. Add a language here (plus a messages file)
 * and the whole app — routing, direction, switcher — picks it up.
 */
export const LOCALES = {
  he: { dir: "rtl", label: "עברית", short: "עב", intl: "he-IL" },
  en: { dir: "ltr", label: "English", short: "EN", intl: "en-US" },
} as const satisfies Record<string, LocaleMeta>;

export type LocaleMeta = {
  dir: "rtl" | "ltr";
  /** Full name, shown in settings. */
  label: string;
  /** Short name, shown in the header switcher. */
  short: string;
  /** BCP 47 tag used for Intl number/date formatting. */
  intl: string;
};

export type Locale = keyof typeof LOCALES;

export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

export const DEFAULT_LOCALE: Locale = "he";

export function getDirection(locale: Locale): LocaleMeta["dir"] {
  return LOCALES[locale].dir;
}
