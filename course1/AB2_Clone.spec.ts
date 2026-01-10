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
    
    
    
    // Step: Wait for Clone Deal modal to appear
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
    await expect(page.getByText('Clone Deal', { exact: true })).toBeVisible();

    /**
 * 1️⃣ Select deal to clone (React-Select inside modal)
 */
await dialog.locator('#react-select-2-input').fill('test');
// Wait for options to appear and click the first match
await dialog.locator('#react-select-2-option-1').click();

/**
 * 2️⃣ Fill Deal Name
 */
await dialog.getByPlaceholder('Deal Name').fill('clone testing');

/**
 * 3️⃣ Fill Job Number
 */
const jobNumber = '145';
await dialog.getByPlaceholder('Job Number').fill(jobNumber);

/**
 * 4️⃣ Pick Target Filing Date
 */
await dialog.locator('#targetFilingDate').click();
// Pick first available date (stable)
await page.getByRole('option').first().click();

/**
 * 5️⃣ Confirm the clone
 */
await dialog.getByRole('button', { name: /Yes/i }).click();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});

