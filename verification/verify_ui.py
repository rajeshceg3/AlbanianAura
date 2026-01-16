from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800}) # Desktop

    print("Loading page...")
    # 1. Load Page
    page.goto("http://localhost:8080")
    page.wait_for_selector("#map")
    page.wait_for_timeout(2000) # Wait for map tiles

    print("Taking screenshot 1...")
    # Screenshot 1: Default View
    page.screenshot(path="verification/1_default_desktop.png")

    print("Opening Mission Control...")
    # 2. Open Mission Control
    # Ensure button is visible/clickable
    page.click("#missionControlToggle")
    # Wait for panel to get the open class
    page.wait_for_selector(".sidebar.open")
    page.wait_for_timeout(1000) # Wait for transition
    print("Taking screenshot 2...")
    page.screenshot(path="verification/2_mission_control.png")

    print("Testing Search...")
    # 3. Open Search Results
    # Close mission control first to clear view
    page.click("#closeMissionControl")
    page.wait_for_timeout(500)

    page.fill("#searchBox", "Tirana")
    page.wait_for_selector(".search-results.active")
    page.wait_for_timeout(500)
    print("Taking screenshot 3...")
    page.screenshot(path="verification/3_search_results.png")

    print("Switching to Mobile...")
    # 4. Mobile View
    page.set_viewport_size({"width": 375, "height": 667})
    page.reload()
    page.wait_for_selector("#map")
    page.wait_for_timeout(1000)
    print("Taking screenshot 4...")
    page.screenshot(path="verification/4_mobile_view.png")

    print("Mobile Mission Control...")
    # 5. Mobile Mission Control
    # Wait for toggle button to be visible
    page.wait_for_selector("#missionControlToggle")
    page.click("#missionControlToggle")
    page.wait_for_selector(".sidebar.open")
    page.wait_for_timeout(1000)
    print("Taking screenshot 5...")
    page.screenshot(path="verification/5_mobile_mission_control.png")

    browser.close()
    print("Done.")

with sync_playwright() as playwright:
    run(playwright)
