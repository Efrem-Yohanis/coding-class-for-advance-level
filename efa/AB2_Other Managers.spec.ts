import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal Creation and Data Upload', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Shared Steps 1.1 – 1.4: Login into AB2 site
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

 test('ID 413542: Access Other Managers, add/edit/delete manager successfully', async () => {
    /**
     * Step 2 & 3: Open newly uploaded 13F deal and click View
     * NOTE: Replace regex with stable Job Number or Deal Name
     */
    const dealRow = page.getByRole('row', { name: /13F/i });
    await expect(dealRow).toBeVisible();
    await dealRow.getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Go to "Other Managers"
     */
    await page.getByRole('link', { name: 'Other Managers' }).click();

    /**
     * Step 5: Enter data for existing manager
     */
    const firstRow = page.getByRole('row').nth(1);

    await firstRow.getByRole('cell').nth(0).getByRole('textbox').fill('21'); // Row Number
    await firstRow.getByRole('cell').nth(1).getByRole('textbox').fill('44'); // Form 13F File Number
    await firstRow.getByRole('cell').nth(2).getByRole('textbox').fill('Testing'); // Name
    await firstRow.getByRole('cell').nth(3).getByRole('textbox').fill('455886897'); // CRD No
    await firstRow.getByRole('cell').nth(4).getByRole('textbox').fill('55'); // SEC File No
    await firstRow.getByRole('cell').nth(5).getByRole('textbox').fill('455'); // CIK

    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion
    await expect(page.getByText('Saved successfully')).toBeVisible();

    /**
     * Step 6: Add new manager
     */
    await page.getByRole('button', { name: 'Add new manager' }).click();

    const newRow = page.getByRole('row').last();
    await newRow.getByRole('cell').nth(0).getByRole('textbox').fill('22');
    await newRow.getByRole('cell').nth(1).getByRole('textbox').fill('66');
    await newRow.getByRole('cell').nth(2).getByRole('textbox').fill('New Manager');
    await newRow.getByRole('cell').nth(3).getByRole('textbox').fill('999999');
    await newRow.getByRole('cell').nth(4).getByRole('textbox').fill('77');
    await newRow.getByRole('cell').nth(5).getByRole('textbox').fill('888');

    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion
    await expect(page.getByText('Saved successfully')).toBeVisible();

    /**
     * Step 7: Delete manager
     */
    await newRow.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ Assertion
    await expect(page.getByText('Saved successfully')).toBeVisible();
  });


  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
