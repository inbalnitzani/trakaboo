import { type IsoDate, todayIso } from "@/lib/dates/dates";
import { type CurrencyCode, DEFAULT_CURRENCY, parseAmount } from "@/lib/money/money";
import { AMOUNT_MAX, MERCHANT_MAX_LENGTH } from "@/lib/transactions/new-transaction";

/** What the endpoint stores for one Apple Pay payment. */
export type ApplePayPayment = {
  date: IsoDate;
  amount: number;
  currency: CurrencyCode;
  merchant: string;
  cardLast4: string | null;
  /** Stable id for this payment, so a retried Shortcut run isn't saved twice. */
  externalRef: string;
};

export type ApplePayField = "amount" | "merchant" | "time";
export type ApplePayError =
  "required" | "invalidAmount" | "tooLarge" | "invalidTime" | "futureTime";

export type ApplePayParseResult =
  | { ok: true; payment: ApplePayPayment }
  | { ok: false; errors: Partial<Record<ApplePayField, ApplePayError>> };

/** Currency symbols/codes the Shortcut's formatted amount may contain. Anything else is ILS. */
const CURRENCY_MARKERS: [RegExp, CurrencyCode][] = [
  [/₪|\bILS\b|ש"ח/i, "ILS"],
  [/\$|\bUSD\b/i, "USD"],
  [/€|\bEUR\b/i, "EUR"],
];

function detectCurrency(amount: unknown): CurrencyCode {
  if (typeof amount !== "string") return DEFAULT_CURRENCY;
  return CURRENCY_MARKERS.find(([marker]) => marker.test(amount))?.[1] ?? DEFAULT_CURRENCY;
}

/** "Visa •••• 1234" / "Max 1234" → "1234"; card names without digits → null. */
function cardLast4(card: unknown): string | null {
  if (typeof card !== "string") return null;
  return /(\d{4})\D*$/.exec(card)?.[1] ?? null;
}

const text = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

/**
 * Validates the JSON an iOS Shortcuts "Transaction" automation sends:
 * `{ amount, merchant, card?, time? }`. `amount` is the Shortcut's formatted
 * string (e.g. "₪45.90"); `time` is an ISO 8601 timestamp and defaults to `now`.
 * The purchase date is taken in Israel time, like the rest of the app.
 */
export function parseApplePayPayload(body: unknown, now: Date): ApplePayParseResult {
  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const errors: Partial<Record<ApplePayField, ApplePayError>> = {};

  const rawAmount = input.amount;
  const amount =
    typeof rawAmount === "string" || typeof rawAmount === "number" ? parseAmount(rawAmount) : null;
  if (rawAmount === undefined || rawAmount === "") errors.amount = "required";
  else if (amount === null || amount <= 0) errors.amount = "invalidAmount";
  else if (amount > AMOUNT_MAX) errors.amount = "tooLarge";

  // Automated input: shorten long merchant names instead of rejecting the payment.
  const merchant = text(input.merchant).slice(0, MERCHANT_MAX_LENGTH).trim();
  if (!merchant) errors.merchant = "required";

  let time = now;
  if (input.time !== undefined && input.time !== "") {
    time = typeof input.time === "string" ? new Date(input.time) : new Date(NaN);
    if (Number.isNaN(time.getTime())) errors.time = "invalidTime";
    // A few minutes of clock skew between phone and server is fine.
    else if (time.getTime() > now.getTime() + 5 * 60_000) errors.time = "futureTime";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const rounded = Math.round(amount! * 100) / 100;
  return {
    ok: true,
    payment: {
      date: todayIso("Asia/Jerusalem", time),
      amount: rounded,
      currency: detectCurrency(rawAmount),
      merchant,
      cardLast4: cardLast4(input.card),
      externalRef: `${time.toISOString()}|${rounded}|${merchant}`,
    },
  };
}
