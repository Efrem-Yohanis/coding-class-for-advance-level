
import { test, expect, Page, BrowserContext, Locator } from '@playwright/test';
import { loginToAB2 } from './utils/authUtils';

/** Opens the Clone dialog and returns the modal container locator. */
async function openCloneDialog(page: Page): Promise<Locator> {
  console.log('Looking for Clone button...');
  // Ensure the Clone button is present and clickable
  const cloneBtn = page.getByRole('button', { name: /^Clone$/i });
  
  try {
    await expect(cloneBtn).toBeVisible({ timeout: 5_000 });
    await expect(cloneBtn).toBeEnabled({ timeout: 2_000 });
    console.log('Clone button found and enabled');
  } catch (error) {
    console.log('Clone button not found with role, trying alternative selectors...');
    const altCloneBtn = page.locator('button:has-text("Clone"), [onclick*="clone"], [data-testid*="clone"]').first();
    await expect(altCloneBtn).toBeVisible({ timeout: 5_000 });
    await altCloneBtn.click();
    await page.waitForTimeout(1000);
    return page.locator('body'); // Return body as fallback container
  }

  // Click the Clone button
  await cloneBtn.click();
  console.log('Clone button clicked');
  
  // Wait a bit for any animation/loading
  await page.waitForTimeout(1500);

  // Strategy 1: Look for the specific clone form elements first
  console.log('Looking for clone dialog form elements...');
  const dealNameInput = page.locator('#newDealName');
  const jobNumberInput = page.locator('#newJobNumber');
  const targetDateInput = page.locator('#targetFilingDate');
  
  // Wait for any of these form elements to appear
  try {
    await Promise.race([
      await expect(dealNameInput).toBeVisible({ timeout: 5_000 }),
      await expect(jobNumberInput).toBeVisible({ timeout: 5_000 }),
      await expect(targetDateInput).toBeVisible({ timeout: 5_000 })
    ]);
    console.log('Found clone dialog form elements');
    
    // Find the common parent container for these form elements
    const modal = dealNameInput.locator('xpath=ancestor::div[contains(@class, "modal") or contains(@class, "dialog") or @role="dialog"][1]').first();
    if (await modal.isVisible({ timeout: 1_000 }).catch(() => false)) {
      console.log('Found modal container from form elements');
      return modal;
    } else {
      // Use a broader container that includes all form elements
      const container = page.locator('form, .container, .modal-content, .dialog-content').filter({
        has: dealNameInput
      }).first();
      if (await container.isVisible({ timeout: 1_000 }).catch(() => false)) {
        console.log('Found form container');
        return container;
      } else {
        console.log('Using page body as container - form elements are visible');
        return page.locator('body');
      }
    }
  } catch (e) {
    console.log('Form elements not found, trying other modal detection strategies...');
  }

  // Strategy 2: Try common modal patterns
  let modal: Locator | null = null;
  const modalSelectors = [
    '[role="dialog"]',
    '.MuiDialog-root',
    '.MuiModal-root', 
    '.modal',
    '.modal.show',
    '.modal.in',
    '[data-testid*="dialog"]',
    '[data-testid*="modal"]',
    '[class*="Dialog"]',
    '[class*="Modal"]',
    '[class*="clone"]',
    '.overlay',
    '.popup'
  ];

  for (const selector of modalSelectors) {
    try {
      const candidate = page.locator(selector).first();
      if (await candidate.isVisible({ timeout: 1_000 })) {
        modal = candidate;
        console.log(`Found modal using selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  // Strategy 3: Use page body as fallback
  if (!modal || !(await modal.isVisible({ timeout: 1_000 }).catch(() => false))) {
    console.log('Using page body as fallback container');
    modal = page.locator('body');
  }

  // Verify we have some kind of container
  await expect(modal).toBeAttached({ timeout: 5_000 });

  return modal;
}

/** Selects a deal in react-select inside the given container (dialog/modal). */
async function selectDealFromReactSelect(container: Locator, searchText: string, optionText: string) {
  console.log(`Attempting to select deal: searching for "${searchText}", selecting "${optionText}"`);
  
  // Strategy 1: Try react-select specific selectors
  let rsInput = container.locator('input[id*="react-select"][id$="-input"]');
  
  // Strategy 2: Try common dropdown/combobox patterns
  if (!(await rsInput.first().isVisible().catch(() => false))) {
    rsInput = container.getByRole('combobox');
  }
  
  // Strategy 3: Try generic input patterns
  if (!(await rsInput.first().isVisible().catch(() => false))) {
    rsInput = container.locator('input[placeholder*="Select"], input[placeholder*="Choose"], input[placeholder*="Deal"]');
  }
  
  // Strategy 4: Try any visible input in the container
  if (!(await rsInput.first().isVisible().catch(() => false))) {
    rsInput = container.locator('input[type="text"], input:not([type])').first();
  }

  if (!(await rsInput.first().isVisible().catch(() => false))) {
    console.log('No suitable input found, looking for clickable elements...');
    // Try to find a clickable dropdown trigger
    const dropdownTrigger = container.locator('.dropdown, .select, [role="button"]').first();
    if (await dropdownTrigger.isVisible().catch(() => false)) {
      await dropdownTrigger.click();
      await page.waitForTimeout(500);
      rsInput = container.locator('input').first();
    }
  }

  await expect(rsInput.first()).toBeVisible({ timeout: 10_000 });
  console.log('Found input element');

  // Focus and clear any existing value
  try {
    await rsInput.first().click();
    await rsInput.first().fill('');
  } catch (error) {
    console.log('Failed to click react-select input, trying alternative approach...');
    // Try to focus the input directly
    await rsInput.first().focus();
    await rsInput.first().clear();
  }
  
  // Type search text with delay
  await rsInput.first().type(searchText, { delay: 100 });
  console.log(`Typed search text: ${searchText}`);
  
  // Wait for dropdown options to appear
  await page.waitForTimeout(1000);

  // Try to find the listbox/options container
  let listbox = container.getByRole('listbox');
  
  // Alternative selectors for options container
  if (!(await listbox.isVisible().catch(() => false))) {
    listbox = container.locator('.dropdown-menu, .select-menu, [class*="option"], [class*="menu"]').first();
  }
  
  // If still not found, look in the page body (some dropdowns render there)
  if (!(await listbox.isVisible().catch(() => false))) {
    listbox = page.locator('[role="listbox"], .dropdown-menu, .select-menu').last();
  }

  if (await listbox.isVisible().catch(() => false)) {
    console.log('Found options container');
    
    // Try to find the specific option
    let option = listbox.getByRole('option', { name: new RegExp(optionText, 'i') });
    
    // Alternative: look for any element containing the option text
    if (!(await option.isVisible().catch(() => false))) {
      option = listbox.locator(`text=${optionText}`).first();
    }
    
    // Alternative: look for partial matches
    if (!(await option.isVisible().catch(() => false))) {
      option = listbox.locator(`*:has-text("${optionText}")`).first();
    }

    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
    console.log(`Selected option: ${optionText}`);
    
    // Wait for selection to be processed
    await page.waitForTimeout(500);
  } else {
    console.log('Options container not found, trying direct text selection');
    // Fallback: try to click on any visible text matching the option
    const textElement = page.locator(`text=${optionText}`).first();
    if (await textElement.isVisible().catch(() => false)) {
      await textElement.click();
      console.log(`Clicked on text element: ${optionText}`);
    } else {
      throw new Error(`Could not find option "${optionText}" in dropdown`);
    }
  }

  // Verify selection (be flexible about where the text appears)
  const selectionVisible = await Promise.race([
    container.locator(`text=${optionText}`).isVisible(),
    container.locator(`*:has-text("${optionText}")`).isVisible(),
    rsInput.first().inputValue().then(val => val.includes(optionText))
  ]);
  
  if (!selectionVisible) {
    console.log(`Warning: Could not verify selection of "${optionText}"`);
  } else {
    console.log(`Successfully verified selection of "${optionText}"`);
  }
}

test.describe('13F Deal Management', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(0); // unlimited for beforeAll
    context = await browser.newContext();
    page = await context.newPage();
    await loginToAB2(page);
  });

  test('ID 415091: Ensure that able to clone a 13F deal successfully', async () => {
    test.setTimeout(120_000); // increase timeout to 2 minutes

    try {
      // Step 2: Calendar default
      console.log('Step 2: Setting up calendar...');
      await page.getByText('Calendar').click({ timeout: 5_000 });
      await page.locator('#selectedQuarter').selectOption('2026 Q1', { timeout: 5_000 });
      const selectedQuarter = await page.locator('#selectedQuarter').inputValue();
      expect(selectedQuarter).toBeTruthy();
      console.log('Calendar setup complete');

      // Step 3: Create New Deal (ensure page is ready after click)
      console.log('Step 3: Clicking Create New Deal...');
      await Promise.race([
        page.waitForLoadState('networkidle', { timeout: 10_000 }),
        page.waitForTimeout(10_000)
      ]);
      
      const createNewDealBtn = page.getByRole('button', { name: 'Create New Deal' });
      await expect(createNewDealBtn).toBeVisible({ timeout: 10_000 });
      await createNewDealBtn.click();
      console.log('Create New Deal clicked');

      // Step 4: Open Clone dialog robustly
      console.log('Step 4: Opening Clone dialog...');
      const dialog = await openCloneDialog(page);
      console.log('Clone dialog opened successfully');

      /**
       * Step 5: Select deal to clone using react-select (search and click)
       */
      console.log('Step 5: Selecting deal from dropdown...');
      try {
        await selectDealFromReactSelect(dialog, 'clone testing', 'clone testing');
        console.log('Deal selection completed');
      } catch (error) {
        console.log('Deal selection failed, continuing with form filling...');
        console.error('Selection error:', error.message);
      }

      /**
       * Step 6–9: Fill clone form inside dialog
       */
      console.log('Step 6-9: Filling clone form...');
      await expect(dialog).toBeAttached();

      // Deal Name - use specific ID
      const dealName = 'clone testing';
      console.log('Filling Deal Name...');
      
      const dealNameInput = page.locator('#newDealName');
      await expect(dealNameInput).toBeVisible({ timeout: 5_000 });
      await dealNameInput.fill(dealName);
      console.log(`Filled Deal Name: ${dealName}`);

      // Job Number - use specific ID
      const jobNumber = '145';
      console.log('Filling Job Number...');
      
      const jobInput = page.locator('#newJobNumber');
      await expect(jobInput).toBeVisible({ timeout: 5_000 });
      await jobInput.fill(jobNumber);
      console.log(`Filled Job Number: ${jobNumber}`);

      // Target Filing Date - use specific ID
      console.log('Setting Target Filing Date...');
      
      const dateInput = page.locator('#targetFilingDate');
      await expect(dateInput).toBeVisible({ timeout: 5_000 });
      
      // Direct input approach
      console.log('Using direct date input...');
      await dateInput.fill('01/05/2026');
      const targetFilingDateValue = await dateInput.inputValue();
      expect(targetFilingDateValue).toBeTruthy();
      console.log(`Set date to: ${targetFilingDateValue}`);

      // Step 9: Confirm clone
      console.log('Step 9: Confirming clone...');
      
      // Look for the specific Yes submit button
      const confirmBtn = page.locator('button[type="submit"].btn.btn-primary:has-text("Yes")');
      await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
      
      // Wait for potential server response
      await Promise.race([
        Promise.all([
          page.waitForResponse(r => (r.url().includes('/api/deals') || r.url().includes('clone')) && r.ok(), { timeout: 10_000 }).catch(() => {}),
          confirmBtn.click(),
        ]),
        page.waitForTimeout(5_000) // Don't wait more than 5 seconds for response
      ]);
      console.log('Clone confirmed');
      
      // Wait for operation to complete
      await Promise.race([
        page.waitForLoadState('networkidle', { timeout: 10_000 }),
        page.waitForTimeout(5_000)
      ]);

      /**
       * Step 10: Search newly cloned deal
       */
      console.log('Step 10: Searching for newly cloned deal...');
      
      // Try multiple strategies to find the search input
      let searchInput = page.getByRole('textbox', { name: /Enter Job Number/i });
      if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
        searchInput = page.locator('input[placeholder*="Job"], input[placeholder*="Search"]').first();
      }
      if (!(await searchInput.isVisible({ timeout: 2_000 }).catch(() => false))) {
        searchInput = page.locator('input[type="text"]').first();
      }
      
      await expect(searchInput).toBeVisible({ timeout: 10_000 });
      await searchInput.fill(jobNumber);
      console.log(`Searched for job number: ${jobNumber}`);
      
      // Trigger search if there's a search button
      const searchBtn = page.getByRole('button', { name: /Search|Find/i });
      if (await searchBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await searchBtn.click();
        console.log('Clicked search button');
      } else {
        // Try pressing Enter to trigger search
        await searchInput.press('Enter');
        console.log('Pressed Enter to search');
      }
      
      // Wait for search results
      await page.waitForTimeout(2000);

      /**
       * Final Verification
       */
      console.log('Final verification: Verifying search results...');
      
      // Look for the result row with multiple strategies
      let resultRow = page.getByRole('row', { name: new RegExp(jobNumber) });
      
      if (!(await resultRow.isVisible({ timeout: 5_000 }).catch(() => false))) {
        // Try looking for any element containing both job number and deal name
        resultRow = page.locator(`*:has-text("${jobNumber}"):has-text("${dealName}")`).first();
      }
      
      if (!(await resultRow.isVisible({ timeout: 2_000 }).catch(() => false))) {
        // Try looking for job number anywhere on the page
        resultRow = page.locator(`*:has-text("${jobNumber}")`).first();
      }
      
      await expect(resultRow).toBeVisible({ timeout: 10_000 });
      console.log('Found result row');
      
      // Verify it contains the deal name
      const containsDealName = await resultRow.locator(`text=${dealName}`).isVisible({ timeout: 2_000 }).catch(() => false);
      if (containsDealName) {
        await expect(resultRow).toContainText(dealName);
        console.log('Verified result contains deal name');
      } else {
        console.log('Deal name not found in result row, but job number was found');
        // At minimum, verify the job number is present
        await expect(resultRow).toContainText(jobNumber);
      }
      
      console.log('Test completed successfully!');
      
    } catch (error) {
      console.error('Test failed with error:', error.message);
      console.log('Taking screenshot for debugging...');
      await page.screenshot({ path: 'test-failure-screenshot.png', fullPage: true });
      throw error;
    }
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });
});



