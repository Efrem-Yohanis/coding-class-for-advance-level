const { test, expect } = require('@playwright/test');
const testData = require('./testData.json');

test('Test Case 415052: Verify the result for the Create Submission and Download button', async ({ page }) => {
  const data = testData.TC_415052;

  // 1. SET LONG TIMEOUT (Manual Note: 120s for processing)
  test.setTimeout(180000); // 3 minutes total to allow for MFA + Submission

  //--------------------  1. Login Flow (Standardized) -------------------------------
  await page.goto('https://13f-qa.azurewebsites.net/'); 
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /password/i }).fill('xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    console.log('Action Required: Approve the notification on your mobile device...');
    await page.waitForTimeout(20000); 
  }
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) { await staySignedInNo.click(); }
  //--------------------- End Login Flow ---------------------------------------------

  //--------------------- 2. Navigate to Final Confirmation (Steps 1-2) --------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Step 1: Verify Deal Row and Actions
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  await expect(dealRow.getByRole('link', { name: /view/i })).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();
  
  await dealRow.getByRole('link', { name: /view/i }).click();

  // Step 2: Navigate to Final Confirmation
  await page.getByRole('link', { name: 'Submit Filing' }).click();
  await page.getByRole('link', { name: 'Submit Files' }).click();
  await expect(page.getByRole('heading', { name: 'Final Confirmation' })).toBeVisible({ timeout: 30000 });

  //--------------------- 3. Create Submission & Download (Step 3-4) -----------------
  const createBtn = page.getByRole('button', { name: 'Create Submission and Download' });
  await expect(createBtn).toBeEnabled();

  // Start listening for the download event BEFORE clicking the button
  const downloadPromise = page.waitForEvent('download');
  
  // Step 3: Trigger Submission
  await createBtn.click();

  // Verification Step 3: Execution Status Transitions
  // Check for InProgress status
  await expect(page.getByText(/InProgress : Start Submission/i)).toBeVisible({ timeout: 60000 });
  
  // Check for CompletedSuccessfully status (Manual Step 3 Expected Result)
  await expect(page.getByText(/CompletedSuccessfully :/i)).toBeVisible({ timeout: 120000 });

  // Verification Step 4: Handle Downloaded ZIP
  const download = await downloadPromise;
  const fileName = download.suggestedFilename();
  
  console.log(`Successfully captured download: ${fileName}`);

  // Assert filename matches ResultSubmission.*\.zip
  expect(fileName.toLowerCase()).toContain(data.expectedZipPattern.toLowerCase());
  expect(fileName.toLowerCase()).endsWith('.zip');

  // Optional: Save file to local results folder
  await download.saveAs('./test-results/submissions/' + fileName);

  console.log('TC 415052: Submission created and ZIP file verified successfully.');
});