const { test, expect } = require('@playwright/test');
const testData = require('./testData.json'); 

// Loop through the test cases defined in your JSON
for (const [testId, data] of Object.entries(testData)) {

  test(`TC ${testId}: ${data.dealName}`, async ({ page }) => {
    
    // -------------------- 1. LOGIN FLOW (Shared Step 1) --------------------------
    // Pulls URL and Credentials from Environment Variables for security
    await page.goto(process.env.BASE_URL || 'https://13f-qa.azurewebsites.net/deals'); 

    await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.USER_EMAIL || 'xxxx@email.com');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.USER_PASS || 'xxxx');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Handle MFA
    const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
    if (await mfaOption.isVisible({ timeout: 5000 })) {
      await mfaOption.click();
      console.log(`TC ${testId}: Action Required: Approve notification on mobile...`);
      await page.waitForTimeout(20000); 
    }

    // Handle "Stay Signed In" prompt
    const staySignedInNo = page.locator('#idBtn_Back');
    if (await staySignedInNo.isVisible({ timeout: 5000 })) {
      await staySignedInNo.click();
    }

    // -------------------- 2. NAVIGATION (Steps 2-4) ------------------------------
    await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
    
    // Verify Row exists and navigate
    const dealRow = page.getByRole('row', { name: data.dealName });
    await expect(dealRow).toBeVisible();
    
    // Step 2 verification: View and Delete buttons exist
    await expect(dealRow.getByRole('link', { name: 'View' })).toBeVisible();
    await expect(dealRow.getByRole('button', { name: 'Delete' })).toBeVisible();

    await dealRow.getByRole('link', { name: 'View' }).click();
    
    // Step 4: Verify navigation to details page
    await expect(page).toHaveURL(/.*deal-details/);

    // -------------------- 3. VALIDATION POPUP (Steps 5-7) ------------------------
    await page.getByRole('button', { name: 'Perform Validation' }).click();
    
    const okButton = page.getByRole('button', { name: 'OK' });
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    
    // Verify popup elements (Step 5)
    await expect(okButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    if (await okButton.isVisible({ timeout: 5000 })) {
        const radio = page.getByRole('radio').first();
        await radio.check();
        await expect(radio).toBeChecked(); // Step 6
        await okButton.click(); // Step 7
    }

    // -------------------- 4. EXECUTION STATUS (Step 8) ---------------------------
    await page.getByText('Execution Status').click();
    const successMsg = 'ABS-EE Validation completed, CompletedSuccessfully : Finished Validation';
    await expect(page.getByText(successMsg)).toBeVisible({ timeout: 120000 }); 

    // -------------------- 5. VALIDATION RESULTS (Steps 9-12) ---------------------
    // Note: TC 415038 and 415039 focus on data verification
    await page.locator('span').filter({ hasText: 'Validation Results' }).click();

    // Verification of fields (Matches Step 9-12 in manual cases)
    await expect(page.locator('text=Filename:').locator('..')).toContainText(data.expectedFileName);
    
    // Created Date (Regex to allow any date but must have a timestamp)
    await expect(page.locator('span').filter({ hasText: /^Created Date:$/ }).locator('..'))
      .toContainText(/\d{4}.*\d{1,2}:\d{2}/); 

    await expect(page.getByText('Period Start:').locator('..')).toContainText(data.periodStart);
    await expect(page.getByText('Period End:').locator('..')).toContainText(data.periodEnd);
    await expect(page.getByText('Number of Records:').locator('..')).toContainText(data.expectedRecords);
    await expect(page.getByText('Number of Errors:').locator('..')).toContainText(data.expectedErrors);
    await expect(page.getByText('Number of Warnings:').locator('..')).toContainText(data.expectedWarnings);

    // -------------------- 6. DOWNLOAD VERIFICATION (TC 415040 Step 8) -----------
    if (testId === "TC_415040") {
        const downloadBtn = page.getByRole('button', { name: 'Validation Results' });
        await expect(downloadBtn).toBeEnabled();

        const downloadPromise = page.waitForEvent('download');
        await downloadBtn.click();
        const download = await downloadPromise;

        const actualFileName = download.suggestedFilename();
        expect(actualFileName.toLowerCase()).toContain('validationresult');
        console.log(`TC ${testId}: Successfully downloaded ${actualFileName}`);
        
        // Save file for audit
        await download.saveAs('./downloads/' + actualFileName);
    }

    console.log(`${testId} passed successfully!`);
  });
}