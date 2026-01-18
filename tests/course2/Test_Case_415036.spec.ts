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
  
// ---------------- SEC → Submission Information ---------------------------------
await page.getByRole('link', { name: 'SEC' }).click();
await expect(page.getByText('Submission Information')).toBeVisible();
await page.getByText('Submission Information').click();

// ---------------- Filer Information ----------------
await page.getByLabel('Filer CIK*').fill(dealData.filerCIK);
await page.getByLabel('Filer CCC*').fill(dealData.filerCCC);
await page.getByLabel('ABS-EE File Number*').fill(dealData.absEeFileNumber);

// ---------------- Entity CIKs ----------------
await page.getByLabel('Depositor CIK*').fill(dealData.depositorCIK);
await page.getByLabel('Sponsor CIK*').fill(dealData.sponsorCIK);

// ---------------- Asset Class ----------------
const assetClassInput = page.locator('input[id^="react-select"][id$="-input"]');
await assetClassInput.click();
await assetClassInput.fill(dealData.assetClass);
await assetClassInput.press('Enter');

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
======================================================
  <form class=""><label class="font-weight-bold mb-3 form-label">Submission Contact</label><div class="form-row"><div class="col"><label class="form-label">Name</label><input type="text" class="mb-3 form-control" value="DFIN Solutions"></div><div class="col"><label class="form-label">Phone Number</label><input type="text" class="form-control" value="404-350-2000"></div></div><div class="form-row"><div class="form-group col-md-6"><label class="form-label">SROS*</label><div class=" css-2b097c-container"><div class=" css-yk16xz-control"><div class=" css-1hwfws3"><div class="css-1rhbuit-multiValue"><div class="css-12jo7m5">NONE</div><div class="css-xb97g8"><svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg></div></div><div class="css-1g6gooi"><div class="" style="display: inline-block;"><input autocapitalize="none" autocomplete="off" autocorrect="off" id="react-select-65-input" spellcheck="false" tabindex="0" type="text" aria-autocomplete="list" value="" style="box-sizing: content-box; width: 2px; background: 0px center; border: 0px; font-size: inherit; opacity: 1; outline: 0px; padding: 0px; color: inherit;"><div style="position: absolute; top: 0px; left: 0px; visibility: hidden; height: 0px; overflow: scroll; white-space: pre; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;; font-weight: 400; font-style: normal; letter-spacing: normal; text-transform: none;"></div></div></div></div><div class=" css-1wy0on6"><div aria-hidden="true" class=" css-tlfecz-indicatorContainer"><svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg></div><span class=" css-1okebmr-indicatorSeparator"></span><div aria-hidden="true" class=" css-tlfecz-indicatorContainer"><svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg></div></div></div></div><input tabindex="-1" autocomplete="off" required="" value="[object Object]" style="opacity: 0; width: 100%; height: 0px; position: absolute;"></div></div><label class="font-weight-bold mb-3 mt-3 form-label">Submission Information</label><div class="form-row"><div class="form-group col-md-2"><label class="form-label">Filer CIK*</label><input maxlength="10" required="" type="number" class="form-control form-control-11" value="0000990461"></div><div class="col-md-2"><label class="form-label">Filer CCC*</label><input maxlength="8" minlength="8" required="" type="text" class="form-control" value="2trains*"></div><div class="col-md-4"><label class="form-label">ABS-EE File Number*</label><input required="" type="text" class="form-control" value="002-12345"></div></div><div class="mb-3 form-row"><div class="col-md-2"><label class="form-label">Depositor CIK*</label><input required="" type="number" class="form-control" value="0000990600"></div><div class="col-md-2"><label class="form-label">Sponsor CIK*</label><input required="" type="number" class="form-control" value="0000990458"></div><div class="col-md-4"><label class="form-label">Asset Class*</label><div class=" css-2b097c-container"><div class=" css-yk16xz-control"><div class=" css-1hwfws3"><div class="css-1rhbuit-multiValue"><div class="css-12jo7m5">Auto loans</div><div class="css-xb97g8"><svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg></div></div><div class="css-1g6gooi"><div class="" style="display: inline-block;"><input autocapitalize="none" autocomplete="off" autocorrect="off" id="react-select-66-input" spellcheck="false" tabindex="0" type="text" aria-autocomplete="list" value="" style="box-sizing: content-box; width: 2px; background: 0px center; border: 0px; font-size: inherit; opacity: 1; outline: 0px; padding: 0px; color: inherit;"><div style="position: absolute; top: 0px; left: 0px; visibility: hidden; height: 0px; overflow: scroll; white-space: pre; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;; font-weight: 400; font-style: normal; letter-spacing: normal; text-transform: none;"></div></div></div></div><div class=" css-1wy0on6"><div aria-hidden="true" class=" css-tlfecz-indicatorContainer"><svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg></div><span class=" css-1okebmr-indicatorSeparator"></span><div aria-hidden="true" class=" css-tlfecz-indicatorContainer"><svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-19bqh2r"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg></div></div></div></div><input tabindex="-1" autocomplete="off" required="" value="[object Object]" style="opacity: 0; width: 100%; height: 0px; position: absolute;"></div></div><div class="form-row"><div class="col"><label class="form-label">ABS-EE Start Period*</label><br><div class="react-datepicker-wrapper"><div class="react-datepicker__input-container"><input autocomplete="off" required="" class="form-control" value="02-01-2025"></div></div></div><div class="col"><label class="form-label">ABS-EE End Period*</label><br><div class="react-datepicker-wrapper"><div class="react-datepicker__input-container"><input autocomplete="off" required="" class="form-control" value="02-28-2025"></div></div></div></div><label class="font-weight-bold mb-3 mt-3 form-label">ABS-EE CoRegistrant</label><div><table role="table" class="table table-striped table-hover"><thead><tr role="row" class="table-header"><th colspan="1" role="columnheader">Co-Reg Filer CIK</th><th colspan="1" role="columnheader">Co-Reg Filer CCC</th><th colspan="1" role="columnheader">Co-Reg File Number</th><th colspan="1" role="columnheader"><button type="button" class="btn btn-primary">Add New Row</button></th></tr></thead><tbody role="rowgroup"></tbody></table></div><label class="font-weight-bold mb-3 mt-2 form-label">Notification Emails</label><div class="form-row"><div class="col-md-2"><div class="form-group"><label class="form-label">Email Address</label><input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$" type="email" class="form-control" value="biniyam.a.gebeyehu@dfinsolutions.com"></div></div><div class="col-md-2"><div class="form-group"><label class="form-label">Email Address</label><input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$" type="email" class="form-control" value=""></div></div><div class="col-md-2"><div class="form-group"><label class="form-label">Email Address</label><input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$" type="email" class="form-control" value=""></div></div><div class="col-md-2"><div class="form-group"><label class="form-label">Email Address</label><input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$" type="email" class="form-control" value=""></div></div><div class="col-md-2"><div class="form-group"><label class="form-label">Email Address</label><input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$" type="email" class="form-control" value=""></div></div></div><div class="form-row"><button type="submit" class="m-2 btn btn-primary">Save</button></div></form>
