const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const SCREENSHOT_PATH = path.join(__dirname, 'public', 'login_success.png');

app.use(express.static('public'));

app.get('/run-login', (req, res) => {
    console.log('Direct login request received...');

    // 1. Pre-execution cleanup: Delete old screenshot if it exists
    if (fs.existsSync(SCREENSHOT_PATH)) {
        try {
            fs.unlinkSync(SCREENSHOT_PATH);
            console.log('Old screenshot deleted successfully.');
        } catch (err) {
            console.error(`Error deleting old screenshot: ${err.message}`);
        }
    }

    exec('node scripts/direct_login.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Automation Error: ${error.message}`);
            return res.status(500).json({ status: 'error', message: "Login failed." });
        }
        res.json({ status: 'success' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
