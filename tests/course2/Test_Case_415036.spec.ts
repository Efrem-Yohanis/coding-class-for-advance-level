const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const testData = require('../config/test-data.json');
const { loginToAB2 } = require('../utils/login');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });
test.setTimeout(180_000);

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  const data = testData['415036'];
  const FILE_PATH = path.resolve(__dirname, '../../resources', data.filePath);

  // ---------- 1. LOGIN ----------
  await loginToAB2(page);

  // ---------- 2. ABS-EE HOME & COMPANY SELECTION ----------
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  
  // Select Company from standard <select>
  await page.locator('#selectedCompany').selectOption({ label: data.companyName });

  // ---------- 3. CREATE NEW DEAL ----------
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await expect(page.getByText('Filings Details')).toBeVisible();

  await page.getByRole('textbox', { name: 'Job Number' }).fill(data.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(data.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(data.periodEnd);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(data.targetFilingDate);

  // Use IDs from your HTML for standard select elements
  await page.locator('#type').selectOption({ label: data.filingType });
  await page.locator('#absSchema').selectOption({ label: data.schemaType });

  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // ---------- 4. FIND DEAL IN TABLE & VIEW ----------
  const rowRegex = new RegExp(data.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  
  // Wait for the specific row to appear in the dashboard table
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // ---------- 5. UPLOAD FILE ----------
  const uploadButton = page.getByRole('button', { name: 'Upload' });
  await expect(uploadButton).toBeVisible();
  
  // setInputFiles handles the OS file dialog automatically
  await page.locator('input[type="file"]').setInputFiles(FILE_PATH);

  // ---------- 6. VERIFY STATUS ----------
  const statusContainer = page.locator('#page-content-wrapper');
  // Ensuring we see the "CompletedSuccessfully" message
  await expect(statusContainer).toContainText('Finished Upload ABSEE', { timeout: 180000 });
 
});

