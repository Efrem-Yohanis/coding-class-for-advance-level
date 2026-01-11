import { test, expect } from '@playwright/test';

test('Verify ABSEE Deal Creation and File Upload', async ({ page }) => {
  
  //--------------------  1. Login Flow ---------------------------------------------
  await page.goto('xxxx');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxxx@email.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Enter the password' }).fill('xxxx');
  await page.getByRole('button', { name: 'Sign in' }).click();

  //--------------------- End Login Flow ---------------------------------------------
  // 2. Navigate to ABSEE
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  //--------------------------- 3. Create Deal -------------------------------------------
 
  // 0. selector missied Select the Company from the dropdown */

  // 1. Open the creation modal
  await page.getByRole('button', { name: 'Create New Deal' }).click();

  // 2. Job Number
  await page.getByRole('textbox', { name: 'Job Number' }).fill('444');

  // 3. Deal Name
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill('automation 111');

  // 4. Period End Date
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill('09-30-2024');

  // 5. Target Filing Date (Click to open and select date)
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).click();
  await page.getByRole('option', { name: 'Choose Sunday, January 11th,' }).click();

  // 6. ABS Schema Type (Select from dropdown)
  await page.getByLabel('ABS Schema Type*').selectOption('2');

  // 7. Click Create
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  //----------------------------------------End Create Deal -------------------------------------------------------


  //--------------------------------------- 4. Verification & Navigation -------------------------------------
  // Wait for the row to appear in the table
  const newDealRow = page.getByRole('row', { name: '444 automation 111 09-30-2024' });
  await expect(newDealRow).toBeVisible();
  await newDealRow.getByRole('link').click(); // Clicking 'View' link
  // ------------------------------------- End Verification & Navigation --------------------------

  // ----------------------------------- 5. Upload Section --------------------------------------
//   await expect(page.getByText('FILE UPLOAD DETAILS')).toBeVisible();
//   await page.getByRole('button', { name: 'Upload' }).setInputFiles('path/to/your/file.zip');

//   // 6. Verify Upload Status
//   await expect(page.getByText('CompletedSuccessfully')).toBeVisible();
  // ----------------------------------- End Upload Section ---------------------------------------------
});
=========================================================
  
import { Page, expect } from '@playwright/test';

export async function loginToAB2(page: Page) {
  const url = process.env.AB2_BASE_URL;
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!url || !email || !password) {
    throw new Error('Missing env vars: AB2_BASE_URL, USER_EMAIL, USER_PASSWORD.');
  }

  // Step 1: Open AB2
  await page.goto(url);

  // Step 2: DFIN sign-in button
  const signInButton = page.getByRole('button', { name: 'Sign in with DFIN Account' });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // Step 3: Enter email
  const emailInput = page.getByRole('textbox', { name: 'Email address' });
  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 4: Enter password
  const passwordInput = page.locator('#i0118')
    .or(page.getByRole('textbox', { name: /Enter the password for/i }));
  await expect(passwordInput).toBeVisible({ timeout: 15_000 });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /^Sign in$/i }).click();

  // ✅ Step 5: Select the specific MFA method button (if the chooser appears)
  const approveOnAuthenticatorBtn = page.getByRole('button', {
    name: 'Approve a request on my Microsoft Authenticator app',
  });
  try {
    await approveOnAuthenticatorBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await approveOnAuthenticatorBtn.click();
  } catch {
    // Method chooser not shown—tenant may auto-push or use a different flow.
  }

  // Step 6: Handle MFA—push approval screen
  const mfaHeading = page.getByRole('heading', { name: /Approve sign in request/i });
  try {
    await expect(mfaHeading).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(20_000); // tune to org’s typical approval time
  } catch {
    // No approval heading detected; could be an OTP/code flow or silent success.
  }

  // Step 7: “Stay signed in?” prompt (Azure AD)
  const staySignedInYes = page.locator('#idSIButton9'); // Yes
  const staySignedInNo = page.locator('#idBtn_Back');   // No
  try {
    await staySignedInYes.waitFor({ state: 'visible', timeout: 5_000 });
    if (await staySignedInNo.isVisible()) {
      await staySignedInNo.click(); // choose No for cleaner test runs
    } else {
      await staySignedInYes.click();
    }
  } catch {
    // Prompt didn’t appear—nothing to do.
  }

  
}
