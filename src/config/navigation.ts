import { HomeIcon, type LucideIcon, ReceiptIcon, SettingsIcon, UploadIcon } from "lucide-react";

import type { Messages } from "next-intl";

export type NavItem = {
  href: "/" | "/transactions" | "/import" | "/settings";
  labelKey: keyof Messages["nav"];
  icon: LucideIcon;
};

/** The bottom tab bar is rendered from this list — add or reorder tabs here. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "overview", icon: HomeIcon },
  { href: "/transactions", labelKey: "transactions", icon: ReceiptIcon },
  { href: "/import", labelKey: "import", icon: UploadIcon },
  { href: "/settings", labelKey: "settings", icon: SettingsIcon },
];
