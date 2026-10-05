export type CurrencyCode = "ILS" | "USD" | "EUR" | (string & {});

export const DEFAULT_CURRENCY: CurrencyCode = "ILS";

type FormatMoneyOptions = {
  /** BCP 47 tag, e.g. "he-IL" or "en-US". */
  locale: string;
  currency?: CurrencyCode;
  /** Fixed number of decimals. Defaults to 0 for whole amounts, 2 otherwise. */
  fractionDigits?: number;
};

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currency: string, digits: number) {
  const key = `${locale}|${currency}|${digits}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Formats an amount as currency for the given locale, e.g. 5208 → "‏5,208 ₪" (he) / "₪5,208" (en). */
export function formatMoney(
  amount: number,
  { locale, currency = DEFAULT_CURRENCY, fractionDigits }: FormatMoneyOptions,
): string {
  const digits = fractionDigits ?? (Number.isInteger(amount) ? 0 : 2);
  return getFormatter(locale, currency, digits).format(amount);
}

/**
 * Parses an amount from statement text, tolerating currency symbols, thousands
 * separators and surrounding whitespace: "1,165.00 ₪" → 1165, "₪ -40.9" → -40.9.
 * Returns null when no number is present.
 */
export function parseAmount(input: string | number | null | undefined): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (!input) return null;

  const match = input.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Sums amounts without floating-point drift (works in agorot/cents). */
export function sumAmounts(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + Math.round(amount * 100), 0) / 100;
}
