import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Scheduled LIVE Filing Verification', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 413620: Verify scheduled LIVE filing succeeds', async () => {

    /**
     * Step 2–3: Open newly created 13F deal
     */
    const dealRow = page.getByRole('row', { name: /live filing/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Ingest
     */
    await page.getByRole('button', { name: 'Ingest' }).click();
    await expect(page.getByText('Ingest completed')).toBeVisible({ timeout: 60000 });

    /**
     * Step 5: Validate
     */
    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.getByText('Validation completed')).toBeVisible({ timeout: 60000 });

    /**
     * Step 6: Submission proof → Create
     */
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('CompletedSuccessfully')).toBeVisible({ timeout: 60000 });

    /**
     * Step 7: Filer Info → Token Active
     */
    await page.getByRole('link', { name: 'Filer Info' }).click();
    await expect(page.getByText('Active')).toBeVisible();
    await page.getByRole('link', { name: 'Back to Deal' }).click();

    /**
     * Step 8–9: Submit Filing → Submit Files
     */
    await page.getByRole('link', { name: 'Submit Filing' }).click();
    await page.getByRole('link', { name: 'Submit Files' }).click();

    await expect(page.getByText('Create submission and download')).toBeVisible();
    await expect(page.getByText('Download current submission')).toBeVisible();
    await expect(page.getByText('Live filing')).toBeVisible();

    /**
     * Step 10–11: Schedule Filing checkbox
     */
    await page.getByRole('checkbox', { name: 'Schedule Filing' }).check();
    await expect(page.getByText('Are you sure you want to schedule')).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();

    /**
     * Step 12: Schedule Live Filing dialog
     */
    await page.getByRole('button', { name: 'Schedule Live Filing' }).click();
    await expect(page.getByRole('heading', { name: 'Schedule Live Filing' })).toBeVisible();

    /**
     * Step 13: Enter Job Number & CIK
     */
    await page.getByRole('textbox', { name: 'Job Number' }).fill('89798');
    await page.getByRole('spinbutton', { name: 'Filer CIK' }).fill('0000990461');

    const scheduleBtn = page.getByRole('button', { name: 'Schedule Live Filing' });
    await expect(scheduleBtn).toBeEnabled();

    /**
     * Step 14–15: Confirm LIVE filing
     */
    await scheduleBtn.click();
    await expect(page.getByText('WARNING! You are scheduling a LIVE filing')).toBeVisible();
    await page.getByRole('button', { name: 'Schedule LIVE Filing' }).click();

    await expect(
      page.getByText(/A LIVE filing is scheduled for/i)
    ).toBeVisible();

    /**
     * Step 17: Execution Status
     */
    await page.getByText('Execution Status').click();
    await expect(
      page.getByText(/Status:\s*Accepted/i)
    ).toBeVisible({ timeout: 120000 });

    /**
     * Step 18: Accession Number validation
     */
    const accession = page.getByText(/\d{10}-\d{2}-\d{6}/);
    await expect(accession).toBeVisible();

    /**
     * Step 19–21: Downloads
     */
    const d1 = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Create Submission and Download' }).click();
    await d1;

    const d2 = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Current Submission' }).click();
    await d2;

    const d3 = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Create Decoded Submission and Download' }).click();
    await d3;
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
