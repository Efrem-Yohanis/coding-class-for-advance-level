const { test, expect } = require('@playwright/test');

test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  // --- 1. HARD-CODED INPUT DATA ---
  const COMPANY_NAME = 'Automation'; 
  const JOB_NUMBER = 'JOB-12345';
  const DEAL_NAME = 'Automation_Test_Deal_001';
  const PERIOD_END = '2023-12-31';
  const TARGET_FILING_DATE = '2026-01-16';
  const SCHEMA_TYPE = 'Auto Loan'; 
  const FILING_TYPE = 'ABS-EE'; 
  const FILE_PATH = './test-files/sample_absee.zip'; 

  const rowRegex = new RegExp(`${JOB_NUMBER}.*${DEAL_NAME}`);

  // --- 1. NAVIGATION to website
  await page.goto('https://13f-qa.azurewebsites.net/');


  // --- 2. LOGIN FLOW ---
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle "Stay Signed In" prompt if it appears
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // --- 3. Navigate to the Deal Home
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  // --- 4. CREATE NEW DEAL ---
  await page.locator('#selectedCompany').selectOption({ label: COMPANY_NAME });
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();
  await page.getByRole('textbox', { name: 'Job Number' }).fill(JOB_NUMBER);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(DEAL_NAME);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(PERIOD_END);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(TARGET_FILING_DATE);
  await page.locator('#type').selectOption({ label: FILING_TYPE });
  await page.locator('#absSchema').selectOption({ label: SCHEMA_TYPE });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30_000 });
  await dealRow.getByRole('link', { name: /view/i }).click();


  // --- 6. VERIFICATION & NAVIGATION ---
// This creates a pattern to find your deal name anywhere in the row
const rowRegex = new RegExp(DEAL_NAME); 

// Find the row and click 'View'
const dealRow = page.getByRole('row', { name: rowRegex });
await expect(dealRow).toBeVisible();
await dealRow.getByRole('link', { name: /view/i }).click();
  
  // File Upload logic
  const fileInput = page.locator('input[type="file"]');
  // If the input is hidden, use the filechooser event:
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Upload/i }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(FILE_PATH);

  // --- 6. VERIFY COMPLETION ---
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });
  console.log('Test Completed Successfully!');
});
