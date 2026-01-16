const { test, expect } = require('@playwright/test');
  const path = require('path'); // Add this at the top of your file

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

  const FILE_PATH = path.join(__dirname, 'Resource', 'Aurora Lease 1November2025_1120_AutoLease.zip');


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
===================================================================


  const FILE_PATH = './Resource/Aurora Lease 1November2025_1120_AutoLease.zip'; // Ensure this file exists locally



====================================
  Codegen

  import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('row', { name: '777 45456 01-12-2026 01-12-' }).getByRole('link').click();
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByRole('button', { name: 'Upload' }).setInputFiles(['blast231absee_0311-1458.htm', 'blast231ex102.xml', 'blast231ex103.xml', 'd209919d10d.htm', 'd209919dex991.htm']);
  await page.getByText('File upload queue').click();
  await page.getByText('File upload queue').click();
  await page.locator('div').filter({ hasText: 'File upload queue' }).nth(3).click();
  await expect(page.locator('#page-content-wrapper')).toContainText('File Name');
  await page.getByText('d209919d10d.htm').click();
  await page.getByRole('columnheader', { name: 'Form Type' }).click();
  await page.getByRole('columnheader', { name: 'Form Type' }).click();
  await page.getByRole('columnheader', { name: 'Form Type' }).click();
  await expect(page.locator('#page-content-wrapper')).toContainText('10-D');
  await expect(page.locator('#page-content-wrapper')).toContainText('Execution Status');
  await expect(page.locator('#page-content-wrapper')).toContainText('CompletedSuccessfully : Finished Upload ABSEE');
});


====================================================================

  const path = require('path'); // Add this at the top of your file

// --- 1. SET THE PATH ---
// __dirname is the folder where your test file lives.
// This joins that folder with the 'Resource' subfolder and the zip file name.
const FILE_PATH = path.join(__dirname, 'Resource', 'Aurora Lease 1November2025_1120_AutoLease.zip');

// --- 5. UPLOAD FILE ---
// We locate the upload button
const uploadButton = page.getByRole('button', { name: 'Upload' });

// We inject the file directly
await uploadButton.setInputFiles(FILE_PATH);

// --- 6. VERIFY STATUS ---
await page.getByText('File upload queue').click();

// Wait for the specific container to show success
const statusContainer = page.locator('#page-content-wrapper');
await expect(statusContainer).toContainText('CompletedSuccessfully', { timeout: 180000 });

VSC COPIED
========

  const { test, expect } = require('@playwright/test');
  const path = require('path'); // Add this at the top of your file
test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal (Hard-coded)', async ({ page }) => {
  // --- HARD-CODED INPUT DATA ---
  const COMPANY_NAME = 'Automation'; // The variable you wanted
  const JOB_NUMBER = 'JOB-12345';
  const DEAL_NAME = 'Automation_Test_Deal_001';
  const PERIOD_END = '2023-12-31';
  const TARGET_FILING_DATE = '2026-01-16';
  const SCHEMA_TYPE = 'Auto Loan'; // Replace with your actual dropdown option text
  const FILING_TYPE = 'ABS-EE'; // Replace with your actual dropdown option text
  const FILE_PATH = path.join(__dirname, 'Resource', 'Aurora Lease 1November2025_1120_AutoLease.zip'); // Ensure this file exists locally


  
  // Regex to find the row in the table later
  // const rowRegex = new RegExp(`${JOB_NUMBER}.*${DEAL_NAME}`);

  // ---------- 1. LOGIN ----------
  await page.goto("https://13f-qa.azurewebsites.net/"); // REPLCE WITH ACTUAL URL
  
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill("biniyam.a.gebeyehu@dfinsolutions.com");
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill("Alem123123*");
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
  
  await page.locator('#selectedCompany').selectOption({ label: COMPANY_NAME });


  // ---------- 3. CREATE NEW DEAL ----------
await page.getByRole('button', { name: 'Create New Deal' }).click();
await expect(page.getByText('Filings Details')).toBeVisible();

// Fill Text Fields
await page.getByRole('textbox', { name: 'Job Number' }).fill(JOB_NUMBER);
await page.getByRole('textbox', { name: 'Deal Name*' }).fill(DEAL_NAME);
await page.getByRole('textbox', { name: 'Period End Date*' }).fill(PERIOD_END);
await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(TARGET_FILING_DATE);

// --- Fixed Dropdowns ---
// We use the IDs from your HTML: 'type' and 'absSchema'
await page.locator('#type').selectOption({ label: FILING_TYPE });
await page.locator('#absSchema').selectOption({ label: SCHEMA_TYPE });

await page.getByRole('button', { name: 'Create', exact: true }).click();

 
  // ---------- 4. FIND DEAL IN TABLE & VIEW ----------
  // We look for the row containing our hard-coded Job Number and Deal Name
  // const dealRow = page.getByRole('row', { name: rowRegex });
  // await expect(dealRow).toBeVisible({ timeout: 30_000 });
  // await dealRow.getByRole('link', { name: /view/i }).click();

    // --- 6. VERIFICATION & NAVIGATION ---
// This creates a pattern to find your deal name anywhere in the row
const rowRegex = new RegExp(DEAL_NAME); 

// Find the row and click 'View'
const dealRow = page.getByRole('row', { name: rowRegex });
await expect(dealRow).toBeVisible();
await dealRow.getByRole('link', { name: /view/i }).click();

  // ---------- 5. UPLOAD FILE ----------
  // We locate the upload button
const uploadButton = page.getByRole('button', { name: 'Upload' });

// We inject the file directly
await uploadButton.setInputFiles(FILE_PATH);

// --- 6. VERIFY STATUS ---
await page.getByText('File upload queue').click();

// Wait for the specific container to show success
const statusContainer = page.locator('#page-content-wrapper');
await expect(statusContainer).toContainText('CompletedSuccessfully', { timeout: 180000 });
});
  
