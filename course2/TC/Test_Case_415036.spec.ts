const { test, expect } = require('@playwright/test');
const path = require('path');

test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  // --- HARD-CODED INPUT DATA ---
  const COMPANY_NAME = 'Automation';
  const JOB_NUMBER = 'JOB-12345';
  const DEAL_NAME = 'Automation_Test_Deal_001';
  const PERIOD_END = '2023-12-31';
  const TARGET_FILING_DATE = '2026-01-16';
  const SCHEMA_TYPE = 'Auto Loan';
  const FILING_TYPE = 'ABS-EE';
  
  // Joins current directory + Resource folder + filename
  const FILE_PATH = path.join(__dirname, 'Resource', 'Aurora Lease 1November2025_1120_AutoLease.zip');

  // ---------- 1. LOGIN ----------
  await page.goto("https://13f-qa.azurewebsites.net/");
  
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill("biniyam.a.gebeyehu@dfinsolutions.com");
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill("Alem123123*");
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  try {
    if (await mfaOption.isVisible({ timeout: 5000 })) {
      await mfaOption.click();
      console.log('>>> Please approve MFA on your phone now...');
      // Wait for navigation to dashboard as proof MFA is done
      await page.waitForURL('**/deals**', { timeout: 60000 });
    }
  } catch (e) {
    console.log('MFA screen did not appear, proceeding...');
  }

  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- 2. ABS-EE HOME & COMPANY SELECTION ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Select Company from standard <select>
  await page.locator('#selectedCompany').selectOption({ label: COMPANY_NAME });

  // ---------- 3. CREATE NEW DEAL ----------
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(JOB_NUMBER);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(DEAL_NAME);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(PERIOD_END);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(TARGET_FILING_DATE);

  // Use IDs from your HTML for standard select elements
  await page.locator('#type').selectOption({ label: FILING_TYPE });
  await page.locator('#absSchema').selectOption({ label: SCHEMA_TYPE });

  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // ---------- 4. FIND DEAL IN TABLE & VIEW ----------
  const rowRegex = new RegExp(DEAL_NAME, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  
  // Wait for the specific row to appear in the dashboard table
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // ---------- 5. UPLOAD FILE ----------
  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();
  
  // setInputFiles handles the OS file dialog automatically
  await uploadButton.setInputFiles(FILE_PATH);

  // ---------- 6. VERIFY STATUS ----------
  await page.getByText('File upload queue').click();

  const statusContainer = page.locator('#page-content-wrapper');
  // Ensuring we see the "CompletedSuccessfully" message
  await expect(statusContainer).toContainText('CompletedSuccessfully', { timeout: 180000 });
 
});



===================
  Running 1 test using 1 worker
  1) [chromium] › tests\ABS-EE\absee-createandupload_415036.spec.ts:6:1 › 415036 - Create and upload ABSEE deal

    Error: ENOENT: no such file or directory, stat 'C:\AB2 Playwright Project\tests\ABS-EE\Resource\Aurora Lease 1November2025_1120_AutoLease.zip'

      78 |
      79 |   // setInputFiles handles the OS file dialog automatically
    > 80 |   await uploadButton.setInputFiles(FILE_PATH);
         |   ^
      81 |
      82 |   // ---------- 6. VERIFY STATUS ----------
      83 |   // await page.getByText('File upload queue').click();
        at C:\AB2 Playwright Project\tests\ABS-EE\absee-createandupload_415036.spec.ts:80:3

    Error Context: test-results\ABS-EE-absee-createanduplo-18a19-reate-and-upload-ABSEE-deal-chromium\error-context.md

  1 failed
    [chromium] › tests\ABS-EE\absee-createandupload_415036.spec.ts:6:1 › 415036 - Create and upload ABSEE deal


await page.locator('input[type="file"]').setInputFiles(FILE_PATH);
