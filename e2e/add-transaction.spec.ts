import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("header button opens the add expense form", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: "Add expense" }).first().click();
  await expect(page).toHaveURL(/\/en\/add$/);
  await expect(page.getByRole("heading", { name: "Add expense" })).toBeVisible();
});

test("the form explains what's missing", async ({ page }) => {
  await page.goto("/en/add");
  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page.getByText("Enter an amount greater than 0")).toBeVisible();
  await expect(page.getByText("This field is required")).toBeVisible(); // merchant
  await expect(page.getByLabel("Amount")).toHaveValue("0"); // input is kept
});

test("a saved expense shows up in the overview", async ({ page }) => {
  // Unique name, since the demo store is shared across tests in one server.
  const merchant = `Test café ${Date.now()}`;

  await page.goto("/en/add");
  await page.getByLabel("Amount").fill("37.90");
  await page.getByLabel("Where").fill(merchant);
  await page.getByRole("radio", { name: "Groceries" }).check({ force: true });
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page).toHaveURL(/\/en\?month=\d{4}-\d{2}$/);
  const row = page.getByText(merchant);
  await expect(row).toBeVisible();
});
