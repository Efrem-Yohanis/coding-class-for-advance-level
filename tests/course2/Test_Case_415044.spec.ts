const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') }); 

test('415044 - Download button downloads ResultSubmission.zip', async ({ page }) => {
  
  const data = testData["415044"];

  // Increase timeout for MFA and background processing
  test.setTimeout(120_000);

  //--------------------  1. Login Flow (Standardized) -------------------------------
  await loginToAB2(page);
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

  // Step 4/5 Verification: Verify Execution Status (robust)
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  //--------------------- 4. Verify Download Button (Step 6) -------------------------
  await page.getByText('Submission Proof').click();

  const downloadBtn = page.getByRole('button', { name: 'Download', exact: true });
  
  // Verification: Check if button is enabled
  await expect(downloadBtn).toBeEnabled();

  // Verification: Handle File Download using Promise.all to avoid race
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadBtn.click(),
  ]);

  // Verify the filename contains "ResultSubmission" and ends with .zip
  const actualFileName = download.suggestedFilename();
  console.log(`Downloaded file name: ${actualFileName}`);
  expect(actualFileName).toMatch(/ResultSubmission.*\.zip/i);

  // Save the file to the test-results downloads folder for CI/manual checks
  await download.saveAs(`./test-results/downloads/${actualFileName}`);

});

