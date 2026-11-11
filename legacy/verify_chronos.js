const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    // Ensure verification directory exists
    const verifyDir = '/home/jules/verification';
    if (!fs.existsSync(verifyDir)) {
        fs.mkdirSync(verifyDir, { recursive: true });
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to app...');
        await page.goto('http://localhost:8080');

        // Wait for map to load
        await page.waitForSelector('#map');

        // Click Chronos toggle
        console.log('Toggling Chronos...');
        const toggleBtn = page.locator('.chronos-toggle');
        await toggleBtn.click();

        // Wait for panel
        const panel = page.locator('#chronosPanel');
        await panel.waitFor({ state: 'visible' });

        // Set slider to Antiquity (value 0)
        console.log('Setting Era to Antiquity...');
        const slider = page.locator('#chronosSlider');
        await slider.fill('0');
        // Trigger input event manually if fill doesn't do it
        await slider.dispatchEvent('input');

        // Verify Era class on body
        const body = page.locator('body');
        await body.waitFor({ state: 'visible' }); // ensure body is there

        // Wait for class to be added
        await page.waitForFunction(() => document.body.classList.contains('era-antiquity'));
        console.log('Era Antiquity active.');

        // Take screenshot
        const screenshotPath = path.join(verifyDir, 'chronos_verification.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);

    } catch (e) {
        console.error('Verification failed:', e);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
