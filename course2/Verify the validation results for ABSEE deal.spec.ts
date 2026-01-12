const { test, expect } = require('@playwright/test');
// Import the JSON file you created
const testData = require('./testData.json'); 

test('Verify the validation results for ABSEE deal', async ({ page }) => {
  
  // Define 'data' for Test Case 415038
  const data = testData["415038"];

  // -------------------- 1. LOGIN FLOW ---------------------------------------------
  await page.goto('https://13f-qa.azurewebsites.net/deals'); 

  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: /Enter the password/i }).fill('xxxx');
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

  // -------------------- 2. NAVIGATE TO ABSEE (Step 2-4) -----------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  await dealRow.getByRole('link', { name: 'View' }).click();

  // -------------------- 3. PERFORM VALIDATION (Step 5-7) ------------------
  await page.getByRole('button', { name: 'Perform Validation' }).click();
  
  const okButton = page.getByRole('button', { name: 'OK' });
  if (await okButton.isVisible({ timeout: 5000 })) {
      await page.getByRole('radio').first().check(); 
      await okButton.click();
  }

  // -------------------- 4. EXECUTION STATUS (Step 8) -----------------------
  await page.getByText('Execution Status').click();
  
  const finalStatus = page.getByText('ABS-EE Validation completed, CompletedSuccessfully');
  await expect(finalStatus).toBeVisible({ timeout: 120000 }); 

  // -------------------- 5. VALIDATION RESULTS (Step 9) ---------------------
  await page.locator('span').filter({ hasText: 'Validation Results' }).click();

  // 1. Filename
  await expect(page.locator('text=Filename:').locator('..')).toContainText(data.expectedFileName);

  // 2. Created Date (Regex for year and time)
  await expect(page.locator('span').filter({ hasText: /^Created Date:$/ }).locator('..'))
    .toContainText(/\d{4}.*\d{1,2}:\d{2}/); 

  // 3. Period Start
  await expect(page.getByText('Period Start:').locator('..')).toContainText(data.periodStart);

  // 4. Period End
  await expect(page.getByText('Period End:').locator('..')).toContainText(data.periodEnd);

  // 5. Number of Records
  await expect(page.getByText('Number of Records:').locator('..')).toContainText(data.expectedRecords);

  // 6. Number of Errors
  await expect(page.getByText('Number of Errors:').locator('..')).toContainText(data.expectedErrors);

  // 7. Number of Warnings
  await expect(page.getByText('Number of Warnings:').locator('..')).toContainText(data.expectedWarnings);

  console.log('Verification Complete: All fields in Step 9 match the test data.');
});