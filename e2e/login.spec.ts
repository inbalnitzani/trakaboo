import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("login page asks for an email and validates it", async ({ page }) => {
  await page.goto("/en/login");
  await expect(page.getByRole("heading", { name: "Trakaboo" })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0); // no tab bar before signing in

  await page.getByLabel("Email").fill("not-an-email");
  // Bypass the browser's own type=email check to exercise server-side validation.
  await page.getByLabel("Email").evaluate((el) => el.setAttribute("type", "text"));
  await page.getByRole("button", { name: "Send sign-in code" }).click();
  // Scope to the form: Next.js also renders a (hidden) route-announcer alert.
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "That email address doesn't look right",
  );
});
