from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Ensure we are in the correct directory
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Verify Translations & Missing IDs
        page.click("button[data-lang='sq']")

        # Check static text elements that were missing
        expect(page.locator("#missionTitle")).to_have_text("Plani i Misionit")
        expect(page.locator("#missionControlToggle")).to_have_text("Kontrolli i Misionit")
        expect(page.locator("#targetsLabel")).to_have_text("Objektivat")
        expect(page.locator("#clearMissionBtn")).to_have_text("Anulo Misionin")

        print("Translations for static elements verified.")

        # 2. Verify Security (XSS Fix) - Add a review with HTML
        # Open a popup via click first to verify click works
        page.locator(".leaflet-marker-icon").first.click()

        # Debug: print text of the button
        btn = page.locator(".view-reviews-btn")
        # Should be correct encoding now
        print(f"Review Button Text: {btn.inner_text()}")

        # Click using class selector
        btn.click()

        # Inject "XSS"
        page.fill("#reviewText", "<b>Safe Text</b>")
        page.click("#starRatingContainer .star[data-value='5']")
        page.click("#submitReviewBtn")

        # Wait for review to appear
        page.wait_for_selector(".review-text:has-text('Safe Text')")

        last_review = page.locator(".review-item .review-text").last
        content = last_review.inner_html()
        print(f"Rendered content: {content}")

        if "&lt;b&gt;Safe Text&lt;/b&gt;" in content or "&amp;lt;b&amp;gt;Safe Text&amp;lt;/b&amp;gt;" in content:
            print("Security Verified: HTML tags were escaped.")
        elif "<b>Safe Text</b>" in content:
             print("SECURITY FAILURE: HTML tags were rendered!")
             raise Exception("XSS Vulnerability still present")

        # 3. Verify Accessibility (Keyboard Interaction)
        # Reload to reset state
        page.reload()

        # Focus the first marker using keyboard tab (simulated by locator.focus() for now,
        # but to test interaction we can just target the inner div and press Enter)

        marker_div = page.locator(".custom-marker div[role='button']").first
        marker_div.focus()
        page.keyboard.press("Enter")

        # Expect popup to open
        expect(page.locator(".leaflet-popup-content")).to_be_visible()
        print("Accessibility Verified: Keyboard Enter opened popup.")

        # Take screenshot of the Albanian interface with the safe review
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
