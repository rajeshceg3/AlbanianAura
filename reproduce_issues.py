import pytest
from playwright.sync_api import sync_playwright
import os
import json

def test_xss_in_review():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Load the local HTML file
        page.goto(f"file://{os.getcwd()}/index.html")

        # Wait for map to load
        page.wait_for_selector(".leaflet-marker-icon")

        # Click the first marker to open popup
        page.locator(".leaflet-marker-icon").first.click()

        # Click "View / Add Review" button in popup
        page.click("text=View / Add Review")

        # Wait for review modal
        page.wait_for_selector("#reviewModal")

        # Inject XSS payload
        xss_payload = "<img src=x onerror=document.body.setAttribute('data-xss','triggered')>"
        page.fill("#reviewText", xss_payload)

        # Set rating (click 5th star)
        page.click("#starRatingContainer .star[data-value='5']")

        # Submit
        page.click("#submitReviewBtn")

        # Check if XSS executed (attribute added to body)
        # Note: In a real XSS with alert, we'd handle dialog event.
        # Here we check if the HTML was rendered raw.
        # We can verify by looking at the innerHTML of the review list

        reviews_html = page.inner_html("#reviewsList")
        if "<img src=\"x\" onerror=\"document.body.setAttribute('data-xss','triggered')\">" in reviews_html or "data-xss" in page.evaluate("document.body.outerHTML"):
             print("XSS Vulnerability Confirmed: Review text is rendered as HTML.")
        else:
             print("XSS Not Triggered immediately (might need refresh or check impl).")

        # Check raw HTML content in the DOM
        last_review = page.locator(".review-item .review-text").last
        content = last_review.inner_html()
        print(f"Rendered content: {content}")

        assert "<img" in content, "XSS Payload was likely sanitized or not rendered as HTML"

        browser.close()

def test_missing_translations():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{os.getcwd()}/index.html")

        # Switch to Albanian
        page.click("button[data-lang='sq']")

        # Check specific elements known to be static in current code
        mission_title = page.text_content("#missionTitle")
        print(f"Mission Title (SQ): {mission_title}")

        mission_toggle = page.text_content("#missionControlToggle")
        print(f"Mission Toggle (SQ): {mission_toggle}")

        if mission_title == "Mission Plan":
            print("Missing Translation Confirmed: Mission Plan title not updated.")

        if "Mission Control" in mission_toggle:
             print("Missing Translation Confirmed: Mission Control toggle text not updated.")

        browser.close()

if __name__ == "__main__":
    try:
        test_xss_in_review()
    except Exception as e:
        print(f"XSS Test failed with error: {e}")

    try:
        test_missing_translations()
    except Exception as e:
        print(f"Translation Test failed with error: {e}")
