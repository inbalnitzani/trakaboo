import type messages from "./i18n/messages/en.json";
import type { routing } from "./i18n/routing";

// Type-safe translations: t("nav.overview") is checked against en.json at compile time.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
