const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({
        headless: false, // set true later if you want it invisible
        slowMo: 50
    });

    const page = await browser.newPage();

    // ===== CONFIG =====
    const PROPERTY_SEARCH = "Rayzor";
    const UNIT = "2549cd";
    const PIN = "1492";

    // CHANGE THESE:
    const CAR_YEAR = "2020";
    const CAR_MAKE_MODEL = "Toyota / Camry"; // must match dropdown
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
    await page.fill('input[placeholder*="Search"]', "camry");
    await page.click(`text=Toyota / Camry`);

    // Color dropdown
    await page.click('text=Select a Color');
    await page.click(`text=${CAR_COLOR}`);

    // License plate
    await page.fill('input[placeholder="License Plate"]', LICENSE_PLATE);

    // Confirm
    await page.click('text=Confirm');

    // ---- Done ----
    console.log("Registration submitted.");

    await page.waitForTimeout(5000);
    // await browser.close();
})();
