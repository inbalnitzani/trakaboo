import type { FixtureCell, FixtureSheet } from "./make-xlsx";

/** Sheet name Cal uses for shekel charges. */
export const CAL_ILS_SHEET = "חיובים בשקלים";

export type FakeCalRow = {
  date: string;
  merchant: string;
  amount: string;
  charge?: string;
  details?: string;
};

/**
 * A fake Cal statement laid out like the real export (see DESIGN.md → Statement formats):
 * three summary rows, a blank row, the header, then one row per transaction.
 * All names, numbers and cards are made up.
 */
export function fakeCalSheet(
  rows: FakeCalRow[],
  {
    card = "4321",
    chargeDate = "10/10/2026",
    total,
  }: { card?: string; chargeDate?: string; total?: string } = {},
): FixtureSheet {
  const sum = rows.reduce(
    (s, r) => s + Number.parseFloat((r.charge ?? r.amount).replace(/[^\d.-]/g, "")),
    0,
  );
  const body: FixtureCell[][] = [
    [`תאריך החיוב : ${chargeDate}`],
    [`כרטיס : ${card}`],
    [`סה"כ חיובים בשקלים : ${total ?? `${sum.toFixed(2)} ₪`}`],
    [],
    ["תאריך עסקה", "שם העסק", "סכום עסקה", "סכום חיוב", "פירוט"],
    ...rows.map((r) => [r.date, r.merchant, r.amount, r.charge ?? r.amount, r.details ?? null]),
  ];
  return { name: CAL_ILS_SHEET, rows: body };
}

/** A small, varied statement used by unit and e2e tests. */
export const FAKE_CAL_ROWS: FakeCalRow[] = [
  { date: "03/09/2026", merchant: "קפה לנדוור", amount: "38.00 ₪" },
  { date: "05/09/2026", merchant: "שופרסל דיל", amount: "412.35 ₪" },
  { date: "07/09/2026", merchant: "PAYBOX", amount: "120.00 ₪", details: "העברה" },
  { date: "12/09/2026", merchant: "רב-קו אונליין", amount: "50.00 ₪" },
  {
    date: "15/08/2026",
    merchant: "באג מולטיסטור",
    amount: "1,200.00 ₪",
    charge: "400.00 ₪",
    details: "תשלום 2 מתוך 3",
  },
  { date: "20/09/2026", merchant: "זארה", amount: "-89.90 ₪", details: "זיכוי" },
];
