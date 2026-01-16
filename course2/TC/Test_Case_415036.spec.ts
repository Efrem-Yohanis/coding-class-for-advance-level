const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

// Increase timeout to accommodate creation + upload + processing
test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  const data = testData['415036'];
  const rowRegex = new RegExp(`${data.jobNumber} ${data.dealName} ${data.periodEnd}`);

  // ---------- 1. LOGIN (mandatory) ----------
  await page.goto('url');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    console.log('Action Required: Approve the notification on your mobile device...');
    await page.waitForTimeout(20000);
  }

  // Handle "Stay Signed In" prompt
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- 2. Create New Deal ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(data.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(data.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(data.periodEnd);
  if (data.schemaOption) {
    await page.getByLabel('ABS Schema Type*').selectOption(String(data.schemaOption));
  }
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // Verify deal appears in table
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });

  // ---------- 3. Open deal & Upload ----------
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view/i }).click();
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS|Files/i })).toBeVisible();

  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();

  // Use configured upload path (ensure file exists in CI or local before running)
  await uploadButton.setInputFiles(data.uploadFilePath);

  // Wait for processing to complete
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 180_000 });

  // Optionally assert uploaded file shows up in the UI
  await expect(page.getByText(/File upload queue|Uploaded/i)).toBeVisible({ timeout: 30_000 });
});

-------------------------------------------------------------------
const { test, expect } = require('@playwright/test');

test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal (Hard-coded)', async ({ page }) => {
  
  // --- HARD-CODED INPUT DATA ---
  const JOB_NUMBER = 'JOB-12345';
  const DEAL_NAME = 'Automation_Test_Deal_001';
  const PERIOD_END = '2023-12-31';
  const SCHEMA_TYPE = 'Industrial'; // Replace with your actual dropdown option text
  const FILE_PATH = './test-files/sample_absee.zip'; // Ensure this file exists locally
  
  // Regex to find the row in the table later
  const rowRegex = new RegExp(`${JOB_NUMBER}.*${DEAL_NAME}`);

  // ---------- 1. LOGIN ----------
  await page.goto('https://your-app-url.com'); // REPLCE WITH ACTUAL URL
  
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('your-email@dfin.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill('YourPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA (Manual Intervention Pause)
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    console.log('>>> Please approve MFA on your phone now...');
    // Wait for the dashboard to load as proof MFA passed
    await page.waitForURL('**/dashboard**', { timeout: 60000 });
  }

  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- 2. ABS-EE HOME & COMPANY SELECTION ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Selecting "Automation" from Company Dropdown (Manual Step 4)
  await page.getByLabel(/Company/i).click();
  await page.getByRole('option', { name: 'Automation' }).click();

  // ---------- 3. CREATE NEW DEAL ----------
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(JOB_NUMBER);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(DEAL_NAME);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(PERIOD_END);
  
  // Selecting the Schema Type dropdown
  await page.getByLabel('ABS Schema Type*').selectOption({ label: SCHEMA_TYPE });
  
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // ---------- 4. FIND DEAL IN TABLE & VIEW ----------
  // We look for the row containing our hard-coded Job Number and Deal Name
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30_000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // ---------- 5. UPLOAD FILE ----------
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS/i })).toBeVisible();

  // Triggering the file picker
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Upload' }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(FILE_PATH);

  // ---------- 6. VERIFY STATUS ----------
  // We check for the completion text. 
  // If the UI doesn't auto-refresh, you might need to add: await page.reload();
  const statusLocator = page.getByText(/CompletedSuccessfully/i);
  await expect(statusLocator).toBeVisible({ timeout: 120_000 });
  
  console.log('Test Completed Successfully!');
});




===============================================
  import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://13f-qa.azurewebsites.net/abs-deals');
  await page.getByRole('button', { name: 'Companies' }).click();
  await page.getByRole('button', { name: 'Create New Company' }).click();
  await page.getByRole('textbox', { name: 'Name*' }).click();
  await page.getByRole('textbox', { name: 'Name*' }).fill('xxxx');
  await page.getByRole('textbox', { name: 'PGP Key Name' }).click();
  await page.getByRole('textbox', { name: 'PGP Key Name' }).fill('xxx');
  await page.getByRole('textbox', { name: 'Link to Notes' }).click();
  await page.getByRole('textbox', { name: 'Link to Notes' }).fill('x');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByText('Filings Details').click();
  await page.getByRole('textbox', { name: 'Job Number' }).click();
  await page.getByText('Deal Name*').click();
  await page.locator('div').filter({ hasText: /^Deal Name\*$/ }).click();
  await page.getByText('Period End Date*').click();
  await page.getByRole('textbox', { name: 'Period End Date*' }).click();
  await page.getByText('Target Filing Date*').click();
  await page.getByText('Filing Type*ABS-EEABS-EE/A10-').click();
  await page.getByText('ABS Schema Type*').click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
});
