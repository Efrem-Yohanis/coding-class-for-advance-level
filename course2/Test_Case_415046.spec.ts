const { test, expect } = require('@playwright/test');
const testData = require('./testData.json');

// Verify Download PDF flow downloads a .pdf file
test.setTimeout(180_000);

test('415046 - Download PDF downloads generated PDF', async ({ page }) => {
  const data = testData['415046'] || {};
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || '99 submission proof to be';
  const periodEnd = data.periodEnd || '09-30-2024';
  const rowRegex = new RegExp(`${jobNumber} ${dealName} ${periodEnd}`);

  // ---------- LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@local');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    await page.waitForTimeout(20000);
  }

  // Handle "Stay signed in?"
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- Open deal and ensure Submission Proof exists ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  // Create Submission Proof (No flow) if not present
  await page.getByText('Submission Proof').click();
  const createBtn = page.getByRole('button', { name: 'Create' });
  if (await createBtn.isVisible({ timeout: 5000 })) {
    await createBtn.click();
    await expect(page.getByText(/Do you want to include the contents of the EX-102 file/i)).toBeVisible();
    await page.getByRole('button', { name: 'No' }).click();
    await page.getByText('Execution Status').click();
    await expect(page.getByText(/Submission Proof completed/i)).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });
  }

  // Convert to PDF if available
  const convertBtn = page.getByRole('button', { name: 'Convert to PDF' });
  if (await convertBtn.isVisible()) {
    await expect(convertBtn).toBeEnabled({ timeout: 30_000 });
    await convertBtn.click();
    await page.getByText('Execution Status').click();
    await expect(page.getByText(/Pdf Convert completed/i)).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText(/CompletedSuccessfully/i)).toBeVisible({ timeout: 120_000 });
  }

  // Download PDF and assert filename ends with .pdf
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).click()]);
  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/\.pdf$/i);

  // Optionally save for CI inspection
  // await download.saveAs(`./test-results/downloads/${suggested}`);
});