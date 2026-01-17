import { Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

/**
 * Performs login to AB2 application using environment variables
 * @param page - Playwright page object
 */
export async function loginToAB2(page: Page): Promise<void> {
  // 1. Navigate to the application
  await page.goto(process.env.AB2_URL)
  // 2. Click sign in button
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();

  // 3.Fill email
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.AB2_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();

  // 4.Fill password
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.AB2_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 5. Handle MFA
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  try {
    if (await mfaOption.isVisible({ timeout: 5000 })) {
      await mfaOption.click();
      console.log('>>> Please approve MFA on your phone now...');
      // Wait for navigation to dashboard as proof MFA is done
      await page.waitForURL('**/deals**', { timeout: 60000 });
    }
  } catch (e) {
    console.log('MFA screen did not appear, proceeding...');
  }

  // Handle "Stay Signed In" prompt
  const staySignedInNo = page.locator('#idBtn_Back');
  if (await staySignedInNo.isVisible({ timeout: 5000 })) {
    await staySignedInNo.click();
  }
}