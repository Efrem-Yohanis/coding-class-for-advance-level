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
