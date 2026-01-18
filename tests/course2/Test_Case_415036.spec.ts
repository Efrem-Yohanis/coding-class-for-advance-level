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

  // --- 1. LOGIN ---
  await loginToAB2(page);

  // --- 2. Navigate to ABS-EE HOME & select company ---
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption({ label: dealData.companyName });

  // --- 3. DELETE EXISTING DEAL IF ANY ---
  await deleteDealIfExists(page, dealData.dealName);

  // --- 4. CREATE NEW DEAL ---
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByRole('textbox', { name: 'Job Number' }).fill(dealData.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(dealData.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(dealData.periodEnd);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(dealData.targetFilingDate);
  await page.locator('#type').selectOption({ label: dealData.filingType });
  await page.locator('#absSchema').selectOption({ label: dealData.schemaType });
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // --- 5. FIND DEAL IN TABLE & VIEW ---
  const rowRegex = new RegExp(dealData.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // --- 6. UPLOAD FILE ---
  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(FILE_PATH);

  // ---------- 7. VERIFY STATUS ----------
  const statusContainer = page.locator('#page-content-wrapper');
  // Ensuring we see the "CompletedSuccessfully" message
  await expect(statusContainer).toContainText('Finished Upload ABSEE', { timeout: 180000 });
 
 // ---------------- SEC → Submission Information ----------------
await page.getByRole('link', { name: 'SEC' }).click();
await expect(page.getByText('Submission Information')).toBeVisible();
await page.getByText('Submission Information').click();

// Assert form loaded
await expect(page.getByLabel('Filer CIK*')).toBeVisible();

// ---------------- Filer Information ----------------
await page.getByLabel('Filer CIK*').fill(dealData.filerCIK);
await page.getByLabel('Filer CCC*').fill(dealData.filerCCC);
await page.getByLabel('ABS-EE File Number*').fill(dealData.absEeFileNumber);

// ---------------- Entity CIKs ----------------
await page.getByLabel('Depositor CIK*').fill(dealData.depositorCIK);
await page.getByLabel('Sponsor CIK*').fill(dealData.sponsorCIK);

// ---------------- Asset Class ----------------
await page.getByLabel('Asset Class*').click();
await page.getByRole('option', {
  name: dealData.assetClass,
  exact: true
}).click();

// ---------------- ABS-EE Period Dates ----------------
await page.getByLabel('ABS-EE Start Period*').fill(dealData.absPeriodStart);
await page.getByLabel('ABS-EE End Period*').fill(dealData.absPeriodEnd);

// ---------------- Notification Email ----------------
await page.getByLabel('Email Address').fill(dealData.notificationEmail);

// ---------------- Save Submission Info ----------------
await page.getByRole('button', { name: 'Save' }).click();

// ---------------- Assertions ----------------
await expect(page.getByText('Saved successfully')).toBeVisible();
await expect(page.getByText('Success', { exact: true })).toBeVisible();

});
                                              
