const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

// Allow longer time for scheduling and live transmit processing
test.setTimeout(300_000);

test('415057 - Schedule and transmit LIVE filing in ABSEE deal', async ({ page }) => {
  const data = testData['415057'];
  const rowRegex = new RegExp(`${data.jobNumber} ${data.dealName} ${data.periodEnd}`);

  // Navigate to Deals home and open ABS-EE Deal Home
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  // Open target deal
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view/i }).click();
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS|Files/i })).toBeVisible();

  // Ensure SEC details are present (populate if needed)
  await page.getByRole('link', { name: 'SEC' }).click();
  await page.getByRole('link', { name: 'Back to Deal' }).click();

  // Upload files if provided
  if (data.uploadFiles && data.uploadFiles.length) {
    const uploadBtn = page.getByRole('button', { name: 'Upload' });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.setInputFiles(data.uploadFiles);
    if (data.performValidation) {
      await page.getByRole('button', { name: 'Perform Validation' }).click();
      await expect(page.getByText(/Validation Results|CompletedSuccessfully/i)).toBeVisible({ timeout: 60_000 });
    }
  }

  // Schedule live filing flow
  await page.getByText('Schedule Filing').click();
  await page.getByRole('button', { name: 'Yes' }).click();

  // Open scheduling dialog
  await page.getByRole('button', { name: 'Schedule Live Filing' }).click();
  await expect(page.getByRole('heading', { name: /Schedule Live Filing/i })).toBeVisible();

  // Fill schedule form
  await page.getByRole('textbox', { name: /Deal name/i }).fill(data.dealName);
  await page.getByRole('spinbutton', { name: /Filer CIK/i }).fill(data.filerCIK || '');
  if (data.scheduleTime) {
    await page.getByRole('textbox', { name: /Date and time/i }).fill(data.scheduleTime);
  }

  // Confirm schedule
  await page.getByRole('button', { name: 'Schedule Live Filing' }).click();
  await expect(page.getByRole('heading', { name: /A LIVE filing is scheduled/i })).toBeVisible({ timeout: 30_000 });

  // Poll Execution Status until success (may take time)
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/SiFi filing completed successfully/i, { timeout: 180_000 })).toBeVisible();
  await expect(page.getByText(/Status: Accepted/i)).toBeVisible();

  // Verify Accession Number
  await expect(page.getByText(/Accession Number/i)).toBeVisible();
});