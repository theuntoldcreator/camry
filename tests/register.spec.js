const { test, expect } = require('@playwright/test');

test.use({
    headless: true,
    viewport: { width: 1280, height: 720 }
});

test('Guest Registration Flow', async ({ page }) => {
    // ===== CONFIG =====
    const PROPERTY_SEARCH = "Rayzor";
    const UNIT = "2549cd";
    const PIN = "1492";

    // CHANGE THESE:
    const CAR_YEAR = "2000";
    const CAR_MAKE_MODEL = "Toyota / Camry"; // must match dropdown logic/verification
    const CAR_COLOR = "Blue";             // must match dropdown
    const LICENSE_PLATE = "VLK0083";
    // ==================

    await page.goto("https://app.apartmentpermits.com/guest", { waitUntil: "networkidle" });

    // ---- Step 1: Select property ----
    await page.click('text=Select Property');
    await page.fill('input[placeholder*="Name or address"]', PROPERTY_SEARCH);

    await page.waitForSelector('text=Residences at Rayzor Ranch');
    await page.click('text=Residences at Rayzor Ranch');

    // ---- Fill unit and PIN ----
    await page.fill('input[placeholder="Unit Number"]', UNIT);
    await page.fill('input[placeholder*="Last 4"]', PIN);

    await page.click('text=Sign In');

    // ---- Step 2: Vehicle Info ----
    await page.waitForSelector('text=Enter Vehicle Information');

    await page.fill('input[placeholder="Year"]', CAR_YEAR);

    // Make / Model dropdown
    await page.click('text=Select a Make / Model');
    await page.locator('input.p-select-filter:visible').fill("Camry");
    await page.click(`text=${CAR_MAKE_MODEL}`);

    // Color dropdown (PrimeVue Select - no search box)
    const colorSelect = page.locator('label:has-text("Select a Color")').locator('..').locator('.p-select');
    await colorSelect.click();

    // Wait for dropdown list to appear
    const colorPanel = page.locator('[id$="_list"]');
    await colorPanel.waitFor();

    // Click the color
    await colorPanel.locator(`text=${CAR_COLOR}`).click();


    // License plate
    await page.fill('input[placeholder="License Plate"]', LICENSE_PLATE);

    // Confirm Vehicle Info
    await page.click('text=Confirm');

    // ---- Step 3: Accept Rules & Secondary Confirm ----
    // Wait for rules page and click confirm
    await page.waitForSelector('text=Accept Parking Rules');
    await page.click('button:has-text("Confirm")');

    // Wait for "Confirm License Plate" modal
    await page.waitForSelector('text=Confirm License Plate');
    // The exact selector identified by research
    const modalInput = page.locator('.p-dialog input[placeholder="Confirm license plate"]');
    await modalInput.waitFor({ state: 'visible' });
    await modalInput.fill(LICENSE_PLATE);
    await page.keyboard.press('Enter');

    // ---- Final Verification & Feedback ----
    console.log("Waiting for registration result toast or modal closure...");

    // Define success and error indicators
    const errorToast = page.locator('.p-toast-message-content').filter({ hasText: 'Registration Failed' });
    const modal = page.locator('.p-dialog');

    // Wait for a result with a generous timeout
    try {
        await Promise.race([
            errorToast.waitFor({ state: 'visible', timeout: 10000 }).then(() => console.log("Toast visible")),
            modal.waitFor({ state: 'hidden', timeout: 10000 }).then(() => console.log("Modal hidden"))
        ]);
        console.log("Feedback received or modal closed.");
    } catch (e) {
        console.log("Timed out waiting for specific feedback, taking screenshot anyway.");
    }

    // Give the UI a moment to settle
    await page.waitForTimeout(1000);

    const finalConfirm = page.locator('button:has-text("Confirm")');
    if (await modal.isHidden() && await finalConfirm.isVisible() && await finalConfirm.isEnabled() && !(await errorToast.isVisible())) {
        console.log("Clicking final confirm button...");
        await finalConfirm.click();
        await page.waitForTimeout(1000);
    }

    // Take a screenshot of the final state
    console.log("Capturing final state screenshot...");
    await page.screenshot({ path: 'registration_success.png', fullPage: true });

    console.log("Registration process finished. Please check registration_success.png");
    await page.waitForTimeout(2000);
});
