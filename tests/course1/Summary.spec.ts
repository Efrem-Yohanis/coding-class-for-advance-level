import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('Summary – 13F Deal', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Shared Steps (413501)
    await loginToAB2(page);
  });

  test('TC-413547: Access Summary, enter data, add & delete manager successfully', async () => {

    /**
     * Step 2–3: Open newly uploaded 13F deal
     */
    const dealRow = page.getByRole('row', { name: /01-02-2026/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Go to Summary
     */
    await page.getByRole('link', { name: 'Summary' }).click();
    await expect(
      page.getByRole('heading', { name: /Summary/i })
    ).toBeVisible();

    /**
     * Step 5: Enter Summary input data
     */
    await page
      .getByRole('textbox', { name: /Number of Other Included/i })
      .fill('4');

    await page
      .getByRole('textbox', { name: /Entry Total/i })
      .fill('48');

    await page
      .getByRole('textbox', { name: /Values Totals/i })
      .fill('6900259200');

    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion (missing in recorder)
    await expect(page.getByText('Saved successfully')).toBeVisible();

    /**
     * Step 6: Confidential information checkbox
     */
    const confidentialCheckbox = page.getByRole('checkbox', {
      name: /Confidential information has been omitted/i
    });

    await confidentialCheckbox.check();

    // ✅ Assertion
    await expect(confidentialCheckbox).toBeChecked();

    /**
     * Step 7: Add new manager
     */
    await page.getByRole('button', { name: 'Add new manager' }).click();

    const newManagerRow = page.getByRole('row', { name: /Delete/i });

    await newManagerRow.getByRole('textbox').nth(0).fill('11');          // No.
    await newManagerRow.getByRole('textbox').nth(1).fill('Test Manager'); // Name
    await newManagerRow.getByRole('textbox').nth(2).fill('55555557');     // CRD No.
    await newManagerRow.getByRole('textbox').nth(3).fill('001-2');        // SEC File No.
    await newManagerRow.getByRole('textbox').nth(4).fill('TEST-FILE');    // File Number

    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion
    await expect(page.getByText('Saved successfully')).toBeVisible();

    /**
     * Step 8: Delete manager
     */
    const rowCountBefore = await page.getByRole('row').count();

    await newManagerRow.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion
    await expect(page.getByText('Saved successfully')).toBeVisible();

    const rowCountAfter = await page.getByRole('row').count();
    expect(rowCountAfter).toBeLessThan(rowCountBefore);
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
