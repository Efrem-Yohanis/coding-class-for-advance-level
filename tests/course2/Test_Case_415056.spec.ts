const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// Allow longer time for transmission and execution
test.setTimeout(300_000);

// Precondition: User is logged in and has access to the ABS-EE Deal Home page.
// A deal with uploaded ABSEE files exists and has completed test filing transmission.

test('415056 - Verify transmit live filing transmission is successful', async ({ page }) => {
  const data = testData['415056'];
  const rowRegex = new RegExp(`${data.jobNumber} ${data.dealName} ${data.periodEnd}`);

  // ---------- 1. LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
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

  // ---------- 2. Navigate to ABS-EE Deal Home ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  // ---------- 3. Locate and open target deal ----------
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view/i }).click();
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS|Files/i })).toBeVisible();

  // ---------- 4. Verify Active Status (if not visible, check SEC tab for token population) ----------
  const activeStatus = page.locator('text=Active');
  if (!(await activeStatus.isVisible({ timeout: 5_000 }).catch(() => false))) {
    await page.getByRole('link', { name: 'SEC' }).click();
    // Wait briefly for token/auth to populate
    await page.waitForTimeout(2_000);
    await page.getByRole('link', { name: 'Back to Deal' }).click();
  }
  await expect(page.getByText('Active')).toBeVisible();

  // Upload files if provided (ensure deal has required files)
  if (data.uploadFiles && data.uploadFiles.length) {
    const uploadBtn = page.getByRole('button', { name: 'Upload' });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.setInputFiles(data.uploadFiles);
    if (data.performValidation) {
      await page.getByRole('button', { name: 'Perform Validation' }).click();
      await expect(page.getByText(/Validation Results|CompletedSuccessfully/i)).toBeVisible({ timeout: 60_000 });
    }
  }

  // ---------- 5. Submit Filing ----------
  await page.getByRole('link', { name: 'Submit Filing' }).click();

  // ---------- 6. Submit Files ----------
  await page.getByRole('link', { name: 'Submit Files' }).click();

  // ---------- 7. Transmit Test Filing and wait for completion ----------
  await page.getByRole('button', { name: 'Transmit Test Filing' }).click();
  await expect(page.getByText(data.expectedStatusMessage)).toBeVisible({ timeout: 120_000 });

  // ---------- 8. Verify Transmit Live Filing button is enabled ----------
  const liveFilingBtn = page.getByRole('button', { name: 'Transmit Live Filing' });
  await expect(liveFilingBtn).toBeEnabled();

  // ---------- 9. Click Transmit Live Filing ----------
  await liveFilingBtn.click();

  // ---------- 10. Confirm the live filing popup and wait for execution status to update ----------
  await expect(page.getByText(/You are about to submit a LIVE filing/i)).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  // Wait for live filing completion
  await expect(page.getByText(data.expectedStatusMessage)).toBeVisible({ timeout: 120_000 });

  // ---------- 11. Verify Accession Number is generated and displayed ----------
  await expect(page.getByText(new RegExp(data.expectedAccessionPattern))).toBeVisible();

  // ---------- 12. Click the Submission Proof tab ----------
  await page.getByText('Submission Proof').click();

  // ---------- 13. Verify the Accession Number appears under the Submission Proof tab ----------
  await expect(page.getByText(new RegExp(data.expectedAccessionPattern))).toBeVisible();
});


