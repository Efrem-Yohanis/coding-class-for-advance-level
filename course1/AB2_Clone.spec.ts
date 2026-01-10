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
     * Step 5: Select deal to clone (React-Select dynamic dropdown)
     */
    await page.getByText('Deals').click();
    await page.locator('#react-select-2-input').fill('test');
    //await page.getByRole('option', { name: /test/i }).click();
    await page.locator('#react-select-2-option-1').click();
    /**
     * Step 6–9: Fill clone form (inside dialog)
     */
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Deal Name
    await dialog.getByRole('textbox', { name: /Deal Name/i })
      .fill('clone testing');

    // Job Number (single source of truth)
    const jobNumber = '145';

    await dialog.getByRole('textbox', { name: /Job Number/i })
      .fill(jobNumber);

    // Target Filing Date
    await dialog.locator('#targetFilingDate').click();

    // Select first available date (stable)
    await page.getByRole('option').first().click();

    // Confirm clone
    await dialog.getByRole('button', { name: /Yes/i }).click();

    /**
     * Step 10: Search newly cloned deal
     */
    await page
      .getByRole('textbox', { name: /Enter Job Number/i })
      .fill(jobNumber);

    /**
     * Final Verification
     */
    const resultRow = page.getByRole('row', { name: new RegExp(jobNumber) });

    await expect(resultRow).toBeVisible();
    await expect(resultRow).toContainText('clone testing');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});

