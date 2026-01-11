import { test, expect } from '@playwright/test';

test('Verify user able to clone ABSEE deal', async ({ page }) => {
  // 1. Set a long timeout for MFA and processing
  test.setTimeout(120000);

  // -------------------- 1. Login Flow (Shared Steps) -----------------------
  await page.goto('https://13f-qa.azurewebsites.net/');

  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('xxx@email.com'); // Add actual email
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: /Enter the password/i }).fill('xxxx'); // Add actual password
  await page.getByRole('button', { name: 'Sign in' }).or(page.getByRole('button', { name: 'Verify' })).click();

  // Handle MFA
  console.log('Action Required: Approve the notification on your mobile device...');
  await page.waitForTimeout(15000); // 15s for manual approval

  // Handle "Stay Signed In"
  const staySignedInNo = page.locator('#idSIButton9').or(page.locator('#idBtn_Back'));
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // -------------------- 2. Navigate to ABSEE -------------------------------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page).toHaveURL(/.*deal-home/i); // Verify navigation

  // -------------------- 3. Select Company ----------------------------------
  // Assuming the dropdown requires a click to open based on recorded script
  await page.getByText('Company', { exact: true }).click();
  // If there's a specific company to select, add it here:
  // await page.getByRole('option', { name: 'Target Company' }).click();

  // -------------------- 4 & 5. Open Clone Modal ----------------------------
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  
  // Verify Clone button is enabled and click it
  const cloneBtn = page.getByRole('button', { name: 'Clone' });
  await expect(cloneBtn).toBeEnabled();
  await cloneBtn.click();

  // -------------------- 6 & 7. Handle Clone Deal Popup ---------------------
  // Verify popup title
  await expect(page.getByText('Clone Deal', { exact: true })).toBeVisible();

  // Select a Deal from the dropdown (React-Select usually requires a click then a selection)
  await page.getByText('Deals').click();
  // Using a more stable locator for the dropdown option than ID
  await page.locator('[class*="-option"]').first().click(); 

  // -------------------- 8. Enter Clone Details -----------------------------
  const uniqueJobNum = `JL${Math.floor(Math.random() * 10000)}`;
  
  await page.getByRole('textbox', { name: 'Deal Name' }).fill('Clone auto testing 111');
  await page.getByRole('textbox', { name: 'Job Number' }).fill(uniqueJobNum);
  
  await page.getByRole('button', { name: 'Yes' }).click();

  // -------------------- 9. Verify Cloned Deal in Table ---------------------
  // Wait for the modal to close and table to refresh
  await page.waitForLoadState('networkidle');
  
  const clonedRow = page.getByRole('row', { name: uniqueJobNum });
  await expect(clonedRow).toBeVisible({ timeout: 20000 });
  
  console.log(`✅ Success: Deal cloned with Job Number: ${uniqueJobNum}`);

  // -------------------- 10. Verify "No" Closes Popup -----------------------
  // Quick check for step 10: Open again and click No
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByRole('button', { name: 'Clone' }).click();
  await page.getByRole('button', { name: 'No' }).click();
  
  await expect(page.getByText('Clone Deal')).not.toBeVisible();
  console.log('✅ Success: Clone popup closed successfully via "No" button.');
});
