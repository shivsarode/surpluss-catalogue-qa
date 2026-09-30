import { test, expect } from "@playwright/test";

test("buyer can submit enquiry and admin can see it in Leads", async ({ page }) => {
  const buyerName = `Playwright Buyer ${Date.now()}`;

  // Buyer journey
  await page.goto("/catalogue/premium-corporate-essentials");

  await page.getByRole("link", { name: "Atlas cabin trolley" }).click();
  await expect(page.getByRole("heading", { name: "Atlas cabin trolley" })).toBeVisible();

  await page.getByRole("button", { name: "Contact Us" }).click();

  await page.getByLabel("Your name *").fill(buyerName);
  await page.getByLabel("WhatsApp number *").fill("9876543210");

  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByText("Enquiry sent")).toBeVisible();

  // Admin journey
  await page.goto("/admin");

  await page.getByLabel("Email").fill("admin@catalogue.test");
  await page.getByLabel("Password").fill("Admin#2026");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin/);

  await page.getByRole("link", { name: "Leads" }).click();

  await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();

  const search = page.getByPlaceholder("Search buyer, reference or contact");
  await search.fill(buyerName);

  const leadRow = page.getByRole("row").filter({ hasText: buyerName });

  await expect(leadRow).toContainText("Premium corporate essentials");
  await expect(leadRow).toContainText("20 units");
  await expect(leadRow).toContainText("New");
});
