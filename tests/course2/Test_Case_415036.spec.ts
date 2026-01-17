import { test, expect } from '@playwright/test';
import { loginToAB2 } from '../../utils/login';
import { loginToAB2 } from '../../utils/dealAction';
import path from 'path';

test('415036 - Create and upload ABSEE deal', async ({ page }) => {
  const FILE_PATH = path.resolve(__dirname, '..', '..', 'Resource', 'Blast1-UATDecember2025_1229.zip');

  // --- LOGIN ---
  await loginToAB2(page);

  // --- Continue with ABS-EE test ---
  const COMPANY_NAME = 'Automation';
  const JOB_NUMBER = 'JOB-12345';
  const DEAL_NAME = 'Automation_Test_Deal_001';
  const PERIOD_END = '2023-12-31';
  const TARGET_FILING_DATE = '2026-01-16';
  const SCHEMA_TYPE = 'Auto Loan';
  const FILING_TYPE = 'ABS-EE';

  await page.getByRole('button', { name: 'ABS-EE Deal Home' }).click();
  await page.locator('#selectedCompany').selectOption({ label: COMPANY_NAME });

  await page.getByRole('button', { name: 'Create New Deal' }).click();
  await page.getByRole('textbox', { name: 'Job Number' }).fill(JOB_NUMBER);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(DEAL_NAME);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(PERIOD_END);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(TARGET_FILING_DATE);

  await page.locator('#type').selectOption({ label: FILING_TYPE });
  await page.locator('#absSchema').selectOption({ label: SCHEMA_TYPE });

  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // --- UPLOAD FILE ---
  await page.locator('input[type="file"]').setInputFiles(FILE_PATH);

  // --- VERIFY STATUS ---
  const statusContainer = page.locator('#page-content-wrapper');
  await expect(statusContainer).toContainText('Finished Upload ABSEE', { timeout: 180_000 });
});
