import { useLocale } from "next-intl";
import { useMemo } from "react";

import { formatDate, formatMonth, type IsoDate, type MonthKey } from "@/lib/dates/dates";
import { formatMoney } from "@/lib/money/money";

import { LOCALES } from "./locales";

/** Locale-bound formatters for money, months and dates. Works in server and client components. */
export function useFormatters() {
  const locale = useLocale();
  const intl = LOCALES[locale].intl;

  return useMemo(
    () => ({
      money: (amount: number, fractionDigits?: number) =>
        formatMoney(amount, { locale: intl, fractionDigits }),
      month: (month: MonthKey) => formatMonth(month, intl),
      date: (date: IsoDate, options?: Intl.DateTimeFormatOptions) =>
        formatDate(date, intl, options),
    }),
    [intl],
  );
}
