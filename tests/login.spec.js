const { test, expect } = require('@playwright/test');

test.use({
    headless: true,
    viewport: { width: 1280, height: 720 }
});

test('Resident Login Flow', async ({ page }) => {
    // ===== CONFIG =====
    const PROPERTY_SEARCH = "Residences at Rayzor Ranch";
    const UNIT = "2549cd";
    const PIN = "1492";
    // ==================

    await page.goto("https://app.apartmentpermits.com/resident", { waitUntil: "networkidle" });

    console.log("Selecting property...");
    await page.click('text=Select Property');
    await page.fill('input[placeholder*="Name or address"]', PROPERTY_SEARCH);

    await page.waitForSelector(`text=${PROPERTY_SEARCH}`);
    await page.click(`text=${PROPERTY_SEARCH}`);

    // ---- Fill unit and PIN ----
    console.log("Filling unit and PIN...");
    await page.fill('input[placeholder="Unit Number"]', UNIT);
    await page.fill('input[placeholder*="Last 4"]', PIN);

    // Wait for the button to be stable
    await page.waitForTimeout(500);

    console.log("Clicking Sign In...");
    await page.click('button:has-text("Sign In")');

    // ---- Final Verification ----
    console.log("Waiting for login to complete...");

    // Give it a few seconds to load the dashboard
    await page.waitForTimeout(3000);

    // Take a screenshot of the final state
    console.log("Capturing login state screenshot...");
    await page.screenshot({ path: 'login_success.png', fullPage: true });

    console.log("Resident login finished. Please check login_success.png");
});
