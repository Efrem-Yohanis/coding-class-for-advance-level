const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

test('Test Case 415047: Verify the SEC Information page', async ({ page }) => {
  const data = testData.TC_415047;

  // 1. INCREASE TIMEOUT (MFA + Navigation + Save Processing)
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
  if (await staySignedInNo.isVisible({ timeout: 5000 })) { await staySignedInNo.click(); }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigation (Steps 2-5) ----------------------------------
  // Step 2: Click ABSEE Deal icon
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('heading', { name: 'ABS-EE Deal Home' })).toBeVisible();

  // Step 3: Verify Deal row and View/Delete buttons
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();

  // Step 4: Click View
  await dealRow.getByRole('link').click();

  // Step 5: Verify SEC button is available and enabled
  const secBtn = page.getByRole('link', { name: 'SEC' });
  await expect(secBtn).toBeVisible();
  await expect(secBtn).toBeEnabled();

  //--------------------- 3. SEC Page Verification (Steps 6-8) -----------------------
  // Step 6: Click SEC and verify sections
  await secBtn.click();
  await expect(page.getByText('Submission Information')).toBeVisible();
  await expect(page.getByText('ABS-EE CoRegistrant')).toBeVisible(); // Requirement Step 6
  await expect(page.getByText('Notification Email')).toBeVisible();

  // Step 7: Check Tooltip/Validation (Click Save without data)
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Note: HTML5 validation tooltips can be checked via 'validationMessage' or visible text
  const validationText = page.getByText(/Please fill out this field|CCC length should be 8 characters/i);
  await expect(validationText.first()).toBeVisible();

  // Step 8: Fill mandatory fields and verify Success Message
  // Using specific locators based on the recording
  await page.getByRole('spinbutton').first().fill(data.filerCIK); 
  await page.getByRole('textbox', { name: /Filer CCC/i }).fill(data.filerCCC);
  await page.getByRole('textbox', { name: /ABS-EE File Number/i }).fill(data.fileNumber);
  await page.getByRole('spinbutton').nth(1).fill(data.depositorCIK); 
  await page.getByRole('spinbutton').nth(2).fill(data.sponsorCIK); 
  await page.locator('input[type="email"]').first().fill(data.email);

  await page.getByRole('button', { name: 'Save' }).click();

  // Verify Success Message
  await expect(page.getByText(/Saved successfully|Success/i)).toBeVisible({ timeout: 10000 });

  console.log('TC 415047: SEC Information page and validation successfully verified.');
});