const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// This test covers creating submission proof (No flow) and asserts completion
// Increase timeout for upload/processing and validation
test.setTimeout(180_000);

test('415041 - Create submission proof (No flow) completes successfully', async ({ page }) => {
  const data = testData['415041'];
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || 'Submission Proof Test Deal';
  const periodEnd = data.periodEndDate || '09-30-2024';
  const rowRegex = new RegExp(`${jobNumber} ${dealName} ${periodEnd}`);
  const uploadFiles = (data.files || []).map(f => `./test-data/${f}`); // Ensure these files exist in CI

  // ---------- 1. LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
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

  // ---------- 2. Create Deal (if needed) ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(periodEnd);
  await page.getByLabel('ABS Schema Type*').selectOption('2');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // Verify deal appears and open it
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  // ---------- 3. Upload required files ----------
  if (uploadFiles.length) {
    const uploadBtn = page.getByRole('button', { name: 'Upload' });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.setInputFiles(uploadFiles);

    // Wait for processing to complete
    await page.getByText('Execution Status').click();
    await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

    // Optionally assert uploaded files are visible
    await expect(page.getByText(/File upload queue|Uploaded/i)).toBeVisible({ timeout: 30_000 });
  }

  // ---------- 4. Perform Validation (if present) ----------
  const performBtn = page.getByRole('button', { name: 'Perform Validation' });
  if (await performBtn.isVisible()) {
    await performBtn.click();
    const okBtn = page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible({ timeout: 5_000 })) {
      await page.getByRole('radio').first().check();
      await okBtn.click();
    }

    await page.getByText('Execution Status').click();
    await expect(page.getByText(/ABS-EE Validation completed/i)).toBeVisible({ timeout: 120_000 });
  }

  // ---------- 5. Create Submission Proof (No flow) ----------
  await page.locator('span').filter({ hasText: 'Validation Results' }).click();
  await page.getByText('Submission Proof').click();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText(/Do you want to include the contents of the EX-102 file/i)).toBeVisible();
  await page.getByRole('button', { name: 'No' }).click();

  // Wait for Submission Proof to complete
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  // Optionally, test Yes flow when EX-102 is available
  // await page.getByRole('button', { name: 'Create' }).click();
  // await page.getByRole('button', { name: 'Yes' }).click();
  // await page.getByText('Execution Status').click();
  // await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
});


