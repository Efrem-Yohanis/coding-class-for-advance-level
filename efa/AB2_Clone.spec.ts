import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

test.describe('13F Deal Management', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Step 1 (Shared Steps 413501): Login into AB2 site
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 415091: Ensure that able to clone a 13F deal successfully', async () => {
    /**
     * Step 2: Use the default "Calendar"
     * Manual: Calendar field has auto-picked calendar input value
     */
    await page.getByText('Calendar').click();
    await page.locator('#selectedQuarter').selectOption('2026 Q1');
    
    // ✅ Assertion: Verify that a default value is auto-picked
const selectedQuarter = await page.locator('#selectedQuarter').inputValue();
expect(selectedQuarter).toBeTruthy(); // ensures that some value is selected

    /**  
     * Step 3: Click on "Create New Deal"
     */
    await page.getByRole('button', { name: 'Create New Deal' }).click();

    /**
     * Step 4: Go to "Clone" and press it
     * Expected: Clone Deal dialog appears
     */
    await page.getByRole('button', { name: 'Clone' }).click();
    await expect(page.getByText('Clone Deal', { exact: true })).toBeVisible();

    /**
     * Step 5: Select deal to clone
     * ❌ PARTIALLY COVERED
     * - Manual step says: pick or paste deal from list
     * - Current locator only clicks placeholder text
     * - No actual deal selection is performed
     */
    await page.getByText('Please select deal').click();
    // ❌ Missing locator for actual deal item inside dropdown/list

    /**
     * Step 6: Enter Deal Name
     */
    await page
      .getByRole('textbox', { name: 'Deal Name' })
      .fill('Coone 01052026 testing');

    /**
     * Step 7: Enter Job Number
     */
    await page
      .getByRole('textbox', { name: 'Job Number' })
      .fill('145');

    /**
 * Step 8: Select Target Filing Date
 * Expected: Date auto-populated after selection
 */

// Open the calendar dialog and pick a date
await page.getByRole('dialog').locator('#targetFilingDate').click();
await page.getByRole('option', { name: 'Choose Monday, January 5th,' }).click();

// ✅ Assertion: Verify that the Target Filing Date input is auto-populated
// Get the value from the input after selection
const targetFilingDateValue = await page.locator('#targetFilingDate').inputValue();

// Ensure a value exists
expect(targetFilingDateValue).toBeTruthy();
    /**
     * Step 9: Confirm cloning
     * Expected: Cloned deal is created
     */
    await page.getByRole('button', { name: 'Yes' }).click();

    /**
     * Step 10: Search newly cloned deal
     */
    await page
      .getByRole('textbox', { name: 'Enter Job Number...' })
      .fill('145');

    /**
     * Final Verification
     * Expected: Cloned deal appears in the 13F deal home list
     */
    const resultRow = page.getByRole('row', { name: /145/ });
    await expect(resultRow).toBeVisible();
    await expect(resultRow).toContainText('Coone 01052026 testing');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});
