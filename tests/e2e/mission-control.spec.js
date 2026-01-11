import { test, expect } from '@playwright/test';

test.describe('Mission Control & Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container');

    // Add two items to itinerary for meaningful simulation

    // Item 1: Tirana
    await page.fill('#searchBox', 'Tirana');
    await page.locator('.search-result-item').first().click();
    await page.locator('.leaflet-popup-content button.popup-btn').click();

    // Item 2: Berat
    await page.fill('#searchBox', 'Berat');
    // Wait for previous dropdown to close or update.
    // Clicking map might close it, or typing new text might update it.
    // It's safer to wait a bit or ensure the previous popup is handled.
    // The previous click opened a popup.
    // Let's just type.
    await page.waitForTimeout(500);
    await page.locator('.search-result-item').first().click();
    await page.locator('.leaflet-popup-content button.popup-btn').click();
  });

  test('should display timeline correctly', async ({ page }) => {
    // Open Mission Control
    await page.click('#missionControlToggle');

    // Check timeline container
    const timeline = page.locator('#missionTimeline');
    await expect(timeline).toBeVisible();

    // Should have nodes for Start, Tirana, Berat, End
    const nodes = timeline.locator('.timeline-node');
    // Depending on logic it might be Start + 2 attractions + End = 4
    // Or Start + 2 attractions = 3 if end is implied?
    // Based on unit test logic: Start, Node A, Node B, End = 4.
    await expect(nodes).toHaveCount(4);

    // Check for travel segments
    const segments = timeline.locator('.timeline-segment');
    // Logic: A->B has segment. Start->A ?
    // In unit test we saw 1 segment for 2 items.
    // Let's just check > 0
    await expect(segments.count()).resolves.toBeGreaterThan(0);
  });

  test('should run recon simulation', async ({ page }) => {
    await page.click('#missionControlToggle');

    // Find Recon Button: ID is reconBtn in index.html
    const reconBtn = page.locator('#reconBtn');
    await reconBtn.click();

    // Check if body has recon-active class
    await expect(page.locator('body')).toHaveClass(/recon-active/);

    // Also check if Mission Control closed (optional, but good UX test)
    // The code says it closes sidebar.
    const panel = page.locator('#missionControlPanel');
    await expect(panel).not.toHaveClass(/open/);
  });

  test('should use crowd intel slider', async ({ page }) => {
    await page.click('#missionControlToggle');

    // Toggle Crowd Intel
    const crowdToggle = page.locator('label.switch-label').filter({ hasText: 'Crowd Intel' });
    // Or specifically the input, but playwright can click label
    await crowdToggle.click();

    // Check if body active
    await expect(page.locator('body')).toHaveClass(/crowd-intel-active/);

    // Move slider: #missionTimeSlider
    const slider = page.locator('#missionTimeSlider');
    await slider.fill('18');

    // Check time display: #missionTimeDisplay
    const timeDisplay = page.locator('#missionTimeDisplay');
    await expect(timeDisplay).toHaveText('18:00');
  });
});
