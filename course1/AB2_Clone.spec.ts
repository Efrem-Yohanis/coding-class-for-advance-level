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
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});

