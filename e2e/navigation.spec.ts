import { expect, test } from "@playwright/test";

test.describe("Hebrew phone", () => {
  test.use({ locale: "he-IL" });

  test("opens in Hebrew, right-to-left", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/he$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "סקירה" })).toBeVisible();
  });
});

test.describe("English phone", () => {
  test.use({ locale: "en-US" });

  test("opens in English, left-to-right", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});

test("switching language keeps the current page", async ({ page }) => {
  await page.goto("/he/transactions");
  await page.getByRole("radio", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/transactions$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Transactions" })).toBeVisible();
});

test("bottom tabs navigate between screens", async ({ page }) => {
  await page.goto("/en");
  const tabs = page.getByRole("navigation");
  for (const name of ["Transactions", "Import", "Settings", "Overview"]) {
    await tabs.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(tabs.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
  }
});
