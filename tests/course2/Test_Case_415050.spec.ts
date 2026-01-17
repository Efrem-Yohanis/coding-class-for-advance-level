const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// Verify Submit Files opens Final Confirmation and shows files
test.setTimeout(120_000);

test('415050 - Submit Files opens Final Confirmation', async ({ page }) => {
  const data = testData['415050'] || {};
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || '99 submission proof to be';
  const rowRegex = new RegExp(`${jobNumber} ${dealName}`);
  const filenames = data.files || ['lease24babsee.htm', 'lease24bex102.xml'];

  // ---------- LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@local');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // MFA handling
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    await page.waitForTimeout(20000);
  }

  // Stay signed in
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- Open deal and go to Submission Details ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  await page.getByRole('link', { name: 'Submit Filing' }).click();
  await expect(page.getByRole('heading', { name: 'Submission Details' })).toBeVisible({ timeout: 30_000 });

  // Click Submit Files and assert Final Confirmation
  const submitFiles = page.getByRole('link', { name: 'Submit Files' });
  await expect(submitFiles).toBeVisible();
  await expect(submitFiles).toBeEnabled();
  await submitFiles.click();

  await expect(page.getByRole('heading', { name: 'Final Confirmation' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Files to Submit|Confirm/i)).toBeVisible();

  // Assert at least one expected filename appears
  const filenameRegex = new RegExp(filenames.map(f => f.replace(/\./g, '\\.') ).join('|'), 'i');
  await expect(page.getByRole('cell', { name: filenameRegex })).toBeVisible();
});


