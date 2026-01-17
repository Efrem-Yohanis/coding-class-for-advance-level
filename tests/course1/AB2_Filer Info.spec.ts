import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal Creation and Data Upload', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Shared Steps 1.1 – 1.4: Login into AB2 site
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

test('413535: Verify Filer Info can be entered and saved successfully', async ({ page }) => {
  // Step 2: Go to newly uploaded 13F deal and click View
  await page.getByRole('link', { name: 'View' }).click();

  // Step 4: Go to Filer Info
  await page.getByRole('link', { name: 'Filer Info' }).click();

  // Step 5: Enter Filer Info data
  await page.getByRole('spinbutton', { name: 'Filer CIK*' }).fill('0000123456');
  await page.getByRole('textbox', { name: 'Filer CCC*' }).fill('abc123');

  await page.locator('#period').nth(1).click();

  await page.getByRole('textbox', { name: 'Name*' }).fill('Test Filer Name');
  await page.getByRole('textbox', { name: 'Phone Number*' }).fill('2025551234');

  await page.locator('#emailAddr1').fill('test@dfinsolutions.com');
  await page.locator('#emailAddr2').fill('biniyam.a.gebeyehu@dfinsolutions.com');

  // Step 6: Press Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Verification: Success message
  await expect(page.getByText('Saved successfully')).toBeVisible();
  await expect(page.getByText('Success', { exact: true })).toBeVisible();
});

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
