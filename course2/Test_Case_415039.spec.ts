const { test, expect } = require('@playwright/test');
const testData = require('./testData.json'); 

test('415039 - Verify Validation Results tab for validated ABSEE deal', async ({ page }) => {
  
  // Use the specific data set for 415039 from your JSON
  const data = testData["415039"];

  // -------------------- 1. Shared steps: Login (Step 1) ---------------------------
  await page.goto('https://13f-qa.azurewebsites.net/deals');

  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: /Enter the password/i }).fill('xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA - Approval pause
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) { 
      await mfaOption.click(); 
      console.log('Action Required: Approve MFA on your mobile device...');
      await page.waitForTimeout(20000); 
  }

  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) { await staySignedInNo.click(); }


  // -------------------- 2. Navigate & View Deal (Steps 2-3) -----------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible(); 
  // Step 3: Click View
  await dealRow.getByRole('link', { name: 'View' }).click();


  // -------------------- 3. Perform Validation (Step 4) ----------------------------
  await page.getByRole('button', { name: 'Perform Validation' }).click();
  
  // Handle popup if it appears
  const okButton = page.getByRole('button', { name: 'OK' });
  if (await okButton.isVisible({ timeout: 5000 })) {
      await page.getByRole('radio').first().check();
      await okButton.click();
  }

  // Verify Validation Completion status message
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/ABS-EE Validation completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });


  // -------------------- 4. Detailed Results Verification (Steps 5-12) -------------
  // Step 5: Click the Results tab
  await page.locator('span').filter({ hasText: 'Validation Results' }).click();

  // Step 6: Verify FileName
  await expect(page.locator('text=Filename:').locator('..')).toContainText(data.expectedFileName);

  // Step 7: Verify Created Date (Timestamp validation using Regex)
  // This matches a date and a time pattern to ensure the timestamp is present
  await expect(page.locator('span').filter({ hasText: /^Created Date:$/ }).locator('..'))
    .toContainText(/\d{4}.*\d{1,2}:\d{2}/); 

  // Step 8: Verify Period Start
  await expect(page.getByText('Period Start:').locator('..')).toContainText(data.periodStart);

  // Step 9: Verify Period End
  await expect(page.getByText('Period End:').locator('..')).toContainText(data.periodEnd);

  // Step 10: Verify Number of Records
  await expect(page.getByText('Number of Records:').locator('..')).toContainText(data.expectedRecords);

  // Step 11: Verify Number of Errors
  await expect(page.getByText('Number of Errors:').locator('..')).toContainText(data.expectedErrors);

  // Step 12: Verify Number of Warnings
  await expect(page.getByText('Number of Warnings:').locator('..')).toContainText(data.expectedWarnings);
});