import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('Submission Proof 13F Deal', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Shared Steps (413501)
    await loginToAB2(page);
  });

  test('Create, View, Download, Convert & Download PDF submission proof', async () => {

    /**
     * Step 2–3: Open newly uploaded 13F deal
     */
    const dealRow = page.getByRole('row', { name: /01-02-2026/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Submission Proof → Create
     */
    await page.getByText('Submission Proof').click();
    await page.getByRole('button', { name: 'Create' }).click();

    /**
     * Step 4 Expected: compiling started
     */
    await expect(
      page.getByText('Submission file compiling started')
    ).toBeVisible();

    /**
     * Step 5 Expected: success message
     */
    await expect(
      page.getByText(/CompletedSuccessfully/i)
    ).toBeVisible();

    /**
     * Step 6–7: File name & created date generated
     */
    const fileName = page.locator('text=File Name:').locator('..');
    const createdDate = page.locator('text=Created Date:').locator('..');

    await expect(fileName).toContainText('.html');
    await expect(createdDate).toContainText(',');

    /**
     * TC 413528 – View button enabled & opens new tab
     */
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: 'View' }).click()
    ]);
    await expect(newTab).toHaveURL(/html/i);
    await newTab.close();

    /**
     * TC 413530 – Download HTML
     */
    const htmlDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const htmlDownload = await htmlDownloadPromise;
    expect(htmlDownload.suggestedFilename()).toMatch(/\.html$/);

    /**
     * TC 413531 – Convert to PDF
     */
    await page.getByRole('button', { name: 'Convert to PDF' }).click();

    await expect(
      page.getByText('File convert completed')
    ).toBeVisible();

    /**
     * TC 413533 – Download PDF
     */
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
