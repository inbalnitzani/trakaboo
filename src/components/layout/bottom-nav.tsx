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

/** Floating ink pill. The current tab grows into a pink pill with its label; the rest are icons. */
export function BottomNav({ items = NAV_ITEMS }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[calc(28rem-2rem)]",
        "rounded-full bg-foreground p-2",
      )}
    >
      <ul className="flex items-center justify-between">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(pathname, href);
          const label = t(labelKey);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-13 min-w-13 items-center justify-center gap-1.5 rounded-full font-display text-[0.9375rem] font-semibold transition-[background-color,padding]",
                  "outline-none focus-visible:ring-3 focus-visible:ring-primary/70",
                  active ? "bg-primary px-4 text-primary-foreground" : "text-divider",
                )}
              >
                <Icon className="size-[1.375rem]" strokeWidth={2} aria-hidden />
                {active && <span>{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
