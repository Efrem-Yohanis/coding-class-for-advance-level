const { test, expect } = require('@playwright/test');
const testData = require('../utility/test_data.json');

// Verify Submit Filing opens Submission Details and shows SEC values
test.setTimeout(120_000);

test('415049 - Submit Filing opens Submission Details and shows SEC values', async ({ page }) => {
  const data = testData['415049'] || {};
  const jobNumber = data.jobNumber || '99';
  const dealName = data.dealName || '99 submission proof to be';
  const rowRegex = new RegExp(`${jobNumber} ${dealName}`);

  const expected = {
    filerCIK: data.filerCIK || '0000990461',
    filerCCC: data.filerCCC || '2trains*',
    absFileNumber: data.fileNumber || '002-12345',
    depositorCIK: data.depositorCIK || '0000990600',
    sponsorCIK: data.sponsorCIK || '0000990458',
    assetClass: data.assetClass || 'Auto leases'
  };

  // LOGIN (mandatory)
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL || 'test@local');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.TEST_USER_PASSWORD || 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // MFA handling
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

  // Open deal
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await expect(page.getByRole('row', { name: rowRegex })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('row', { name: rowRegex }).getByRole('link', { name: /view|open/i }).click();

  // Verify Submit Filing exists and click
  const submitLink = page.getByRole('link', { name: 'Submit Filing' });
  await expect(submitLink).toBeVisible();
  await expect(submitLink).toBeEnabled();
  await submitLink.click();

  // Assert Submission Details and values
  await expect(page.getByRole('heading', { name: 'Submission Details' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(expected.filerCIK)).toBeVisible();
  await expect(page.getByText(expected.filerCCC)).toBeVisible();
  await expect(page.getByText(expected.absFileNumber)).toBeVisible();
  await expect(page.getByText(expected.depositorCIK)).toBeVisible();
  await expect(page.getByText(expected.sponsorCIK)).toBeVisible();
  await expect(page.getByText(expected.assetClass)).toBeVisible();
});