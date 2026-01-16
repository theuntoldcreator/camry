const { chromium } = require("playwright");

(async () => {
    // Launch a visible browser maximized
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100, // Slightly slower for a smoother, premium look
        args: ['--start-maximized']
    });

    // Create a context with null viewport to let --start-maximized work
    const context = await browser.newContext({
        viewport: null
    });

    const page = await context.newPage();

    // ===== CONFIG =====
    const PROPERTY_SEARCH = "Residences at Rayzor Ranch";
    const UNIT = "2549cd";
    const PIN = "1492";
    // ==================

    let success = false;
    try {
        console.log("Navigating to Resident Portal...");
        await page.goto("https://app.apartmentpermits.com/resident", { waitUntil: "networkidle" });

        console.log("Selecting property...");
        await page.click('text=Select Property');

        // Use type for a smoother "human" typing effect
        await page.type('input[placeholder*="Name or address"]', PROPERTY_SEARCH, { delay: 100 });

        await page.waitForSelector(`text=${PROPERTY_SEARCH}`, { state: 'visible' });
        await page.click(`text=${PROPERTY_SEARCH}`);

        // ---- Fill unit and PIN ----
        console.log("Filling unit and PIN...");
        await page.type('input[placeholder="Unit Number"]', UNIT, { delay: 100 });
        await page.type('input[placeholder*="Last 4"]', PIN, { delay: 100 });

        // Small pause for stability and visual confirmation
        await page.waitForTimeout(800);

        console.log("Clicking Sign In...");
        await page.click('button:has-text("Sign In")');

        console.log("Login submitted. Navigating to dashboard...");

        // Wait for potential navigation or dashboard markers
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log("Automation finished successfully.");
        success = true;

    } catch (error) {
        console.error("Automation failed:", error);
    }

    // Capture screenshot regardless of success/fail (if page is open)
    try {
        console.log("Capturing login state screenshot...");
        await page.screenshot({ path: 'public/login_success.png', fullPage: true });
    } catch (err) {
        console.log("Could not take screenshot:", err);
    }

    // Close browser to allow the process to exit and server to respond
    await browser.close();

    if (!success) process.exit(1);
})();
