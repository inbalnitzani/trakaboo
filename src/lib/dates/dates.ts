/**
 * Calendar helpers built on plain strings so time zones never shift a purchase to
 * another day: dates are ISO "YYYY-MM-DD" (IsoDate) and months are "YYYY-MM" (MonthKey).
 */

export type IsoDate = `${number}-${string}-${string}`;
export type MonthKey = `${number}-${string}`;

const pad = (n: number) => String(n).padStart(2, "0");

function toIso(year: number, month: number, day: number): IsoDate {
  return `${year}-${pad(month)}-${pad(day)}` as IsoDate;
}

function parts(key: string): [number, number] {
  const [y, m] = key.split("-").map(Number);
  return [y, m];
}

export function isIsoDate(value: string): value is IsoDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(`${y}-${pad(m)}` as MonthKey);
}

export function isMonthKey(value: string): value is MonthKey {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return !!match && Number(match[2]) >= 1 && Number(match[2]) <= 12;
}

/** "2026-09-14" → "2026-09" */
export function toMonthKey(date: IsoDate): MonthKey {
  return date.slice(0, 7) as MonthKey;
}

/** Day of the month: "2026-09-14" → 14 */
export function dayOfMonth(date: IsoDate): number {
  return Number(date.slice(8, 10));
}

export function daysInMonth(month: MonthKey): number {
  const [y, m] = parts(month);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Moves a month key by `delta` months: shiftMonth("2026-01", -1) → "2025-12" */
export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const [y, m] = parts(month);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}` as MonthKey;
}

/** First and last day of a month, inclusive. */
export function monthRange(month: MonthKey): { from: IsoDate; to: IsoDate } {
  const [y, m] = parts(month);
  return { from: toIso(y, m, 1), to: toIso(y, m, daysInMonth(month)) };
}

export function isInMonth(date: IsoDate, month: MonthKey): boolean {
  return toMonthKey(date) === month;
}

/** Today's date in the given IANA time zone (defaults to Israel). */
export function todayIso(timeZone = "Asia/Jerusalem", now = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now) as IsoDate;
}

/**
 * Parses statement dates "DD/MM/YYYY" or "DD/MM/YY" (also with "." or "-").
 * Two-digit years are taken as 20YY. Returns null if invalid.
 */
export function parseDayMonthYear(input: string): IsoDate | null {
  const match = input.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const year = y.length === 2 ? 2000 + Number(y) : Number(y);
  const iso = toIso(year, Number(m), Number(d));
  return isIsoDate(iso) ? iso : null;
}

/** Localized month label: ("2026-09", "he-IL") → "ספטמבר 2026" */
export function formatMonth(month: MonthKey, locale: string): string {
  const [y, m] = parts(month);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/** Localized date label, e.g. ("2026-09-14", "en-US", { weekday: "long", day: "numeric", month: "long" }) */
export function formatDate(
  date: IsoDate,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}
