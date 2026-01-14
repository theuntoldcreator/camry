const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const SCREENSHOT_PATH = path.join(__dirname, 'registration_success.png');

app.use(express.static('public'));
app.use('/screenshots', express.static(path.join(__dirname)));

app.get('/run-test', (req, res) => {
    console.log('Register button clicked. Checking for existing screenshot...');

    // 1. Pre-execution cleanup: Delete old screenshot if it exists
    if (fs.existsSync(SCREENSHOT_PATH)) {
        try {
            fs.unlinkSync(SCREENSHOT_PATH);
            console.log('Old screenshot deleted successfully.');
        } catch (err) {
            console.error(`Error deleting old screenshot: ${err.message}`);
        }
    }

    console.log('Running Playwright test...');
    exec('npx playwright test tests/register.spec.js --project=chromium', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing test: ${error.message}`);
            return res.status(500).json({ status: 'error', message: error.message });
        }
        console.log('Test completed successfully');

        // 2. Schedule deletion of new screenshot after 5 minutes
        console.log('Scheduling new screenshot deletion in 5 minutes...');
        setTimeout(() => {
            if (fs.existsSync(SCREENSHOT_PATH)) {
                fs.unlink(SCREENSHOT_PATH, (err) => {
                    if (err) console.error(`Error deleting screenshot: ${err.message}`);
                    else console.log('Screenshot deleted automatically after 5 minutes.');
                });
            }
        }, 300000);

        res.json({ status: 'success' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
