import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal Ingest', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Step 1 (Shared Steps 413501): Login into AB2 site
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 413509: Attest that able to ingest newly uploaded 13F deal', async () => {
    /**
     * Step 2: Go to newly uploaded 13F deal
     * NOTE: Replace regex with a stable identifier (Job Number or Deal Name)
     */
    const dealRow = page.getByRole('row', { name: /01-02-2026/i });
    await expect(dealRow).toBeVisible();

    /**
     * Step 3: Click on "View"
     */
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Go to "Ingest" and press it
     */
    const ingestButton = page.getByRole('button', { name: 'Ingest' });
    await expect(ingestButton).toBeVisible();
    await ingestButton.click();

    /**
     * Step 5: Wait until ingest is completed
     * Expected: Success message "Ingest completed"
     */
    const ingestCompletedMsg = page.getByText('Ingest completed');

    await expect(ingestCompletedMsg).toBeVisible({
      timeout: 120000, // ingest may take time
    });

    /**
     * Step 6: Final assertion (explicit success verification)
     */
    await expect(ingestCompletedMsg).toHaveText('Ingest completed');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
