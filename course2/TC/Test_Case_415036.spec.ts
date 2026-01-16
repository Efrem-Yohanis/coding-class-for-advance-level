const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

// Increase timeout to accommodate creation + upload + processing
test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  const data = testData['415036'];
  const rowRegex = new RegExp(`${data.jobNumber} ${data.dealName} ${data.periodEnd}`);

  // ---------- 1. LOGIN (mandatory) ----------
  await page.goto('url');
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
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- 2. Create New Deal ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(data.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(data.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(data.periodEnd);
  if (data.schemaOption) {
    await page.getByLabel('ABS Schema Type*').selectOption(String(data.schemaOption));
  }
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // Verify deal appears in table
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });

  // ---------- 3. Open deal & Upload ----------
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view/i }).click();
  await expect(page.getByRole('heading', { name: /FILE UPLOAD DETAILS|Files/i })).toBeVisible();

  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();

  // Use configured upload path (ensure file exists in CI or local before running)
  await uploadButton.setInputFiles(data.uploadFilePath);

  // Wait for processing to complete
  await page.getByText('Execution Status').click();
  await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 180_000 });

  // Optionally assert uploaded file shows up in the UI
  await expect(page.getByText(/File upload queue|Uploaded/i)).toBeVisible({ timeout: 30_000 });
});