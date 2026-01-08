import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('.leaflet-container');
  });

  test('should load the homepage and map', async ({ page }) => {
    await expect(page).toHaveTitle(/Albania Tourist Map/i);
    await expect(page.locator('#map')).toBeVisible();
  });

  test('should interact with the map and add to itinerary', async ({ page }) => {
    // Locate search box
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('Tirana');

    // Wait for results
    const resultItem = page.locator('.search-result-item').first();
    await resultItem.click();

    // Popup should open
    const popup = page.locator('.leaflet-popup-content');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Tirana');

    // Click "Add to Mission" button in popup
    const addButton = popup.locator('button.popup-btn');
    await addButton.click();

    // Verify toast
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Target added');

    // Open Mission Control
    const toggle = page.locator('#missionControlToggle');
    await toggle.click();

    // Verify item in list.
    // The list ID in index.html is missionList, but script might append specific items.
    // Let's check if 'Tirana' is present inside #missionList
    const missionList = page.locator('#missionList');
    await expect(missionList).toContainText('Tirana');
  });

  test('should change language', async ({ page }) => {
    const langBtnSq = page.locator('#langSwitcher button[data-lang="sq"]');
    await langBtnSq.click();

    // Verify translation
    // 'Search...' should become 'Kërko...'
    const searchBox = page.locator('#searchBox');
    await expect(searchBox).toHaveAttribute('placeholder', /Kërko/);
  });
});
