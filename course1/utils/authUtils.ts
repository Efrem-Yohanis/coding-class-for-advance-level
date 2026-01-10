import { Page, expect } from '@playwright/test';

export async function loginToAB2(page: Page) {
  const url = process.env.AB2_BASE_URL;
  const email = process.env.USER_EMAIL;

  if (!url || !email) {
    throw new Error(
      'Environment variables AB2_BASE_URL or USER_EMAIL are missing.'
    );
  }

  // Step 1.1: Open AB2 site
  await page.goto(url);

  // Step 1.2: Sign in with DFIN Account
  const signInButton = page.getByRole('button', { name: 'Sign in with DFIN Account' });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // Step 1.3: Enter email
  const emailInput = page.getByRole('textbox', { name: 'Email address' });
  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);

  // Step 1.4: Continue
  await page.getByRole('button', { name: 'Continue' }).click();

  // Verification: AB2 landing page loaded
  await expect(
    page.getByRole('button', { name: 'Create New Deal' })
  ).toBeVisible({ timeout: 15000 });
}
