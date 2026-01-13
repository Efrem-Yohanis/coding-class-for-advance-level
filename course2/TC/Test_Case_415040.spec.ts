const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

// Increase the test timeout for long validation tasks
test.setTimeout(180_000);

test('415040 - Verify validation results for ABS-EE deal', async ({ page }) => {
  
  const data = testData["415040"];

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

  // -------------------- 2. Navigate & View Deal (Steps 2-4) -----------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  const dealRow = page.getByRole('row', { name: data.dealName });
  
  // Step 2: Verify deal availability and buttons
  await expect(dealRow).toBeVisible();
  await expect(dealRow.getByRole('link', { name: 'View' })).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();

  // Step 3: Click View
  await dealRow.getByRole('link', { name: 'View' }).click();

  // Step 4: Verify navigation to details page
  await expect(page).toHaveURL(/.*deal-details/);

  // -------------------- 3. Perform Validation (Step 5) ----------------------------
  await page.getByRole('button', { name: 'Perform Validation' }).click();

  // Step 5: Verify Popup elements
  const okBtn = page.getByRole('button', { name: 'OK' });
  const cancelBtn = page.getByRole('button', { name: 'Cancel' });
  
  await expect(okBtn).toBeVisible();
  await expect(cancelBtn).toBeVisible();

  // Select radio button and click OK
  const radio = page.getByRole('radio').first();
  await radio.check();
  await expect(radio).toBeChecked();
  await okBtn.click();

  // -------------------- 4. Execution Status (Step 6) ------------------------------
  await page.getByText('Execution Status').click();
  
  // Step 6: Verify completed message (robust checks)
  await expect(page.getByText(/ABS-EE Validation completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  // -------------------- 5. Validation Results Download (Steps 7-8) ----------------
  await page.locator('span').filter({ hasText: 'Validation Results' }).click();

  // Step 7: Verify Results button is enabled
  const downloadBtn = page.getByRole('button', { name: 'Validation Results' });
  await expect(downloadBtn).toBeEnabled();

  // Step 8: Handle Download and verify FileName
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadBtn.click(),
  ]);

  const suggested = download.suggestedFilename();
  console.log(`Downloaded file: ${suggested}`);

  // Verification: FileName should match expected part from test data or a validation pattern
  expect(suggested).toMatch(new RegExp(data.expectedFileNamePart, 'i'));

  // Optionally save the file locally for manual inspection
  await download.saveAs(`./test-results/downloads/${suggested}`);
});