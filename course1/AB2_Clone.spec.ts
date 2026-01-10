import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal Management', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    /**
     * Step 1 (Shared Steps 413501): Login into AB2 site
     */
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 415091: Ensure that able to clone a 13F deal successfully', async () => {

    /**
     * Step 2: Use default Calendar
     * Expected: Calendar auto-picked
     */
    await page.getByText('Calendar').click();
    await page.locator('#selectedQuarter').selectOption('2026 Q1');

    const selectedQuarter = await page.locator('#selectedQuarter').inputValue();
    expect(selectedQuarter).toBeTruthy();

    /**
     * Step 3: Click "Create New Deal"
     */
    await page.getByRole('button', { name: 'Create New Deal' }).click();

    /**
     * Step 4: Click "Clone"
     */
    await page.getByRole('button', { name: 'Clone' }).click();
    await expect(page.getByText('Clone Deal', { exact: true })).toBeVisible();

    /**
     * ✅ Step 5: Select deal to clone (FIXED)
     * Manual: Pick deal from list
     * Recorder-based implementation
     */
    await page.getByText('Deals').click();

    const dealSearchInput = page.locator('[id^="react-select"][id$="-input"]');
    await expect(dealSearchInput).toBeVisible();

    await dealSearchInput.fill('test');
    await page.getByText('Deal name testing', { exact: true }).click();

    /**
     * Step 6: Enter Deal Name
     */
    await page
      .getByRole('textbox', { name: 'Deal Name' })
      .fill('Clone 01052026 testing');

    /**
     * Step 7: Enter Job Number
     */
    await page
      .getByRole('textbox', { name: 'Job Number' })
      .fill('145');

    /**
     * Step 8: Select Target Filing Date
     * Expected: Date auto-populated
     */
    await page.getByRole('dialog').locator('#targetFilingDate').click();
    await page
      .getByRole('option', { name: /choose .* january/i })
      .click();

    const targetFilingDateValue = await page
      .locator('#targetFilingDate')
      .inputValue();

    expect(targetFilingDateValue).toBeTruthy();

    /**
     * Step 9: Confirm cloning
     */
    await page.getByRole('button', { name: 'Yes' }).click();

    /**
     * Step 10: Search newly cloned deal
     */
    await page
      .getByRole('textbox', { name: 'Enter Job Number...' })
      .fill('145');

    /**
     * Final Verification
     */
    const resultRow = page.getByRole('row', { name: /145/ });
    await expect(resultRow).toBeVisible();
    await expect(resultRow).toContainText('Clone 01052026 testing');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
