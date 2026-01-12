const { test, expect } = require('@playwright/test');
const testData = require('./testData.json'); 

test('415043 - Verify View button in the submission proof opens proof in a new tab', async ({ page, context }) => {
  
  const data = testData["415043"]; // Use numeric key from testData.json

  // Increase timeout to accommodate MFA and processing
  test.setTimeout(120_000);

  //--------------------  1. Login Flow (mandatory) ------------------------------------
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
  if (await staySignedInNo.isVisible({ timeout: 5000 })) { await staySignedInNo.click(); }
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigate to ABSEE ---------------------------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  const jobRow = new RegExp(data.dealName);
  const dealRow = page.getByRole('row', { name: jobRow });
  await expect(dealRow).toBeVisible();
  await dealRow.getByRole('link').click();

  //--------------------- 3. Submission Proof Flow (Step 3-5) ------------------------
  await page.getByText('Submission Proof').click();
  
  // Requirement Step 5: Click "Yes" to include EX-102 file (as per your recording)
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText(/include the contents of the Ex-102 file/i)).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  // Verify Execution Status
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  //--------------------- 4. Verify View Button (Step 6) ----------------------------
  await page.getByText('Submission Proof').click();

  const viewBtn = page.getByRole('button', { name: 'View', exact: true });
  
  // Verification: Check if button is visible and enabled
  await expect(viewBtn).toBeVisible();
  await expect(viewBtn).toBeEnabled();

  // Verification: Handle New Browser Tab (Popup) with Promise.all
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    viewBtn.click(),
  ]);

  await newTab.waitForLoadState();

  // Verify the new tab contains the Job Number or specific file content
  console.log('New tab title:', await newTab.title());
  await expect(newTab).toHaveURL(/.*\.html/); // Confirms it opened an HTML proof file

  console.log('TC 415043: View button successfully opened proof in a new tab.');
});