import { test, expect } from '@playwright/test';
import { loginToAB2 } from '../../utils/login';
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

  // --- CREATE NEW DEAL ---
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByRole('textbox', { name: 'Job Number' }).fill(dealData.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(dealData.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(dealData.periodEnd);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(dealData.targetFilingDate);
  await page.locator('#type').selectOption({ label: dealData.filingType });
  await page.locator('#absSchema').selectOption({ label: dealData.schemaType });
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // ---------- FIND DEAL IN TABLE & VIEW ----------
  const rowRegex = new RegExp(data.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  
  // Wait for the specific row to appear in the dashboard table
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();
  
  // --- UPLOAD FILE ---
  await page.locator('input[type="file"]').setInputFiles(FILE_PATH);

  // --- VERIFY STATUS ---
  const statusContainer = page.locator('#page-content-wrapper');
  await expect(statusContainer).toContainText('Finished Upload ABSEE', { timeout: 180_000 });
});
