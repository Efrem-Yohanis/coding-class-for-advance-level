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

  test('413504: Verify that able to create and upload 13F deal successfully', async () => {
    // Step 2: Navigate to 13F Deal Home
    await page.goto('https://13f-qa.azurewebsites.net/deals');
    await page.locator('#menu-toggle').click();
    await page.getByRole('button', { name: '13F Deal Home' }).click();

    // Step 4: Press "Create New Deal"
    await page.getByRole('button', { name: 'Create New Deal' }).click();

    // Step 5: Fill Filing Details
    await page.getByRole('textbox', { name: 'Job Number', exact: true }).fill('122');
    await page.getByRole('textbox', { name: 'Deal Name*' }).fill('TESTING 0105206');

    // Step 3: Select Target Filing Date (Calendar)
    await page.getByRole('textbox', { name: 'Target Filing Date*' }).click();
    await page.getByRole('option', { name: 'Choose Monday, January 5th,' }).click();

    // Step 6: Press "Create"
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Step Expected: Deal appears in 13F home deal list
    await page.getByRole('textbox', { name: 'Enter Job Number...' }).fill('122');

    const dealRow = page.getByRole('row', {
      name: '122 TESTING 0105206 01-05-',
    });
    await expect(dealRow).toBeVisible();

    // Step 7 & 8: View newly created deal
    await dealRow.getByRole('link').click();

    // Step 9: Upload 13F Excel file
    await page.getByRole('button', { name: 'Upload' }).click();
    await page
      .getByRole('button', { name: 'Upload' })
      .setInputFiles('UBS 13F Test(1500) (1).xlsx');

    // Verification: Upload success
    await expect(page.getByText('File upload completed')).toBeVisible({
      timeout: 30000,
    });
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
