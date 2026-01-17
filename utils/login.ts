// utils/login.ts
import { Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from <project-root>/config/.env
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

/**
 * Performs login to AB2 application using environment variables
 * @param page - Playwright page object
 */
export async function loginToAB2(page: Page): Promise<void> {
  // 1️⃣ Navigate to the AB2 application
  if (!process.env.AB2_URL) throw new Error('AB2_URL not defined in .env');
  await page.goto(process.env.AB2_URL);

  // 2️⃣ Click "Sign in with DFIN Account"
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();

  // 3️⃣ Fill email
  if (!process.env.AB2_EMAIL) throw new Error('AB2_EMAIL not defined in .env');
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.AB2_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();

  // 4️⃣ Fill password
  if (!process.env.AB2_PASSWORD) throw new Error('AB2_PASSWORD not defined in .env');
  await page.getByRole('textbox', { name: /Enter the password/i }).fill(process.env.AB2_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 5️⃣ Handle MFA (Microsoft Authenticator)
  const mfaOption = page.getByRole('button', { name: 'Approve a request on my Microsoft Authenticator app' });
  try {
    if (await mfaOption.isVisible({ timeout: 5000 })) {
      await mfaOption.click();
      console.log('>>> Please approve MFA on your phone now...');
      // Wait for navigation to dashboard as proof MFA is done
      await page.waitForURL('**/deals**', { timeout: 60000 });
    }
  } catch (err) {
    console.log('MFA screen did not appear, proceeding...');
  }

  // 6️⃣ Handle "Stay Signed In" prompt
  const staySignedInNo = page.locator('#idBtn_Back');
  try {
    if (await staySignedInNo.isVisible({ timeout: 5000 })) {
      await staySignedInNo.click();
    }
  } catch (err) {
    console.log('Stay signed in prompt not visible, continuing...');
  }

  console.log('✅ Login successful');
}
