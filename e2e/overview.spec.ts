import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("overview shows the month's spending with charts", async ({ page }) => {
  await page.goto("/en?month=2026-09");

  await expect(page.getByText("September 2026")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Spent this month" })).toBeVisible();
  await expect(page.getByRole("img", { name: "By category" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Daily spending" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent transactions" })).toBeVisible();
});

test("month arrows move between months via the URL", async ({ page }) => {
  await page.goto("/en?month=2026-09");
  await page.getByRole("link", { name: "Previous month" }).click();
  await expect(page).toHaveURL(/month=2026-08/);
  await expect(page.getByText("August 2026")).toBeVisible();

  await page.getByRole("link", { name: "Next month" }).click();
  await expect(page.getByText("September 2026")).toBeVisible();
});

test("tapping a legend row highlights that category", async ({ page }) => {
  await page.goto("/en?month=2026-09");
  const food = page.getByRole("button", { name: /Food/ });
  await food.click();
  await expect(food).toHaveAttribute("aria-pressed", "true");
});

test("future months fall back to the current month", async ({ page }) => {
  await page.goto("/en?month=2999-01");
  await expect(page.getByRole("link", { name: "Next month" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});
