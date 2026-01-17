const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// Increase timeout for submit/transmit processing
test.setTimeout(240_000);

test('415054 - Transmit test filing in ABSEE deal', async ({ page }) => {
  const data = testData['415054'];
  const rowRegex = new RegExp(`${data.jobNumber} ${data.dealName} ${data.periodEnd}`);

  // Navigate to Deals home and open ABS-EE Deal Home
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();

  // Open target deal
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view/i }).click();
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS|Files/i })).toBeVisible();

  // Ensure status is Active (if not, allow SEC tab to populate token)
  const status = page.locator('text=Active');
  if (!(await status.isVisible({ timeout: 5_000 }).catch(() => false))) {
    await page.getByRole('link', { name: 'SEC' }).click();
    // wait briefly for token/auth to populate
    await page.waitForTimeout(2_000);
    await page.getByRole('link', { name: 'Back to Deal' }).click();
  }

  // If upload files are provided, ensure they are uploaded (non-blocking)
  if (data.uploadFiles && data.uploadFiles.length) {
    const uploadBtn = page.getByRole('button', { name: 'Upload' });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.setInputFiles(data.uploadFiles);
    // Optionally trigger validation and wait for completion
    if (data.performValidation) {
      await page.getByRole('button', { name: 'Perform Validation' }).click();
      // Wait for some validation result to appear
      await expect(page.getByText(/Validation Results|CompletedSuccessfully/i)).toBeVisible({ timeout: 60_000 });
    }
  }

  // Submit filing and files
  await page.getByRole('link', { name: 'Submit Filing' }).click();
  await page.getByRole('link', { name: 'Submit Files' }).click();

  // Transmit test filing
  await page.getByRole('button', { name: 'Transmit Test Filing' }).click();

  // Wait for execution status to show success and acceptance
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/SiFi filing completed successfully/i, { timeout: 180_000 })).toBeVisible();
  await expect(page.getByText(/Status: Accepted/i)).toBeVisible();

  // Verify accession number is present
  const accession = page.locator('text=Accession Number');
  await expect(accession).toBeVisible();
  // Optionally assert pattern somewhere near accession value
  const accessionValue = page.locator('css=*[data-testid="accession-number"]');
  if (await accessionValue.count() > 0) {
    const txt = await accessionValue.first().innerText();
    expect(txt).toMatch(/\d{10}-\d{2}-\d{6}/);
  }
});


