import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('ID 413544 – Signature Page', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Step 1 (Shared Steps)
    await loginToAB2(page);
  });

  test('Able to access Signature, enter data, and save successfully', async () => {

    /**
     * Step 2–3: Open newly uploaded 13F deal
     */
    const dealRow = page.getByRole('row', { name: /01-02-2026/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Go to Signature
     */
    await page.getByRole('link', { name: 'Signature' }).click();
    await expect(
      page.getByRole('heading', { name: /Person Signing this Report/i })
    ).toBeVisible();

    /**
     * Step 5: Enter Signature information
     */

    // Person Signing this Report
    await page.getByRole('textbox', { name: 'Name*' })
      .fill('Zachary Klensch');

    await page.getByRole('textbox', { name: 'Title*' })
      .fill('Chief Financial Officer');

    await page.getByRole('textbox', { name: 'Phone*' })
      .fill('412-851-7898');

    // Signature, Place and Date
    await page.getByRole('textbox', { name: 'Signature*' })
      .fill('Zachary Klensch');

    await page.getByRole('textbox', { name: 'City*' })
      .fill('Pittsburgh');

    await page.getByLabel('State*')
      .selectOption('OK');

    // Date picker
    await page.getByLabel('Date*').click();
    await page.getByRole('option', { name: /Choose .* May/i }).click();

    // ✅ Assertion: Date auto-populated
    const dateValue = await page.getByLabel('Date*').inputValue();
    expect(dateValue).toBeTruthy();

    /**
     * Save
     */
    await page.getByRole('button', { name: 'Save' }).click();

    /**
     * Final Assertion
     */
    await expect(
      page.getByText('Saved successfully')
    ).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
