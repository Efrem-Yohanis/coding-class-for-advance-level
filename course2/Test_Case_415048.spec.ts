const { test, expect } = require('@playwright/test');
const testData = require('./testData.json');

// Verify SEC save enables Submit Filing
test.setTimeout(120_000);

test('415048 - SEC save enables Submit Filing', async ({ page }) => {
  const data = testData['415048'] || {};
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || '99 submission proof to be';
  const rowRegex = new RegExp(`${jobNumber} ${dealName}`);

  // ---------- LOGIN (mandatory) ----------
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@local');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  if (await mfaOption.isVisible({ timeout: 5000 })) {
    await mfaOption.click();
    await page.waitForTimeout(20000);
  }

  // Stay signed in
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }

  // ---------- Open deal and SEC page ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  await page.getByRole('link', { name: 'SEC' }).click();
  await expect(page.getByText('Submission Contact')).toBeVisible({ timeout: 10_000 });

  // Fill required fields using form labels where possible
  await page.getByLabel('Filer CIK').fill(data.filerCIK || '0000990461');
  await page.getByLabel('Filer CCC').fill(data.filerCCC || '2trains*');
  await page.getByLabel('ABS-EE File Number').fill(data.fileNumber || '002-12345');
  await page.getByLabel('Depositor CIK').fill(data.depositorCIK || '0000990600');
  await page.getByLabel('Sponsor CIK').fill(data.sponsorCIK || '0000990458');
  // Asset class selection - fallback to clicking visible text
  if (await page.getByText('Auto leases', { exact: true }).isVisible()) {
    await page.getByText('Auto leases', { exact: true }).click();
  }

  // Save and assert success
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/Saved successfully|Success/i)).toBeVisible({ timeout: 10_000 });

  // Verify Submit Filing link is available and navigable
  const submitLink = page.getByRole('link', { name: 'Submit Filing' });
  await expect(submitLink).toBeVisible();
  await expect(submitLink).toBeEnabled();
  await submitLink.click();
  await expect(page.getByRole('heading', { name: 'Submission Details' })).toBeVisible({ timeout: 30_000 });
});