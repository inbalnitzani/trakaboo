import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("login page has email + password and validates the email", async ({ page }) => {
  await page.goto("/en/login");
  await expect(page.getByRole("heading", { name: "Trakaboo" })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0); // no tab bar before signing in

  const email = page.getByLabel("Email");
  await email.fill("not-an-email");
  // Bypass the browser's own type=email check to exercise server-side validation.
  await email.evaluate((el) => el.setAttribute("type", "text"));
  await page.getByLabel("Password").fill("whatever-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Scope to the form: Next.js also renders a (hidden) route-announcer alert.
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "That email address doesn't look right",
  );
});

test("can switch to create-account mode and back", async ({ page }) => {
  await page.goto("/en/login");
  await page.getByRole("button", { name: /Create one/ }).click();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByText(/At least 8 characters/)).toBeVisible();
  await page
    .getByRole("button", { name: /Sign in$/ })
    .first()
    .click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
});
