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
    await page.getByRole('row', { name: /some-deal-identifier/ }).getByRole('link', { name: 'View' }).click();

    /**
     * Step 4: Access Cover Page
     */
    await page.getByRole('link', { name: 'Cover Page' }).click();

    /**
     * Step 5: Report for Calendar Year / Quarter Ended
     */
    const reportQuarter = page.getByRole('combobox', { name: /Report for the Calendar Year or Quarter Ended/i });
    await reportQuarter.selectOption('06-30'); // Select quarter
    await expect(reportQuarter).toHaveValue('06-30'); // ✅ Assertion

    const reportYear = page.getByRole('textbox', { name: /Year/i });
    await reportYear.fill('2024');
    await expect(reportYear).toHaveValue('2024'); // ✅ Assertion

    /**
     * Step 6: Check 'Check here if Amendment'
     */
    const amendmentCheckbox = page.getByRole('checkbox', { name: /Check here if Amendment/i });
    await amendmentCheckbox.check();
    await expect(amendmentCheckbox).toBeChecked();

    /**
     * Step 7: Enter Amendment Number
     */
    const amendmentNumber = page.getByRole('textbox', { name: /Amendment Number/i });
    await amendmentNumber.fill('1');
    await expect(amendmentNumber).toHaveValue('1');

    /**
     * Step 8: Check 'This filing lists securities ...' checkbox
     */
    const filingCheckbox = page.getByRole('checkbox', { name: /This filing lists securities/i });
    await filingCheckbox.check();
    await expect(filingCheckbox).toBeChecked();

    /**
     * Step 9: Date denied or confidential treatment expired
     */
    const deniedDate = page.getByRole('combobox', { name: /Date denied or on which confidential/i });
    await deniedDate.selectOption('03-31'); // example
    await expect(deniedDate).toHaveValue('03-31');

    /**
     * Step 10: Date securities holding reported on Form 13F
     */
    const holdingDate = page.getByRole('combobox', { name: /Date securities holding reported on the Form 13F/i });
    await holdingDate.selectOption('06-30');
    await expect(holdingDate).toHaveValue('06-30');

    /**
     * Step 11: Institutional Investment Manager Filing this Report
     */
    await page.locator('#imName').fill('DONNELLEY FINANCIAL SOLUTIONS 1 /TA test');
    await page.locator('#imAddress1').fill('391 STEEL WAY testtt');
    await page.locator('#imAddress2').fill('eeee');
    await page.getByRole('textbox', { name: 'City*' }).fill('LANCASTEReeeddd');
    await page.getByLabel('State*').selectOption('D0');
    await page.getByRole('textbox', { name: 'Zip/Foreign Postal Code*' }).fill('17601eeee55555');
    await page.getByRole('textbox', { name: 'CRD Number (if applicable)' }).fill('4444');
    await page.getByRole('textbox', { name: 'SEC File Number (if' }).fill('028-1311477');

    /**
     * Steps 12-14: Report Type Checkboxes
     */
    const reportTypeRadios = page.locator('input[name="reportTypeRadios"]');
    await reportTypeRadios.nth(0).check(); // 13F HOLDINGS REPORT
    await reportTypeRadios.nth(1).check(); // 13F NOTICE
    await reportTypeRadios.nth(2).check(); // 13F COMBINATION REPORT

    /**
     * Step 15: Yes/No Explanatory Information
     */
    const yesNoRadios = page.locator('input[name="yesNoRadios"]');
    await yesNoRadios.nth(0).check(); // Yes
    await yesNoRadios.nth(1).check(); // No

    /**
     * Step 16: Press 'Save'
     */
    await page.getByRole('button', { name: 'Save' }).click();

    /**
     * ✅ Verification: Saved successfully
     */
    const successMessage = page.getByText('Saved successfully');
    await expect(successMessage).toBeVisible();
    const successHeading = page.getByText('Success', { exact: true });
    await expect(successHeading).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
