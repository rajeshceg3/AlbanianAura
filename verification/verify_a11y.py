from playwright.sync_api import sync_playwright
import os

def verify_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Verify "Review Submitted" message has accessible attributes
        confirmation = page.locator(".confirmation-message")
        role = confirmation.get_attribute("role")
        aria_live = confirmation.get_attribute("aria-live")

        print(f"Confirmation role: {role}")
        print(f"Confirmation aria-live: {aria_live}")

        if role != "status" or aria_live != "polite":
            print("❌ FAILED: Confirmation message missing proper ARIA attributes")
        else:
            print("✅ PASSED: Confirmation message has proper ARIA attributes")

        # 2. Verify Star Ratings in List have accessible attributes
        # We need to open a review modal to see the list.
        # "Tirana" has reviews in the mock data.

        # Wait for map to load (though we interact with DOM directly usually, Leaflet might take a sec to render markers)
        page.wait_for_timeout(1000)

        # We can execute JS to open the modal directly to avoid fighting with map clicks
        page.evaluate("openReviewModal('Tirana')")

        # Wait for modal to appear
        page.wait_for_selector("#reviewModal", state="visible")

        # Check the reviews list
        reviews = page.locator(".review-item")
        count = reviews.count()
        print(f"Found {count} reviews")

        if count > 0:
            first_review_stars = reviews.first.locator(".rating-static")
            aria_label = first_review_stars.get_attribute("aria-label")
            role_stars = first_review_stars.get_attribute("role")

            print(f"Review stars aria-label: {aria_label}")
            print(f"Review stars role: {role_stars}")

            if "out of 5 stars" in aria_label and role_stars == "img":
                print("✅ PASSED: Star rating has accessible label and role")
            else:
                print("❌ FAILED: Star rating missing accessible label or role")

            # Check if inner stars are hidden
            inner_star = first_review_stars.locator(".star-icon").first
            aria_hidden = inner_star.get_attribute("aria-hidden")
            print(f"Inner star aria-hidden: {aria_hidden}")

            if aria_hidden == "true":
                print("✅ PASSED: Inner stars are hidden from screen readers")
            else:
                print("❌ FAILED: Inner stars are NOT hidden")

            # Take a screenshot for visual confirmation
            page.screenshot(path="verification/reviews_modal.png")

        else:
            print("❌ FAILED: No reviews found to test")

        browser.close()

if __name__ == "__main__":
    verify_accessibility()
