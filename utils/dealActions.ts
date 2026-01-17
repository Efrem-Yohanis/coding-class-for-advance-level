import { Page, expect } from '@playwright/test';

/**
 * Checks for an existing deal by name and deletes it if found.
 * @param page The Playwright Page object
 * @param dealName The name of the deal to search for and delete
 */
export async function deleteDealIfExists(page: Page, dealName: string): Promise<void> {
  const dealNameRegex = new RegExp(dealName, 'i');

  // Locate the row containing the deal name
  const existingDealRow = page.getByRole('row', { name: dealNameRegex });

  // count() returns the number of elements matching the locator
  if (await existingDealRow.count() > 0) {
    console.log(`Cleanup: Deal "${dealName}" found. Deleting...`);

    // Prepare to handle the browser's native 'confirm' dialog
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept();
    });

    // Click delete inside the specific row
    await existingDealRow.getByRole('button', { name: /delete/i }).click();

    // Ensure the row is removed from the DOM before moving forward
    await existingDealRow.waitFor({ state: 'detached', timeout: 10000 });

    console.log(`Cleanup: Deal "${dealName}" deleted successfully.`);
  } else {
    console.log(`Cleanup: No existing deal found for "${dealName}".`);
  }
}
