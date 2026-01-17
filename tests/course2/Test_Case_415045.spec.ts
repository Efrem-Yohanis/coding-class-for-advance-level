const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// Verify Convert to PDF flow completes successfully
test.setTimeout(180_000);

test('415045 - Convert to PDF triggers completion', async ({ page }) => {
  const data = testData['415045'] || {};
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || '99 submission proof to be';
  const periodEnd = data.periodEnd || '09-30-2024';
  const rowRegex = new RegExp(`${jobNumber} ${dealName} ${periodEnd}`);

  // ---------- 1. LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@local');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    console.log('Approve the MFA request on your mobile device...');
    await page.waitForTimeout(20000);
  }

  // Handle "Stay signed in?"
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- 2. Open deal and create Submission Proof (No flow) ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  await page.getByText('Submission Proof').click();
  const createBtn = page.getByRole('button', { name: 'Create' });
  if (await createBtn.isVisible({ timeout: 5000 })) {
    await createBtn.click();
    await expect(page.getByText(/Do you want to include the contents of the EX-102 file/i)).toBeVisible();
    await page.getByRole('button', { name: 'No' }).click();
  }

  // Wait for Submission Proof to complete
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  // ---------- 3. Convert to PDF and assert completion ----------
  const convertBtn = page.getByRole('button', { name: 'Convert to PDF' });
  await expect(convertBtn).toBeEnabled({ timeout: 30_000 });
  await convertBtn.click();

  // Wait for PDF conversion to finish
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/Pdf Convert completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });
});


