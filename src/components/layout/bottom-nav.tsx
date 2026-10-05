"use client";

import { useTranslations } from "next-intl";

import { NAV_ITEMS, type NavItem } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  /** Tabs to render. Defaults to the app's main navigation. */
  items?: readonly NavItem[];
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav({ items = NAV_ITEMS }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md",
        "border-t border-border bg-white/90 backdrop-blur-md",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="flex justify-around px-2 py-2">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground/70",
                )}
              >
                <Icon
                  className={cn("size-5 transition-transform", active && "scale-110 text-accent")}
                />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
