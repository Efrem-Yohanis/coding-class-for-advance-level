const { test, expect } = require('@playwright/test');
const testData = require('./testData.json');

test('Test Case 415053: Verify the result for the Download Current Submission button', async ({ page }) => {
  const data = testData.TC_415053;

  // 1. SET TIMEOUT (MFA + Navigation + Download)
  test.setTimeout(120000);

  //--------------------  1. Login Flow (Standardized) -------------------------------
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
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigation (Steps 2-6) ----------------------------------
  // Step 2: Click ABSEE Deal Icon (Deal Home)
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('heading', { name: 'ABS-EE Deal Home' })).toBeVisible();

  // Step 3: Verify Deal row buttons
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();

  // Step 4: Click View
  const viewLink = dealRow.getByRole('link');
  await expect(viewLink).toBeVisible();
  await viewLink.click();

  // Step 5: Check Submit Filing button
  const submitFilingBtn = page.getByRole('link', { name: 'Submit Filing' });
  await expect(submitFilingBtn).toBeVisible();
  await submitFilingBtn.click();

  // Step 6: Check Submit Files and open Final Confirmation
  const submitFilesBtn = page.getByRole('link', { name: 'Submit Files' });
  await expect(submitFilesBtn).toBeEnabled();
  await submitFilesBtn.click();
  
  await expect(page.getByRole('heading', { name: 'Final Confirmation' })).toBeVisible({ timeout: 30000 });

  //--------------------- 3. Verify Download Buttons (Step 7-9) ----------------------
  // Step 7: Verify 'Create Submission and Download' is enabled by default
  const createBtn = page.getByRole('button', { name: 'Create Submission and Download' });
  await expect(createBtn).toBeEnabled();

  // Step 8: Check 'Download Current Submission' button is enabled
  const downloadCurrentBtn = page.getByRole('button', { name: 'Download Current Submission' });
  await expect(downloadCurrentBtn).toBeVisible();
  await expect(downloadCurrentBtn).toBeEnabled();

  // Step 9: Verify ZIP Download
  // Start waiting for the download before clicking
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await downloadCurrentBtn.click();

  const download = await downloadPromise;
  const filename = download.suggestedFilename();

  // Assert filename matches ResultSubmission.*\.zip
  console.log(`Downloaded file: ${filename}`);
  expect(filename).toMatch(/ResultSubmission.*\.zip/i);

  // Save for CI artifact visibility
  await download.saveAs('./test-results/downloads/' + filename);

  console.log('TC 415053: Download Current Submission verified successfully.');
});