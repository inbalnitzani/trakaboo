import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

// Runs in demo mode, where the endpoint accepts the fixed "demo" token.
const auth = { authorization: "Bearer demo" };

test("a Shortcut payment shows up in the overview", async ({ page, request }) => {
  // Unique name, since the demo store is shared across tests in one server.
  const merchant = `Tap café ${Date.now()}`;

  const first = await request.post("/api/apple-pay", {
    headers: auth,
    data: { amount: "₪23.50", merchant, card: "Visa 1234", time: new Date().toISOString() },
  });
  expect(first.status()).toBe(201);

  await page.goto("/en");
  await expect(page.getByText(merchant)).toBeVisible();
});

test("a retried Shortcut run isn't saved twice", async ({ request }) => {
  const data = { amount: "9.90", merchant: `Retry ${Date.now()}`, time: new Date().toISOString() };
  expect((await request.post("/api/apple-pay", { headers: auth, data })).status()).toBe(201);
  const retry = await request.post("/api/apple-pay", { headers: auth, data });
  expect(retry.status()).toBe(200);
  expect(await retry.json()).toEqual({ result: "duplicate" });
});

test("the endpoint rejects a wrong token", async ({ request }) => {
  const response = await request.post("/api/apple-pay", {
    headers: { authorization: "Bearer nope" },
    data: { amount: "5", merchant: "Nope" },
  });
  expect(response.status()).toBe(401);
});

test("settings show the endpoint and setup steps", async ({ page }) => {
  await page.goto("/en/settings");
  await expect(page.getByRole("heading", { name: "Apple Pay" })).toBeVisible();
  await expect(page.getByText(/\/api\/apple-pay$/)).toBeVisible();
  await expect(page.getByText("Get Contents of URL", { exact: false })).toBeVisible();
});
