const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') }); 

// Increase timeout for this test to accommodate MFA/processing
test.setTimeout(120_000);

test('415042 - Verify the File Name and Created Date for created submission proof', async ({ page }) => {
  // Use standardized test data
  const data = testData["415042"];
  const jobNumber = data.jobNumber;
  const dealRow = new RegExp(`${jobNumber} submission proof to be`);

  //--------------------  1. Login Flow (Standardized) -------------------------------
  await loginToAB2(page);
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
  await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });

  //--------------------- 4. Verify Results (Step 4 & 5) ----------------------------
  await page.getByText('Submission Proof').click();

  // Verify filename contains job number and expected filename
  await expect(page.getByText(/File Name:/i)).toBeVisible();
  await expect(page.getByText(new RegExp(`${jobNumber}.*\.html`, 'i'))).toBeVisible();
  await expect(page.getByText(data.expectedFileName)).toBeVisible();

  // Verify Created Date includes year and timestamp
  await expect(page.getByText(/Created Date:/i)).toBeVisible();
  const created = page.getByText(/Created Date:/i).locator('..');
  await expect(created).toContainText(new RegExp(data.expectedYear));
  await expect(created).toContainText(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);


});

