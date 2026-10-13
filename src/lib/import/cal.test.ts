import readXlsxFile from "read-excel-file/universal";
import { describe, expect, it } from "vitest";

import { parseCalStatement, type WorkbookSheet } from "./cal";
import { FAKE_CAL_ROWS, fakeCalSheet } from "./fixtures/fake-cal";
import { type FixtureSheet, makeXlsx } from "./fixtures/make-xlsx";

const asWorkbook = (...sheets: FixtureSheet[]): WorkbookSheet[] =>
  sheets.map((s) => ({ sheet: s.name, data: s.rows }));

describe("parseCalStatement", () => {
  it("reads every transaction from a Cal statement", () => {
    const result = parseCalStatement(asWorkbook(fakeCalSheet(FAKE_CAL_ROWS)));
    if (!result.ok) throw new Error(result.error);

    expect(result.statement).toMatchObject({ source: "cal", cardLast4: "4321", total: 930.45 });
    expect(result.statement.rows).toHaveLength(6);
    expect(result.statement.rows[0]).toEqual({
      date: "2026-09-03",
      amount: 38,
      merchant: "קפה לנדוור",
      categoryId: "other",
      cardLast4: "4321",
      note: null,
      externalRef: "cal|4321|2026-09-03|38|קפה לנדוור|1",
    });
  });

  it("bills installments at the charged amount, dated by the purchase", () => {
    const result = parseCalStatement(asWorkbook(fakeCalSheet(FAKE_CAL_ROWS)));
    const installment =
      result.ok && result.statement.rows.find((r) => r.merchant === "באג מולטיסטור");
    expect(installment).toMatchObject({ date: "2026-08-15", amount: 400, note: "תשלום 2 מתוך 3" });
  });

  it("keeps refunds negative and files PayBox under transfers", () => {
    const result = parseCalStatement(asWorkbook(fakeCalSheet(FAKE_CAL_ROWS)));
    const rows = result.ok ? result.statement.rows : [];
    expect(rows.find((r) => r.merchant === "זארה")?.amount).toBe(-89.9);
    expect(rows.find((r) => r.merchant === "PAYBOX")?.categoryId).toBe("transfers");
  });

  it("numbers identical purchases so both are kept", () => {
    const coffee = { date: "01/09/2026", merchant: "קפה", amount: "12.00 ₪" };
    const result = parseCalStatement(asWorkbook(fakeCalSheet([coffee, coffee])));
    expect(result.ok && result.statement.rows.map((r) => r.externalRef.slice(-2))).toEqual([
      "|1",
      "|2",
    ]);
  });

  it("skips rows that aren't transactions", () => {
    const sheet = fakeCalSheet(FAKE_CAL_ROWS.slice(0, 1));
    sheet.rows.push([], ['סה"כ', null, null, "38.00 ₪"], ["", "", "", ""]);
    const result = parseCalStatement(asWorkbook(sheet));
    expect(result.ok && result.statement.rows).toHaveLength(1);
  });

  it("finds the columns by header text, in any order", () => {
    const result = parseCalStatement(
      asWorkbook({
        name: "Sheet1",
        rows: [
          ["פירוט", "סכום חיוב", "שם העסק", "תאריך עסקה"],
          [null, 25.5, "מאפה", "02/09/26"],
        ],
      }),
    );
    expect(result.ok && result.statement.rows[0]).toMatchObject({
      date: "2026-09-02",
      amount: 25.5,
      merchant: "מאפה",
      cardLast4: null,
    });
  });

  it("rejects files that aren't Cal statements", () => {
    expect(parseCalStatement(asWorkbook({ name: "x", rows: [["hello"]] }))).toEqual({
      ok: false,
      error: "notAStatement",
    });
    expect(parseCalStatement(asWorkbook(fakeCalSheet([])))).toEqual({
      ok: false,
      error: "noTransactions",
    });
  });

  it("works on a real .xlsx file", async () => {
    const bytes = makeXlsx([{ name: "Other", rows: [["ignore me"]] }, fakeCalSheet(FAKE_CAL_ROWS)]);
    const sheets = await readXlsxFile(new Blob([bytes as BlobPart]));
    const result = parseCalStatement(sheets);
    expect(result.ok && result.statement.rows).toHaveLength(6);
  });
});
