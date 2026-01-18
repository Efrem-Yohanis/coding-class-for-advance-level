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
const dealData = testData['415047'];

test('415047 - File SEC information', async ({ page }) => {
  
  // --- LOGIN ---
  await loginToAB2(page);

  // --- Navigate to ABS-EE HOME & select company ---
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption({ label: dealData.companyName });


  // --- FIND DEAL IN TABLE & VIEW ---
  const rowRegex = new RegExp(dealData.dealName, 'i'); 
  const dealRow = page.getByRole('row', { name: rowRegex });
  await expect(dealRow).toBeVisible({ timeout: 30000 });
  await dealRow.getByRole('link', { name: /view/i }).click();

  // -------------------- 3. PERFORM VALIDATION (Step 5-7) ------------------
  await page.getByRole('button', { name: 'Perform Validation' }).click();
  
  const okButton = page.getByRole('button', { name: 'OK' });
  if (await okButton.isVisible({ timeout: 5000 })) {
      await page.getByRole('radio').first().check(); 
      await okButton.click();
  }

});

