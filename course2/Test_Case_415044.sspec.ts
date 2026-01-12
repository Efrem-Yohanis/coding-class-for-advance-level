const { test, expect } = require('@playwright/test');
const testData = require('./testData.json'); 

test('Test Case 415044: Verify Download button in the submission proof is enabled', async ({ page }) => {
  
  const data = testData.TC_415044;

  // 1. INCREASE TIMEOUT TO 2 MINUTES (120,000 ms)
  test.setTimeout(120000);

  //--------------------  1. Login Flow (Common) ------------------------------------
  await page.goto('https://13f-qa.azurewebsites.net/'); 

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

  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) { await staySignedInNo.click(); }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigate to ABSEE ---------------------------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Directly locate the row from your recording data
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  
  // Step 2 Verification: View and Delete buttons are available
  await expect(dealRow.getByRole('link')).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();
  
  await dealRow.getByRole('link').click();

  //--------------------- 3. Submission Proof Flow (Step 3-5) ------------------------
  await page.getByText('Submission Proof').click();
  
  // Trigger Creation
  await page.getByRole('button', { name: 'Create' }).click();
  // Step 3 Verification: Popup visibility
  await expect(page.getByText(/include the contents of the Ex-102 file/i)).toBeVisible();
  
  // Step 5: Click "Yes" (as per your recording sequence)
  await page.getByRole('button', { name: 'Yes' }).click();

  // Step 4/5 Verification: Verify Execution Status
  await page.getByText('Execution Status').click();
  const successMsg = 'Submission Proof completed, CompletedSuccessfully : Finished Submission proof';
  await expect(page.getByText(successMsg)).toBeVisible({ timeout: 60000 });

  //--------------------- 4. Verify Download Button (Step 6) -------------------------
  await page.getByText('Submission Proof').click();

  const downloadBtn = page.getByRole('button', { name: 'Download', exact: true });
  
  // Verification: Check if button is enabled
  await expect(downloadBtn).toBeEnabled();

  // Verification: Handle File Download
  // Start waiting for download before clicking
  const downloadPromise = page.waitForEvent('download');
  await downloadBtn.click();
  const download = await downloadPromise;

  // Verify the filename contains "ResultSubmission"
  const actualFileName = download.suggestedFilename();
  console.log(`Downloaded file name: ${actualFileName}`);
  expect(actualFileName).toContain('ResultSubmission');

  // Save the file to local storage for manual extraction check if needed
  await download.saveAs('./test-results/downloads/' + actualFileName);

});