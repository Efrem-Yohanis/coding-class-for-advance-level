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

test('413560: Verify Info Table data entry and save successfully', async ({ page }) => {
  
  await page
    .getByRole('row', { name: '01022026 01022026 01-02-2026' }).getByRole('link').click();

  /**
   * Step 4: Go to "Info Table"
   */
  await page.getByRole('link', { name: 'Info table' }).click();

  /**
   * Step 5: Enter input data into Info Table
   */

  // Row Number
  await page.getByRole('cell', { name: '20', exact: true }).getByRole('textbox').fill('2044');

  // Name of Issuer
  await page.getByRole('cell', { name: 'ALVOTECH' }).getByRole('textbox').fill('ALVOTECH test');

  // Title of Class
  await page.getByRole('cell', { name: 'ORDINARY SHARES' }).getByRole('textbox').fill('ORDINARY SHAREStest');

  // CUSIP
  await page.getByRole('cell', { name: 'L01800108' }).getByRole('textbox').fill('L01800109');

  // FIGI (click only – value not editable in UI)
  await page.getByRole('columnheader', { name: 'FIGI' }).click();

  // Value (in dollars)*
  await page
    .getByRole('cell', { name: '11355858' })
    .getByRole('textbox')
    .fill('11355854');

  // SHRS or PRN AMT
  await page.getByRole('textbox').nth(1).fill('1174439');

  // SH / PR
  await page.getByText('SH', { exact: true }).first().click();

  // Put / Call
  // ⚠ Manual step exists but UI has no editable value in current automation

  // Investment Discretion
  await page.getByRole('row', { name: /ALVOTECH/ }).getByRole('combobox').selectOption('DFND');

  // Other Manager
  await page.getByRole('cell', { name: 'Select...' }).first().click();

  // Voting Authority – Sole
  await page.getByRole('textbox').nth(2).fill('1174331');

  // Voting Authority – Shared
  await page.getByText('0', { exact: true }).first().click();
  await page.getByRole('textbox').nth(2).fill('0');

  // Voting Authority – None
  // ❌ MISSED: Manual test step mentions this field,
  // but no locator/value is present in current UI recording.

  /**
   * Save Info Table
   */
  await page.getByRole('button', { name: 'Save' }).first().click();

  // Verification
  await expect(page.getByText('Success', { exact: true })).toBeVisible();
  await expect(page.getByText('Saved successfully')).toBeVisible();

  /**
   * Step 6: Filter Rows → Delete
   * ❌ MISSED
   * Reason: No locator available in current recording
   */

  /**
   * Step 7: Filter Rows → Add New Row
   * ❌ MISSED
   * Reason: No locator available in current recording
   */
});

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
