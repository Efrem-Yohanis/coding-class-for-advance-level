import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('Live Filing Transmission – 13F Deal', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Shared Steps (413501)
    await loginToAB2(page);
  });

  test('TC-414952: Ensure live filing transmission is successful', async () => {

    /**
     * Step 2–3: Open newly created & uploaded 13F deal
     */
    const dealRow = page.getByRole('row', { name: /live filing 01-06-2026/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Ingest deal
     */
    await page.getByRole('button', { name: 'Ingest' }).click();

    await expect(
      page.getByText(/Ingest completed/i)
    ).toBeVisible();

    /**
     * Step 5: Validate deal
     */
    await page.getByRole('button', { name: 'Validate' }).click();

    await expect(
      page.getByText(/Validation completed/i)
    ).toBeVisible();

    /**
     * Step 6: Submission Proof → Create
     */
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
      page.getByText(/Submission file compiling/i)
    ).toBeVisible();

    await expect(
      page.getByText(/CompletedSuccessfully/i)
    ).toBeVisible();

    /**
     * Step 7: Authenticate token (Filer Info → Active)
     */
    await page.getByRole('link', { name: 'Filer Info' }).click();

    await expect(
      page.getByText('Active')
    ).toBeVisible();

    await page.getByRole('link', { name: 'Back to Deal' }).click();

    /**
     * Step 8–9: Submit Filing → Submit Files
     */
    await page.getByRole('link', { name: 'Submit Filing' }).click();
    await page.getByRole('link', { name: /Submit Files/i }).click();

    /**
     * Step 10: Transmit Test Filing
     */
    await page.getByRole('button', { name: 'Transmit Test Filing' }).click();

    await expect(
      page.getByText(/SiFi filing completed successfully/i)
    ).toBeVisible();

    /**
     * Step 11: Transmit Live Filing (confirmation popup)
     */
    await page.getByRole('button', { name: 'Transmit Live Filing' }).click();

    await expect(
      page.getByText(/You are about to submit a LIVE filing/i)
    ).toBeVisible();

    /**
     * Step 12: Confirm Live Filing
     */
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(
      page.getByText(/SiFi filing completed successfully/i)
    ).toBeVisible();

    /**
     * Step 13: Verify Accession Number format
     */
    const accessionNumberField = page
      .locator('div')
      .filter({ hasText: /^Accession Number$/ })
      .locator('..');

    await expect(accessionNumberField).toContainText(
      /\d{10}-\d{2}-\d{6}/
    );
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
