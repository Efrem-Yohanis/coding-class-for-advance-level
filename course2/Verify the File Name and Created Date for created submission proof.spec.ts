const { test, expect } = require('@playwright/test');
const testData = require('./testData.json'); 

test('Test Case 415042: Verify the File Name and Created Date for created submission proof', async ({ page }) => {
  
  // Set data for this specific test case from JSON
  const data = testData.TC_415042;

  // 1. INCREASE TIMEOUT TO 2 MINUTES (120,000 ms)
  // This gives you enough time for MFA + Upload + Verification
  test.setTimeout(120000);

  //--------------------  1. Login Flow ---------------------------------------------
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
    // Code pauses for manual phone approval
    console.log('Action Required: Approve the notification on your mobile device...');
    await page.waitForTimeout(20000); 
  }

  // Handle "Stay Signed In" prompt
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigate to ABSEE ---------------------------------------
  // Step 2: Verify the new deal is available with View and Delete buttons
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  
  // Verification per Manual Step 2
  await expect(dealRow.getByRole('link')).toBeVisible(); // View link
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible(); 
  
  await dealRow.getByRole('link').click();

  //--------------------- 3. Create Submission Proof ---------------------------------
  // Step 3: Trigger and Verify Popup
  await page.getByText('Submission Proof').click();
  await page.getByRole('button', { name: 'Create' }).click();

  const popupMsg = "Do you want to include the contents of the Ex-102 file in the submission proof?";
  await expect(page.getByText(popupMsg)).toBeVisible();
  
  // Click "No" as per recording
  await page.getByRole('button', { name: 'No' }).click();

  // Wait for Execution Status to finish
  await page.getByText('Execution Status').click();
  await expect(page.getByText('Submission Proof completed, CompletedSuccessfully'))
    .toBeVisible({ timeout: 60000 });

  //--------------------- 4. Verify Results (Step 4 & 5) ----------------------------
  await page.getByText('Submission Proof').click();

  // Step 4: Verify FileName matches JobNumber
  const fileNameValue = page.locator('text=File Name:').locator('..');
  await expect(fileNameValue).toContainText(data.expectedFileName);

  // Step 5: Verify Created Date and Timestamp
  // Uses nth(1) because Created Date appears in multiple tabs
  const createdDateValue = page.locator('span').filter({ hasText: /^Created Date:$/ }).nth(1).locator('..');
  
  // Matches the year (2026) and the time format (HH:MM:SS AM/PM) found in recording
  await expect(createdDateValue).toContainText(data.expectedYear);
  await expect(createdDateValue).toContainText(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);


});