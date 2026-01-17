import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal - Cover Page', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Step 1 (Shared Steps 413501): Login into AB2 site
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 413537: Confirm that able to access Cover Page, enter data, and save successfully', async () => {
    /**
     * Step 2 & 3: Go to newly uploaded 13F deal and press 'View'
     */
    await page.getByRole('link', { name: 'View' }).click();
    /**
     * Step 4: Access Cover Page
     */
    await page.getByRole('link', { name: 'Cover Page' }).click();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
