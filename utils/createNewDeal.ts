import { Page, expect } from '@playwright/test';

// Define an interface to ensure the data passed in is correct
export interface DealData {
  jobNumber: string;
  dealName: string;
  periodEnd: string;
  targetFilingDate: string;
  filingType: string;
  schemaType: string;
}

/**
 * Helper to handle the 'Create New Deal' form workflow
 */
export async function createNewDeal(page: Page, data: DealData): Promise<void> {
  // Click the primary action button to open the form
  await page.getByRole('button', { name: 'Create New Deal' }).click();
  
  // Wait for form heading to ensure page has loaded
  await expect(page.getByText('Filings Details')).toBeVisible();

  // Fill text fields using labels
  await page.getByRole('textbox', { name: 'Job Number' }).fill(data.jobNumber);
  await page.getByRole('textbox', { name: 'Deal Name*' }).fill(data.dealName);
  await page.getByRole('textbox', { name: 'Period End Date*' }).fill(data.periodEnd);
  await page.getByRole('textbox', { name: 'Target Filing Date*' }).fill(data.targetFilingDate);

  // Select from dropdowns using the IDs provided in your HTML
  await page.locator('#type').selectOption({ label: data.filingType });
  await page.locator('#absSchema').selectOption({ label: data.schemaType });

  // Click the final Create button
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  // Verification: Ensure the new deal actually appears in the list before continuing
  const dealRow = page.getByRole('row', { name: new RegExp(data.dealName, 'i') });
  await expect(dealRow).toBeVisible({ timeout: 15000 });
  
  console.log(`Success: Deal "${data.dealName}" created.`);
}