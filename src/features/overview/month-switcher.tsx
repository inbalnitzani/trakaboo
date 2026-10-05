import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/locales";
import { useFormatters } from "@/i18n/use-formatters";
import { type MonthKey, shiftMonth } from "@/lib/dates/dates";

type MonthSwitcherProps = {
  month: MonthKey;
  /** Latest month that can be shown (usually the current month). */
  maxMonth: MonthKey;
  /** Path the links point to; the month is passed as `?month=`. */
  pathname: "/";
};

const arrowClass =
  "grid size-9 place-items-center rounded-full bg-card shadow-soft transition-opacity aria-disabled:pointer-events-none aria-disabled:opacity-35";

/** ‹ September 2026 › — navigates months via the URL so every month is linkable. */
export function MonthSwitcher({ month, maxMonth, pathname }: MonthSwitcherProps) {
  const t = useTranslations("overview");
  const format = useFormatters();
  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const atLatest = month >= maxMonth;
  // "Back" points left in LTR and right in RTL.
  const rtl = getDirection(useLocale()) === "rtl";
  const BackIcon = rtl ? ChevronRightIcon : ChevronLeftIcon;
  const ForwardIcon = rtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <div className="my-2 flex items-center justify-center gap-4">
      <Link
        href={{ pathname, query: { month: prev } }}
        aria-label={t("previousMonth")}
        className={arrowClass}
      >
        <BackIcon className="size-4" />
      </Link>
      <span className="min-w-36 text-center font-semibold" aria-live="polite">
        {format.month(month)}
      </span>
      <Link
        href={{ pathname, query: { month: next } }}
        aria-label={t("nextMonth")}
        aria-disabled={atLatest}
        tabIndex={atLatest ? -1 : undefined}
        className={arrowClass}
      >
        <ForwardIcon className="size-4" />
      </Link>
    </div>
  );
}
