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
 
});

==================================import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://13f-qa.azurewebsites.net/');
  await page.getByRole('button', { name: 'Sign in with DFIN Account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('biniyam.a.gebeyehu@dfinsolutions.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#i0118').press('CapsLock');
  await page.getByRole('textbox', { name: 'Enter the password for' }).fill('A');
  await page.getByRole('textbox', { name: 'Enter the password for' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Enter the password for' }).fill('Alem123123*');
  await page.getByRole('textbox', { name: 'Enter the password for' }).press('Enter');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.goto('https://13f-qa.azurewebsites.net/deals');
  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption('22');
  await page.getByRole('row', { name: 'Automation_Test1_Deal_001 02-' }).getByRole('link').click();
  await page.getByRole('link', { name: 'SEC' }).click();
  await page.getByText('Submission Information').click();
  await page.getByText('Filer CIK*').click();
  await page.getByRole('spinbutton').first().click();
  await page.getByRole('spinbutton').first().click();
  await page.getByRole('spinbutton').first().fill('0000990461');
  await page.locator('div').filter({ hasText: /^Filer CCC\*$/ }).click();
  await page.getByText('Filer CCC*').click();
  await page.getByRole('textbox').nth(4).click();
  await page.getByRole('textbox').nth(4).click();
  await page.getByRole('textbox').nth(4).fill('2trains*');
  await page.getByText('ABS-EE File Number*').click();
  await page.getByRole('textbox').nth(5).click();
  await page.getByRole('textbox').nth(5).click();
  await page.getByRole('textbox').nth(5).fill('002-12345');
  await page.getByText('Depositor CIK*').click();
  await page.getByRole('spinbutton').nth(1).click();
  await page.getByRole('spinbutton').nth(1).click();
  await page.getByRole('spinbutton').nth(1).click();
  await page.getByRole('spinbutton').nth(1).fill('0000990600');
  await page.locator('div').filter({ hasText: /^Sponsor CIK\*$/ }).click();
  await page.getByText('Sponsor CIK*').click();
  await page.getByRole('spinbutton').nth(2).click();
  await page.getByRole('spinbutton').nth(2).click();
  await page.getByRole('spinbutton').nth(2).click();
  await page.getByRole('spinbutton').nth(2).click();
  await page.getByRole('spinbutton').nth(2).click();
  await page.getByRole('spinbutton').nth(2).fill('00009904580');
  await page.getByRole('spinbutton').nth(2).press('ArrowRight');
  await page.getByRole('spinbutton').nth(2).fill('0000990458');
  await page.getByText('Asset Class*').click();
  await page.getByText('Select...').click();
  await page.getByText('Auto loans', { exact: true }).click();
  await page.getByText('Notification Emails').click();
  await page.getByText('Email Address').first().click();
  await page.locator('input[type="email"]').first().click();
  await page.locator('input[type="email"]').first().fill('biniyam.a.gebeyehu@dfinsolutions.com');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('ABS-EE Start Period*').click();
  await page.getByText('ABS-EE Start Period*').click();
  await page.getByText('ABS-EE Start Period*').click();
  await page.locator('.react-datepicker__input-container > .form-control').first().click();
  await page.locator('.react-datepicker__input-container > .form-control').first().click();
  await page.getByText('ABS-EE Start Period*').click();
  await page.locator('.react-datepicker__input-container > .form-control').first().click();
  await page.locator('.react-datepicker-ignore-onclickoutside').fill('02-01-2025');
  await page.getByRole('option', { name: 'Choose Saturday, February 1st,' }).click();
  await page.getByText('ABS-EE End Period*').click();
  await page.locator('div:nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control').click();
  await page.locator('.react-datepicker-ignore-onclickoutside').click();
  await page.locator('.react-datepicker-ignore-onclickoutside').fill('02-28-2025');
  await page.getByText('Submission ContactNamePhone').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Success', { exact: true }).click();
  await page.getByText('Saved successfully').click();
  await page.getByText('Success', { exact: true }).click();
  await page.getByText('Saved successfully').click();
});
                                              
