
from playwright.sync_api import sync_playwright

def verify_orbital_system():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:8080")

        # Wait for map
        page.wait_for_selector("#map")

        # Open Mission Control
        page.click("#missionControlToggle")
        page.wait_for_selector("#missionControlPanel.open")

        # Toggle Satellite
        # The input might be hidden with `display: none` because of the custom toggle styling
        # We should click the LABEL instead.
        # <label class="switch-label">
        #    <span>Satellite Link</span>
        #    <input ...>
        #    <span class="slider round"></span>
        # </label>

        # Click the slider span which is the visual part
        page.click("input#satelliteToggle + .slider")

        # Wait for satellite view effects
        page.wait_for_selector(".satellite-view")
        page.wait_for_selector("#sat-hud", state="visible")

        # Take screenshot of Satellite View
        page.screenshot(path="verification/orbital_view.png")

        # Task Satellite (Requires opening panel again or finding button if we moved it)
        # Actually button is in panel.

        # Click Task Satellite
        page.click("#taskSatBtn")

        # Click on map (center)
        page.mouse.click(400, 300)

        # Wait for toast
        page.wait_for_selector(".toast.show")

        # Take screenshot of Toast
        page.screenshot(path="verification/tasking_toast.png")

        browser.close()

if __name__ == "__main__":
    verify_orbital_system()
