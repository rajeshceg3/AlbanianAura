import { test, expect } from '@playwright/test';
for (const width of [320, 390, 1280]) {
 test(`tools are explicit, keyboard accessible, and leave the map clear at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.waitForSelector('#explore-albania');
  await expect(page.locator('.tour-overlay.active')).toHaveCount(0);
  await expect(page.locator('.ui-controls')).not.toBeVisible();
  await expect(page.locator('.leaflet-control-attribution')).toBeVisible();
  await page.click('#explore-albania');
  await expect(page.locator('#albania-tools')).toBeVisible();
  await page.click('.type-tokens [data-value="nature"]');
  await expect(page.locator('#typeFilter')).toHaveValue('nature');
  await page.click('.type-tokens [data-value="all"]');
  await page.fill('#searchBox','Tirana');
  await page.locator('.search-result-item').first().click();
  await expect(page.locator('#albania-tools')).not.toBeVisible();
  await expect(page.locator('.leaflet-popup-content')).toContainText('Tirana');
  await page.click('.leaflet-popup-content button.popup-btn');
  await page.click('#explore-albania');await page.click('#missionControlToggle');
  await expect(page.locator('#missionControlPanel')).toHaveClass(/open/);
  await page.click('#closeMissionControl');
  await page.click('#explore-albania');await page.click('#startTourBtn');
  await page.click('.tour-next');
  await expect(page.locator('.tour-step-count')).toContainText('2/5');
  await page.click('.tour-close-btn');
  await page.click('#explore-albania');await page.keyboard.press('Escape');
  await expect(page.locator('#explore-albania')).toBeFocused();
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 });
}
