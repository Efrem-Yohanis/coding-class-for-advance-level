import { test, expect } from '@playwright/test';

test('Verify ABSEE Deal Creation and File Upload', async ({ page }) => {
  // 1. INCREASE TIMEOUT TO 2 MINUTES (120,000 ms)
  // This gives you enough time for MFA + Upload + Verification
  test.setTimeout(120000);
  //--------------------  1. Login Flow ---------------------------------------------
  await page.goto('xyz'); // Replace with your actual URL

  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: /Enter the password/i }).fill('xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
  }

  // Code pauses for manual phone approval
  console.log('Action Required: Approve the notification on your mobile device...');
  await page.waitForTimeout(20000); 

  // Handle "Stay Signed In" prompt
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigate to ABSEE ---------------------------------------
  // Ensure we are on the page where the Deal Home button exists
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  //--------------------------- 3. Create Deal -------------------------------------------
  
  // Select the Company from the dropdown (Added based on Step 3 of manual test)
  // Adjust 'Company Name' to the actual text in your dropdown
  // await page.getByRole('combobox').first().click(); 
  // await page.getByRole('option', { name: 'Your Company Name' }).click();

  // 1. Open the creation modal
  await page.getByRole('button', { name: 'Create New Deal' }).click();

  // 2. Job Number
  await page.getByRole('textbox', { name: 'Job Number' }).fill('444');

  // 3. Deal Name
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill('automation 111');

  // 4. Period End Date
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill('09-30-2024');

  // 5. Target Filing Date
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).click();
  await page.getByRole('option', { name: 'Choose Sunday, January 11th,' }).click();

  // 6. ABS Schema Type
  await page.getByLabel('ABS Schema Type*').selectOption('2');

  // 7. Click Create
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  //----------------------------------------End Create Deal --------------------------------


  //--------------------------- 4. Verification & Navigation --------------------------------
  // Increased timeout slightly to account for server processing time after creation
  const newDealRow = page.getByRole('row', { name: '444 automation 111 09-30-2024' });
  await expect(newDealRow).toBeVisible({ timeout: 10000 });
  await newDealRow.getByRole('link').click(); 
  // ------------------------- End Verification & Navigation -------------------------------


 // ------------------------------- 5. Upload Section --------------------------------------
  await expect(page.getByText('FILE UPLOAD DETAILS')).toBeVisible();
  
  const path = require('path');
  // Since the script and resources are in the same "tests" root:
  const filePath = path.join(__dirname, 'resources', 'myfile.zip');

  // Direct upload to the hidden input (Fixes the Node is not an HTMLInputElement error)
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await page.waitForTimeout(10000);
  //--------------------------- 6. Verify Execution Status ---------------------------
  // Check Header
  await expect(page.getByText('Execution Status')).toBeVisible();

  // Wait for "Processing" label
  await expect(page.getByText('Upload File(s) processing')).toBeVisible({ timeout: 15000 });

  // Wait for "CompletedSuccessfully" (Long timeout for ZIP processing)
  const successLabel = page.getByText(/CompletedSuccessfully/);
  await expect(successLabel).toBeVisible({ timeout: 60000 });

  // Final check for the specific string
  await expect(page.getByText(/Finished Upload ABSEE/)).toBeVisible();

});
========================================
  unning 1 test using 1 worker
[chromium] › tests\ABSEEDealCreationandFileUpload.spec.ts:3:5 › Verify ABSEE Deal Creation and File Upload
Action Required: Approve the notification on your mobile device...
  1) [chromium] › tests\ABSEEDealCreationandFileUpload.spec.ts:3:5 › Verify ABSEE Deal Creation and File Upload 

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Upload File(s) processing')
    Expected: visible
    Timeout: 15000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 15000ms
      - waiting for getByText('Upload File(s) processing')


      89 |
      90 |   // // Wait for "Processing" label
    > 91 |   await expect(page.getByText('Upload File(s) processing')).toBeVisible({ timeout: 15000 });
         |                                                             ^
      92 |
      93 |   // // Wait for "CompletedSuccessfully" (Long timeout for ZIP processing)
      94 |   const successLabel = page.getByText(/CompletedSuccessfully/);
        at C:\AB2 Playwright Project\tests\ABSEEDealCreationandFileUpload.spec.ts:91:61

    Error Context: test-results\ABSEEDealCreationandFileUp-aa2c6-al-Creation-and-File-Upload-chromium\error-context.md

  1 failed
    [chromium] › tests\ABSEEDealCreationandFileUpload.spec.ts:3:5 › Verify ABSEE Deal Creation and File Upload 
