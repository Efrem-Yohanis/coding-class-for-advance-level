import { test, expect } from '@playwright/test';
import { loginToAB2 } from '../../utils/login';
import { deleteDealIfExists } from '../../utils/dealActions';
import path from 'path';
import fs from 'fs';

// Load test data from JSON
const testDataPath = path.resolve(__dirname, '..', '..', 'config', 'test-data.json');
const rawData = fs.readFileSync(testDataPath, 'utf-8');
const testData = JSON.parse(rawData);

// Use the key for this specific test
const dealData = testData['415036'];

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  // --- FILE PATH ---
  const FILE_PATH = path.resolve(__dirname, '..', '..', 'Resource', dealData.filePath);

  // --- LOGIN ---
  await loginToAB2(page);

  // --- Navigate to ABS-EE HOME & select company ---
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption({ label: dealData.companyName });

  // --- DELETE EXISTING DEAL IF ANY ---
  await deleteDealIfExists(page, dealData.dealName);

  // --- CREATE NEW DEAL ---
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByRole('textbox', { name: 'Job Number' }).fill(dealData.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(dealData.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(dealData.periodEnd);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(dealData.targetFilingDate);
  await page.locator('#type').selectOption({ label: dealData.filingType });
  await page.locator('#absSchema').selectOption({ label: dealData.schemaType });
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // --- FIND DEAL IN TABLE & VIEW ---
  const rowRegex = new RegExp(dealData.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // --- UPLOAD FILE ---
  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(FILE_PATH);

   // ---------- 6. VERIFY STATUS ----------
  const statusContainer = page.locator('#page-content-wrapper');
  // Ensuring we see the "CompletedSuccessfully" message
  await expect(statusContainer).toContainText('Finished Upload ABSEE', { timeout: 180000 });

//-----------------------------------new add part ----------------------------------
  // ---------------- SEC → Submission Information (inside iframe) ----------------
await page.getByRole('link', { name: 'SEC' }).click();

  const secFrameLocator = page.frameLocator(
  'iframe[title*="SEC" i], iframe[src*="submission" i], iframe[src*="sec" i]'
);

// ---------------- Filer Information ----------------
const filerCikInput = secFrameLocator.locator('label.form-label:has-text("Filer CIK")')
  .locator('xpath=following-sibling::input[1]');
await filerCikInput.fill(dealData.filerCIK);

const filerCccInput = secFrameLocator.locator('label.form-label:has-text("Filer CCC")')
  .locator('xpath=following-sibling::input[1]');
await filerCccInput.fill(dealData.filerCCC);

const absEeFileNumberInput = secFrameLocator.locator('label.form-label:has-text("ABS-EE File Number")')
  .locator('xpath=following-sibling::input[1]');
await absEeFileNumberInput.fill(dealData.absEeFileNumber);

// ---------------- Entity CIKs ----------------
const depositorCikInput = secFrameLocator.locator('label.form-label:has-text("Depositor CIK")')
  .locator('xpath=following-sibling::input[1]');
await depositorCikInput.fill(dealData.depositorCIK);

const sponsorCikInput = secFrameLocator.locator('label.form-label:has-text("Sponsor CIK")')
  .locator('xpath=following-sibling::input[1]');
await sponsorCikInput.fill(dealData.sponsorCIK);

// ---------------- Asset Class (dropdown) ----------------
const assetClassInput = secFrameLocator.locator('input[id^="react-select"][id$="-input"]');
await assetClassInput.click();
await assetClassInput.fill(dealData.assetClass);
await assetClassInput.press('Enter');

// ---------------- ABS-EE Period Dates ----------------
const startPeriodInput = secFrameLocator.locator('label.form-label:has-text("ABS-EE Start Period")')
  .locator('xpath=following::div[contains(@class, "react-datepicker__input-container")][1]/input[1]');
await startPeriodInput.fill(dealData.absPeriodStart);

const endPeriodInput = secFrameLocator.locator('label.form-label:has-text("ABS-EE End Period")')
  .locator('xpath=following::div[contains(@class, "react-datepicker__input-container")][1]/input[1]');
await endPeriodInput.fill(dealData.absPeriodEnd);

// ---------------- Notification Email ----------------
const emailInput = secFrameLocator.locator('label.form-label:has-text("Email Address")')
  .first()
  .locator('xpath=following-sibling::input[1]');
await emailInput.fill(dealData.notificationEmail);

// ---------------- Save Submission Info ----------------
await secFrameLocator.getByRole('button', { name: /^Save$/i }).click();

// ---------------- Assertions ----------------
await expect(secFrameLocator.getByText('Saved successfully')).toBeVisible();
await expect(secFrameLocator.getByText('Success', { exact: true })).toBeVisible();
  
});
             
