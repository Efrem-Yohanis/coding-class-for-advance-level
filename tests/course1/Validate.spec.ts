import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('Validation Results & Download PDF – 13F Deal', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Shared Steps (413501)
    await loginToAB2(page);
  });

  test('TC-413519: Validation Results and Download PDF buttons are enabled', async () => {

    /**
     * Step 2–3: Go to newly uploaded 13F deal and click View
     */
    const dealRow = page.getByRole('row', { name: /01-02-2026/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Click Validate
     * Expected: Validation starts
     */
    const validateBtn = page.getByRole('button', { name: 'Validate' });
    await expect(validateBtn).toBeEnabled();
    await validateBtn.click();

    /**
     * Step 5: Validation completed message appears
     */
    await expect(
      page.getByText(/Validation completed/i)
    ).toBeVisible();

    /**
     * Step 6: Validation Date is populated
     */
    const validationDate = page
      .getByText('Validation Date:')
      .locator('..');

    await expect(validationDate).toContainText(',');

    /**
     * Step 7: Filename is populated
     */
    const fileName = page
      .getByText('Filename:')
      .locator('..');

    await expect(fileName).not.toBeEmpty();

    /**
     * Step 8: Validation Results → Download PDF
     * Expected: Table records generated
     */
    const validationResultsBtn = page.getByRole('button', {
      name: 'Validation Results'
    });
    await expect(validationResultsBtn).toBeEnabled();
    await validationResultsBtn.click();

    await expect(
      page.getByText(/File convert completed/i)
    ).toBeVisible();

    /**
     * Step 9: Number of Errors displayed
     */
    const numberOfErrors = page
      .getByText('Number of Errors:')
      .locator('..');

    await expect(numberOfErrors).toContainText(/\d+/);

    /**
     * Step 10: Number of Warnings displayed
     */
    const numberOfWarnings = page
      .getByText('Number of Warnings:')
      .locator('..');

    await expect(numberOfWarnings).toContainText(/\d+/);

    /**
     * Step 8 (continued): Download PDF enabled & successful
     */
    const downloadPromise = page.waitForEvent('download');
    const downloadPdfBtn = page.getByRole('button', {
      name: 'Download PDF'
    });

    await expect(downloadPdfBtn).toBeEnabled();
    await downloadPdfBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
