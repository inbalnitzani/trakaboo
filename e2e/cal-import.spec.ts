import { expect, type Page, test } from "@playwright/test";

import { fakeCalSheet, type FakeCalRow } from "../src/lib/import/fixtures/fake-cal";
import { makeXlsx } from "../src/lib/import/fixtures/make-xlsx";

test.use({ locale: "en-US" });

async function upload(page: Page, rows: FakeCalRow[]) {
  await page.goto("/en/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "cal-statement.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(makeXlsx([fakeCalSheet(rows)])),
  });
}

test("a Cal statement is previewed, imported, and not imported twice", async ({ page }) => {
  // Unique names, since the demo store is shared across tests in one server.
  const id = Date.now();
  const rows: FakeCalRow[] = [
    { date: "03/09/2026", merchant: `Cal café ${id}`, amount: "38.00 ₪" },
    { date: "05/09/2026", merchant: `Cal market ${id}`, amount: "412.35 ₪" },
  ];

  await upload(page, rows);
  await expect(page.getByText("2 transactions · card 4321")).toBeVisible();
  await expect(page.getByText(`Cal café ${id}`)).toBeVisible();
  await page.getByRole("button", { name: "Import 2 transactions" }).click();
  await expect(page.getByText("Imported 2 transactions")).toBeVisible();

  await page.getByRole("link", { name: "See overview" }).click();
  await expect(page).toHaveURL(/\/en$/);

  // Importing the same statement again finds nothing new: both rows were saved.

  await upload(page, rows);
  await expect(page.getByText("Already imported")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Nothing selected" })).toBeDisabled();
});

test("a row already logged with Apple Pay is left out by default", async ({ page, request }) => {
  const id = Date.now();
  const paid = await request.post("/api/apple-pay", {
    headers: { authorization: "Bearer demo" },
    data: { amount: "₪61.17", merchant: `Tap ${id}`, time: "2026-09-08T09:00:00Z" },
  });
  expect(paid.status()).toBe(201);

  await upload(page, [
    { date: "08/09/2026", merchant: `Tap ${id} TLV`, amount: "61.17 ₪" },
    { date: "09/09/2026", merchant: `Other ${id}`, amount: "12.00 ₪" },
  ]);
  await expect(page.getByText(/Probably already logged with Apple Pay/)).toBeVisible();
  await expect(page.getByRole("checkbox", { name: new RegExp(`Tap ${id} TLV`) })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Import 1 transaction" })).toBeEnabled();
});

test("a file that isn't a Cal statement is explained", async ({ page }) => {
  await page.goto("/en/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "notes.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(makeXlsx([{ name: "Sheet1", rows: [["hello"]] }])),
  });
  await expect(page.getByText(/doesn't look like a Cal statement/)).toBeVisible();
});
