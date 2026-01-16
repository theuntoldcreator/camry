const { chromium } = require("playwright");

(async () => {
    // Use environment variable to determine headless mode
    // On Render, 'RENDER' env var is 'true'. We force headless there.
    const isHeadless = process.env.HEADLESS === 'true' || process.env.RENDER === 'true';

    // Launch settings adapted for environment
    const browser = await chromium.launch({
        headless: isHeadless,
        slowMo: isHeadless ? 0 : 100, // No delay in prod for speed
        args: isHeadless ? ['--no-sandbox', '--disable-setuid-sandbox'] : ['--start-maximized']
    });

    // Create a context
    // In headless, we set a fixed viewport. In headed (local), we let it maximize (viewport: null).
    const context = await browser.newContext({
        viewport: isHeadless ? { width: 1280, height: 720 } : null
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
        // Use modern locator API
        await page.locator('text=Select Property').click();

        // Use fill instead of type for stability (avoids 'page closed' issues during slow typing)
        const searchInput = page.locator('input[placeholder*="Name or address"]');
        await searchInput.waitFor({ state: 'visible' });
        await searchInput.fill(PROPERTY_SEARCH);

        await page.locator(`text=${PROPERTY_SEARCH}`).waitFor({ state: 'visible' });
        await page.locator(`text=${PROPERTY_SEARCH}`).click();

        // ---- Fill unit and PIN ----
        console.log("Filling unit and PIN...");
        await page.locator('input[placeholder="Unit Number"]').fill(UNIT);
        await page.locator('input[placeholder*="Last 4"]').fill(PIN);

        // Small pause for stability and visual confirmation
        await page.waitForTimeout(800);

        console.log("Clicking Sign In...");
        await page.locator('button:has-text("Sign In")').click();

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
    // Only close if in Headless mode (Render), otherwise keep open for local debugging
    if (isHeadless) {
        await browser.close();
        if (!success) process.exit(1);
    } else {
        // Keep the browser open indefinitely for debugging locally
        console.log("Browser remaining open for debugging...");
        await new Promise(() => { });
    }
})();
