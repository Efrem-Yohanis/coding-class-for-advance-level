import { test, expect } from '@playwright/test';
import { loginToAB2 } from '../../utils/login';
import { deleteDealIfExists } from '../../utils/dealActions';
import path from 'path';
import fs from 'fs';

// Load test data from JSON
const testDataPath = path.resolve(__dirname, '..', '..', 'config', 'test-data.json');
const rawData = fs.readFileSync(testDataPath, 'utf-8');
const testData = JSON.parse(rawData);

// Use the key for this specific test
const dealData = testData['415047'];

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  
  // --- 1. LOGIN ---
  await loginToAB2(page);

  // --- 2. Navigate to ABS-EE HOME & select company ---
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption({ label: dealData.companyName });

  // --- 3. FIND DEAL IN TABLE & VIEW ---
  const rowRegex = new RegExp(dealData.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

// ---------- 4. SEC → Submission Information ----------
await page.getByRole('link', { name: /^SEC$/i }).click();

// Choose context: either the SEC iframe (if present) or the main page
let ctx:
  | import('@playwright/test').Page
  | import('@playwright/test').FrameLocator = page;

// Try common iframe selectors; if content is visible in it, use that frame
const secFrameLocator = page.frameLocator(
  'iframe[title*="SEC" i], iframe[src*="submission" i], iframe[src*="sec" i]'
);

// If the frame exists and contains the header text, switch context
const secHeaderInFrameVisible = await secFrameLocator
  .getByText(/Submission Information/i)
  .first()
  .isVisible()
  .catch(() => false);

if (secHeaderInFrameVisible) {
  ctx = secFrameLocator;
}

// Wait for the section header to be visible in the chosen context
await expect(
  ctx.getByText(/Submission Information/i)
).toBeVisible({ timeout: 30_000 });

// ---------- Helper: input by label's sibling ----------
const inputByLabel = (labelText: string) =>
  // find the <label> with text and then its immediate input sibling
  ctx.locator('label.form-label', { hasText: labelText })
     .locator('xpath=following-sibling::input[1]');

// ---------- Filer Information ----------
await inputByLabel('Filer CIK').fill(String(dealData.filerCIK));
await inputByLabel('Filer CCC').fill(String(dealData.filerCCC));
await inputByLabel('ABS-EE File Number').fill(String(dealData.absEeFileNumber));

// ---------- Entity CIKs ----------
await inputByLabel('Depositor CIK').fill(String(dealData.depositorCIK));
await inputByLabel('Sponsor CIK').fill(String(dealData.sponsorCIK));

// ---------- Asset Class (react-select) ----------
const assetClassInput = ctx
  .locator('[class*="css-yk16xz-control"], [class*="select__control"]')
  .locator('input[id$="-input"]')
  .first();

await expect(assetClassInput).toBeVisible({ timeout: 10_000 });
await assetClassInput.click();
await assetClassInput.fill(String(dealData.assetClass));
await assetClassInput.press('Enter');

// ---------- ABS-EE Period Dates (react-datepicker) ----------
const startPeriodInput = ctx
  .locator('label.form-label', { hasText: 'ABS-EE Start Period' })
  .locator('xpath=following::div[contains(@class,"react-datepicker__input-container")][1]/input[1]');
await expect(startPeriodInput).toBeVisible();
await startPeriodInput.fill(String(dealData.absPeriodStart));

const endPeriodInput = ctx
  .locator('label.form-label', { hasText: 'ABS-EE End Period' })
  .locator('xpath=following::div[contains(@class,"react-datepicker__input-container")][1]/input[1]');
await expect(endPeriodInput).toBeVisible();
await endPeriodInput.fill(String(dealData.absPeriodEnd));

// ---------- Notification Email (first slot) ----------
const emailInput = ctx
  .locator('label.form-label', { hasText: 'Email Address' })
  .first()
  .locator('xpath=following-sibling::input[1]');
await expect(emailInput).toBeVisible();
await emailInput.fill(String(dealData.notificationEmail));

// ---------- Save & Assertions ----------
await ctx.getByRole('button', { name: /^Save$/i }).click();
await expect(ctx.getByText(/Saved successfully/i)).toBeVisible({ timeout: 20_000 });
await expect(ctx.getByText(/^Success$/i)).toBeVisible({ timeout: 20_000 });
});

