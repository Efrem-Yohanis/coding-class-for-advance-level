const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

test('Test Case 415051: Verify the Final Confirmation page', async ({ page }) => {
  const data = testData.TC_415051;

  // 1. INCREASE TIMEOUT (MFA + Processing)
  test.setTimeout(120000);

  //--------------------  1. Login Flow (Standardized) -------------------------------
  await loginToAB2(page);
  //--------------------- End Login Flow ---------------------------------------------


  //--------------------- 2. Navigate to Submission (Steps 1-3) ----------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Step 1: Locate deal and verify View/Delete buttons
  const dealRow = page.getByRole('row', { name: data.dealName });
  await expect(dealRow).toBeVisible();
  await expect(dealRow.getByRole('link', { name: /view/i })).toBeVisible();
  await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();
  
  // Step 2: Open Deal and go to Submit Filing
  await dealRow.getByRole('link', { name: /view/i }).click();
  await page.getByRole('link', { name: 'Submit Filing' }).click();

  // Step 3: Navigate to Final Confirmation
  await page.getByRole('link', { name: 'Submit Files' }).click();

  // Expected Step 3: Verify Heading
  const heading = page.getByRole('heading', { name: data.confirmationHeading });
  await expect(heading).toBeVisible({ timeout: 30000 });

  //--------------------- 3. Verify Buttons (Step 4) ---------------------------------
  // List of buttons required by Manual Step 4
  const expectedActions = [
    'Transmit Test Filing',
    'Create Submission and Download',
    'Download Current Submission',
    'Submit Live Filing',
    'Back to Deal',
    'Back to Home Page',
    'Schedule Filing'
  ];

  

  for (const name of expectedActions) {
    // Check for both 'button' and 'link' roles as the UI may use either
    const actionBtn = page.locator(`role=button[name="${name}"], role=link[name="${name}"]`);
    
    // Step 4 Verification: Visible and Enabled
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toBeEnabled();
    
    console.log(`Verified Button: ${name}`);
  }

  // Final Step: Verify file list section is visible
  await expect(page.getByText(/SUBMITTED FILES|Files to Submit/i)).toBeVisible();
  
  console.log('TC 415051: Final Confirmation page verified successfully.');
});

