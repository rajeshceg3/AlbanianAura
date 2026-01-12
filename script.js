// Get references to HTML elements
const langButtons = document.querySelectorAll('#langSwitcher button');
const dreamModeBtn = document.getElementById('dreamModeBtn');
const generativeModeBtn = document.getElementById('generativeModeBtn');
const exploreBtn = document.getElementById('exploreBtn');
const searchBox = document.getElementById('searchBox');
const typeFilter = document.getElementById('typeFilter');

// Mission Control Elements
const missionControlToggle = document.getElementById('missionControlToggle');
const missionControlPanel = document.getElementById('missionControlPanel');
const closeMissionControlBtn = document.getElementById('closeMissionControl');
const missionListElement = document.getElementById('missionList');
const missionCountElement = document.getElementById('missionCount');
const clearMissionBtn = document.getElementById('clearMissionBtn');

// Review Modal Elements
const reviewModal = document.getElementById('reviewModal');
const closeReviewModalBtn = document.getElementById('closeReviewModal');
const reviewModalTitle = document.getElementById('reviewModalTitle');
const triviaModal = document.getElementById('triviaModal');
const closeTriviaModalBtn = document.getElementById('closeTriviaModal');
const triviaModalTitle = document.getElementById('triviaModalTitle');
const triviaModalContent = document.getElementById('triviaModalContent');
const avgRatingValueElement = document.getElementById('avgRatingValue');
const reviewsListElement = document.getElementById('reviewsList');
const reviewForm = document.getElementById('reviewForm');
const starRatingContainer = document.getElementById('starRatingContainer');
const ratingValueInput = document.getElementById('ratingValue'); // Hidden input for selected star value
const userNameInput = document.getElementById('userName');
const reviewTextInput = document.getElementById('reviewText');
const currentAverageRatingElement = document.getElementById('currentAverageRating'); // The whole div
const addReviewTitleElement = document.getElementById('addReviewTitle');
const userNameLabelElement = document.getElementById('userNameLabel');
const ratingLabelElement = document.getElementById('ratingLabel');
const reviewTextLabelElement = document.getElementById('reviewTextLabel');
const submitReviewBtnElement = document.getElementById('submitReviewBtn');


// App state
let currentlyReviewedAttraction = null; // To keep track of which attraction's modal is open
let dreamMode = false;
let generativeMode = false;
let lastFocusedElement = null; // For accessibility: track element that opened modal

// Define attractions
if (typeof attractionsData === 'undefined') {
    console.error('attractionsData is not defined. Ensure data.js is loaded correctly.');
    // Fallback if data is missing to prevent crash
    window.attractionsData = [];
}
const attractions = typeof attractionsData !== 'undefined' ? attractionsData : [];

// Initialize the map and set its view to Albania
var map = L.map('map', { tap: false }).setView([41.1533, 20.1683], 7); // Coordinates for Albania and zoom level

// Initialize Core Systems
let crowdIntelSystem = new CrowdIntelSystem(map, attractions);
let riskAnalysisSystem = new RiskAnalysisSystem(crowdIntelSystem);
let missionBriefingSystem = new MissionBriefingSystem(appState, attractions, riskAnalysisSystem);

// Initialize Mission Planner with Risk System
let missionPlanner = new MissionPlanner(map, appState, attractions, riskAnalysisSystem);
let pathfinderSystem = new PathfinderSystem(map, attractions, crowdIntelSystem);

// Initialize S.C.O.U.T. Ops Center (New Feature)
let scoutOpsCenter = new ScoutOpsCenter(map, appState, attractions);

// Initialize Logistics System (Temporal Operations Grid)
let logisticsSystem = new LogisticsSystem(map, appState, attractions, riskAnalysisSystem);

// Initialize SIGINT System
let sigintSystem = new SigintSystem(map, appState, attractions);

// Initialize Command HUD (Tactical 3D View)
let commandHUD = new CommandHUD(map);

// Initialize S.C.O.U.T. UI Logic
initScoutInterface();

function initScoutInterface() {
    const crowdToggle = document.getElementById('crowdIntelToggle');
    const sigintToggle = document.getElementById('sigintToggle');
    const timeSlider = document.getElementById('missionTimeSlider');
    const timeDisplay = document.getElementById('missionTimeDisplay');
    const exportBtn = document.getElementById('exportMissionBtn');
    const optimizeBtn = document.getElementById('optimizeRouteBtn');

    if (crowdToggle) {
        crowdToggle.addEventListener('change', (e) => {
            crowdIntelSystem.toggleSystem(e.target.checked);
            // Refresh profile if available
            pathfinderSystem.renderProfile(appState.itinerary, 'threatProfileGraph');
        });
    }

    if (sigintToggle) {
        sigintToggle.addEventListener('change', (e) => {
            sigintSystem.toggleSystem(e.target.checked);
        });
    }

    if (timeSlider) {
        timeSlider.addEventListener('input', (e) => {
            const hour = parseInt(e.target.value);
            timeDisplay.textContent = `${hour.toString().padStart(2, '0')}:00`;
            crowdIntelSystem.setHour(hour);
            // Live update of threat profile
            pathfinderSystem.renderProfile(appState.itinerary, 'threatProfileGraph');
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (missionBriefingSystem) missionBriefingSystem.generateBriefing();
        });
    }

    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', () => {
            if (appState.itinerary.length <= 2) {
                // UX: No optimization needed for 0-2 items
                const t = translations[appState.language];
                showToast(t.noOptimizationNeeded || "Not enough targets to optimize.");
                return;
            }

            const optimized = pathfinderSystem.optimizeRoute(appState.itinerary);

            // Update state
            appState.setItinerary(optimized);

            // Visual feedback
            optimizeBtn.innerHTML = '<span class="icon">✓</span> Optimized';
            setTimeout(() => {
                optimizeBtn.innerHTML = '<span class="icon">⚡</span> Optimize Route';
            }, 2000);
        });
    }
}


// Add a tile layer to the map (using a pastel-themed layer)
const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Using CartoDB Dark Matter for the "Generative" mode as a stable alternative to Stamen Watercolor
let generativeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

const allMarkers = [];

// Helper function to generate popup content
function generatePopupContent(attraction) {
    const t = translations[appState.language];
    const attrData = attractions.find(a => a.name === attraction.name);

    if (!attrData) {
        return `<h3>${attraction.name || 'Unknown Location'}</h3><p>Data unavailable.</p>`;
    }

    // Fix: Fallback to English description if current language is missing
    const description = (attrData.description && (attrData.description[appState.language] || attrData.description['en'])) || `Discover the beauty of ${attraction.name}. More details coming soon!`;
    const moreInfoLink = sanitizeUrl(attrData.moreInfoLink) || '#';
    const bookingsLink = sanitizeUrl(attrData.bookingsLink) || '#';

    // Rating and Review related content
    const reviews = appState.getReviews(attraction.name);
    const avgRating = calculateAverageRating(attraction.name);
    let ratingDisplay = t.noReviewsYetPopup; // Default text
    if (reviews.length > 0) {
        ratingDisplay = `${t.averageRatingPopup}: ${avgRating.toFixed(1)} <span class="star-icon">&#9733;</span> (${reviews.length} ${reviews.length === 1 ? t.reviewCountSingular : t.reviewCountPlural})`;
    }

    const isInMission = appState.isInItinerary(attraction.name);
    const missionBtnText = isInMission ? t.removeFromItinerary : t.addToItinerary;
    // Add popup-btn class for test compatibility
    const missionBtnClass = isInMission ? 'mission-btn popup-btn remove' : 'mission-btn popup-btn add';

    // Security: Use DOM creation instead of innerHTML for user content where possible,
    // or ensure content is safe. Here description is from data.js (static), but good to be careful.
    // We will build the popup content as a string but ensure no user input is directly injected.
    // The only dynamic user part here is ratings which are numbers.
    // However, attraction.name could theoretically be unsafe if data.js was dynamic.
    // For now, we trust data.js but sanitize just in case.

    // Function to escape HTML
    const escapeHtml = (unsafe) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    return `
        <h3>${escapeHtml(attraction.name)}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="popup-rating-summary">
            <span class="avg-rating-text">${ratingDisplay}</span>
        </div>
        <div class="popup-actions">
            <button class="view-reviews-btn" data-name="${escapeHtml(attraction.name)}">${t.viewAddReviewBtn}</button>
            <button class="trivia-btn" data-name="${escapeHtml(attraction.name)}">${t.triviaButton}</button>
            <button class="${missionBtnClass}" data-name="${escapeHtml(attraction.name)}">${missionBtnText}</button>
            <button class="drone-btn" data-name="${escapeHtml(attraction.name)}" aria-label="Deploy Drone">🚁 Deploy</button>
        </div>
        <hr style="margin: 8px 0;">
        <a href="${moreInfoLink}" target="_blank" rel="noopener noreferrer">${t.moreInfoLink}</a> | <a href="${bookingsLink}" target="_blank" rel="noopener noreferrer">${t.bookingsLink}</a>
    `;
}

function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return url;
        }
    } catch (e) {
        // invalid url
    }
    return '#';
}

// Helper function to create a custom icon
function createCustomIcon() {
    return L.divIcon({
        className: 'custom-marker',
        html: '<div tabindex="0" role="button" aria-label="Attraction marker" style="width: 100%; height: 100%;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
}

// Add markers for each attraction
attractions.forEach(function(attraction) {
    const marker = L.marker([attraction.lat, attraction.lng], { icon: createCustomIcon() });
    marker.attractionData = attraction;

    // Bind popup and add to map
    marker.bindPopup();
    marker.addTo(map);
    allMarkers.push(marker);
});

// One-time init for marker styles and accessibility events
setTimeout(() => {
    allMarkers.forEach(marker => {
         const icon = marker.getElement();
         if (icon) {
             if (appState.isInItinerary(marker.attractionData.name)) {
                 icon.classList.add('mission-target');
             }

             // Accessibility: Open popup on Enter/Space
             // The inner div has the tabindex and role
             const innerDiv = icon.querySelector('div[role="button"]');
             if (innerDiv) {
                 innerDiv.addEventListener('keydown', (e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         marker.openPopup();
                     }
                 });
             }
         }
    });
}, 0);

// --- Review Functions ---

function calculateAverageRating(attractionName) {
    const reviews = appState.getReviews(attractionName);
    if (reviews.length === 0) return 0;
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    return totalStars / reviews.length;
}

function renderReviews(attractionName) {
    const t = translations[appState.language];
    reviewsListElement.innerHTML = ''; // Clear current reviews
    const reviews = appState.getReviews(attractionName);
    const avgRating = calculateAverageRating(attractionName);

    avgRatingValueElement.textContent = reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? t.reviewCountSingular : t.reviewCountPlural})` : t.noReviewsYet;

    if (reviews.length === 0) {
        reviewsListElement.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 20px 0;">${t.noReviewsYet}</p>`;
        return;
    }

    reviews.forEach((review, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');
        reviewItem.style.animationDelay = `${index * 0.1}s`;

        let starsDisplay = '';
        for (let i = 0; i < 5; i++) {
            starsDisplay += `<span class="star-icon" aria-hidden="true">${i < review.stars ? '&#9733;' : '&#9734;'}</span>`; // Filled or empty star
        }

        const ariaLabel = t.starRatingAriaLabel.replace('{score}', review.stars);

        const userNameP = document.createElement('p');
        userNameP.className = 'user-name';
        // Security: textContent escapes HTML automatically, so this is safe even if review.user contains script
        userNameP.textContent = (review.user || t.anonymousUser) + ' ';

        const starsSpan = document.createElement('span');
        starsSpan.className = 'rating-static';
        starsSpan.setAttribute('role', 'img');
        starsSpan.setAttribute('aria-label', ariaLabel);
        starsSpan.innerHTML = starsDisplay; // Trusted content generated by loop
        userNameP.appendChild(starsSpan);

        const reviewTextP = document.createElement('p');
        reviewTextP.className = 'review-text';
        // Security: textContent escapes HTML automatically, so this is safe
        reviewTextP.textContent = review.review;

        reviewItem.appendChild(userNameP);
        reviewItem.appendChild(reviewTextP);
        reviewsListElement.appendChild(reviewItem);
    });
}

// Centralized Modal Management
function openModal(modal) {
    lastFocusedElement = document.activeElement;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    // Accessibility: Hide background content
    document.getElementById('map').setAttribute('aria-hidden', 'true');
    const controls = document.querySelector('.ui-controls');
    if (controls) controls.setAttribute('aria-hidden', 'true');

    // Focus first focusable element (usually close button or title)
    const closeBtn = modal.querySelector('.close-button');
    if (closeBtn) closeBtn.focus();

    trapFocus(modal);
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.remove('active'); // Ensure active class is removed (for SIGINT)
    modal.setAttribute('aria-hidden', 'true');

    // Restore background accessibility
    document.getElementById('map').removeAttribute('aria-hidden');
    const controls = document.querySelector('.ui-controls');
    if (controls) controls.removeAttribute('aria-hidden');

    removeTrapFocus(modal);

    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }

    if (modal === reviewModal) currentlyReviewedAttraction = null;
}

function openReviewModal(attractionName) {
    currentlyReviewedAttraction = attractionName;
    const t = translations[appState.language];
    reviewModalTitle.textContent = `${t.reviewsFor} ${attractionName}`;

    renderReviews(attractionName);

    // Reset form
    reviewForm.reset();
    ratingValueInput.value = "0";
    const stars = starRatingContainer.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('selected');
        star.setAttribute('aria-checked', 'false');
    });

    openModal(reviewModal);
}

function closeReviewModal() {
    closeModal(reviewModal);
}

function openTriviaModal(attractionName) {
    const attraction = attractions.find(a => a.name === attractionName);
    if (!attraction || !attraction.trivia) return;

    const t = translations[appState.language];
    triviaModalTitle.textContent = t.triviaModalTitle || "Did you know?";
    triviaModalContent.textContent = (attraction.trivia[appState.language] || attraction.trivia['en']) || "Trivia unavailable.";

    openModal(triviaModal);
}

function closeTriviaModal() {
    closeModal(triviaModal);
}

// Star rating interaction (Accessible Roving Tabindex)
const stars = starRatingContainer.querySelectorAll('.star');

function setRating(value) {
    ratingValueInput.value = value;
    stars.forEach(s => {
        const starValue = parseInt(s.dataset.value);
        const isSelected = starValue <= parseInt(value);
        s.classList.toggle('selected', isSelected);

        if (starValue === parseInt(value)) {
             s.setAttribute('aria-checked', 'true');
             s.tabIndex = 0; // Make this the focusable one
        } else {
             s.setAttribute('aria-checked', 'false');
             s.tabIndex = -1; // Remove others from tab order
        }
    });
    // If 0, make first focusable
    if (parseInt(value) === 0) {
        stars[0].tabIndex = 0;
    }
}

stars.forEach((star, index) => {
    star.addEventListener('click', function() {
        setRating(this.dataset.value);
    });

    star.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setRating(this.dataset.value);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < stars.length - 1) {
                stars[index + 1].focus();
                // Optionally select on arrow move:
                // setRating(stars[index + 1].dataset.value);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) {
                stars[index - 1].focus();
            }
        }
    });

    // Hover effect for stars
    star.addEventListener('mouseover', function() {
        const hoverValue = this.dataset.value;
        stars.forEach(s => {
            s.classList.toggle('hovered', parseInt(s.dataset.value) <= parseInt(hoverValue));
        });
    });
    star.addEventListener('mouseout', function() {
        stars.forEach(s => s.classList.remove('hovered'));
    });
});

reviewForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const t = translations[appState.language];
    const userName = userNameInput.value.trim() || t.anonymousUser;
    const rating = parseInt(ratingValueInput.value);
    const reviewText = reviewTextInput.value.trim();

    if (rating === 0) {
        showToast(t.selectRatingAlert);
        return;
    }
    if (!reviewText) {
        showToast(t.writeReviewAlert);
        return;
    }

    const newReview = {
        user: userName,
        stars: rating,
        review: reviewText,
        date: new Date().toISOString()
    };

    const success = appState.addReview(currentlyReviewedAttraction, newReview);

    if (success) {
        const confirmation = reviewModal.querySelector('.confirmation-message');
        confirmation.classList.add('visible');

        setTimeout(() => {
            confirmation.classList.remove('visible');
            renderReviews(currentlyReviewedAttraction);
            reviewForm.reset();
            ratingValueInput.value = "0";
            starRatingContainer.querySelectorAll('.star').forEach(s => {
                s.classList.remove('selected');
                s.setAttribute('aria-checked', 'false');
            });
        }, 1500);

        allMarkers.forEach(marker => {
            if (marker.attractionData.name === currentlyReviewedAttraction && marker.isPopupOpen()) {
                marker.setPopupContent(generatePopupContent(marker.attractionData));
                const popupNode = marker.getPopup()._contentNode;
                attachPopupListeners(popupNode, marker.attractionData);
            }
        });
    } else {
        showToast("Error saving review. Storage might be full.");
    }
});

closeReviewModalBtn.addEventListener('click', closeReviewModal);
closeTriviaModalBtn.addEventListener('click', closeTriviaModal);

// Close SIGINT Modal logic
const closeSigintModalBtn = document.getElementById('closeSigintModal');
const sigintModal = document.getElementById('sigintModal');

if (closeSigintModalBtn) {
    closeSigintModalBtn.addEventListener('click', () => {
        closeModal(sigintModal);
    });
}

window.addEventListener('click', function(event) {
    if (event.target === reviewModal) {
        closeModal(reviewModal);
    }
    if (event.target === triviaModal) {
        closeModal(triviaModal);
    }
    if (event.target === sigintModal) {
        closeModal(sigintModal);
    }
});

// Close modals on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (reviewModal.style.display === 'flex') {
            closeModal(reviewModal);
        } else if (triviaModal.style.display === 'flex') {
            closeModal(triviaModal);
        } else if (sigintModal && (sigintModal.style.display === 'flex' || sigintModal.classList.contains('active'))) {
            closeModal(sigintModal);
        } else if (dreamMode) {
            // Exit Dream Mode on Escape
            toggleDreamMode();
        }
    }
});

// Accessibility: Focus Trap Logic
// Exporting to global scope for other modules to use
window.trapFocus = function(modal) {
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let focusableElements = modal.querySelectorAll(focusableElementsString);
    focusableElements = Array.prototype.slice.call(focusableElements);

    const firstTabStop = focusableElements[0];
    const lastTabStop = focusableElements[focusableElements.length - 1];

    function trap(e) {
        if (e.key === 'Tab') {
            // Shift + Tab
            if (e.shiftKey) {
                if (document.activeElement === firstTabStop) {
                    e.preventDefault();
                    lastTabStop.focus();
                }
            }
            // Tab
            else {
                if (document.activeElement === lastTabStop) {
                    e.preventDefault();
                    firstTabStop.focus();
                }
            }
        }
    }

    modal.addEventListener('keydown', trap);
    // Store the listener so we can remove it later
    modal._trapListener = trap;
}

window.removeTrapFocus = function(modal) {
    if (modal._trapListener) {
        modal.removeEventListener('keydown', modal._trapListener);
        delete modal._trapListener;
    }
}



// Helper function to attach listeners to popup buttons
function attachPopupListeners(popupNode, attractionData) {
    const viewReviewsButton = popupNode.querySelector('.view-reviews-btn');
    if (viewReviewsButton) {
        viewReviewsButton.onclick = function() {
            openReviewModal(attractionData.name);
        };
    }

    const triviaButton = popupNode.querySelector('.trivia-btn');
    if (triviaButton) {
        triviaButton.onclick = function() {
            openTriviaModal(attractionData.name);
        };
    }

    const missionButton = popupNode.querySelector('.mission-btn');
    if (missionButton) {
        missionButton.onclick = function() {
            const t = translations[appState.language];
            if (appState.isInItinerary(attractionData.name)) {
                appState.removeFromItinerary(attractionData.name);
                showToast(t.targetRemoved || "Target removed");
            } else {
                appState.addToItinerary(attractionData.name);
                showToast(t.targetAdded || "Target added");
            }
        };
    }

    const droneButton = popupNode.querySelector('.drone-btn');
    if (droneButton) {
        droneButton.onclick = function() {
             if (scoutOpsCenter && !scoutOpsCenter.isOpsActive) {
                 scoutOpsCenter.toggleOpsCenter();
             }
             scoutOpsCenter.deployDrone(attractionData.name);
             map.closePopup();
        };
    }
}

// Event delegation for popups to set content and attach listeners
map.on('popupopen', function(e) {
    const marker = e.popup._source;
    if (marker && marker.attractionData) {
        e.popup.setContent(generatePopupContent(marker.attractionData));
        const popupNode = e.popup._contentNode;
        attachPopupListeners(popupNode, marker.attractionData);
    }
});

// --- Dream Mode ---
let wasGenerativeBeforeDream = false;
function toggleDreamMode() {
    dreamMode = !dreamMode;
    document.body.classList.toggle('dream-mode', dreamMode);

    if (dreamMode) {
        // --- Entering Dream Mode ---
        wasGenerativeBeforeDream = generativeMode;
        if (!wasGenerativeBeforeDream) {
            // Activate generative mode if it wasn't already
            toggleGenerativeMode();
        }

        // Disable map interaction
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();
        document.getElementById('map').style.cursor = 'default';

        // Add a dreamy overlay (its style will be updated in CSS)
        if (!document.getElementById('dreamOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'dreamOverlay';

            // Add a status message to the overlay
            const t = translations[appState.language] || translations['en'];
            const message = document.createElement('div');
            message.id = 'dreamStatusMsg';
            message.textContent = t.dreamModeActive || "Dream Mode Active: Map interaction disabled";
            message.setAttribute('role', 'status');
            overlay.appendChild(message);

            // Insert it inside the map container but before the controls
            const mapContainer = document.getElementById('map');
            mapContainer.insertBefore(overlay, mapContainer.firstChild);
        }
    } else {
        // --- Exiting Dream Mode ---
        if (!wasGenerativeBeforeDream) {
            // Deactivate generative mode only if it was off before dream
            toggleGenerativeMode();
        }

        // Enable map interaction
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();
        document.getElementById('map').style.cursor = 'grab';

        // Remove the overlay
        const overlay = document.getElementById('dreamOverlay');
        if (overlay) {
            overlay.remove();
        }

        // UX: Ensure Generative Mode button state reflects reality
        // If we kept Generative Mode on (because it was on before), button should be active.
        // If we turned it off (because it was off before), button should be inactive.
        generativeModeBtn.classList.toggle('active', generativeMode);
    }
}


// --- Toast Notification ---
function showToast(message, duration = 3000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

    toastContainer.appendChild(toast);

    // Trigger reflow to enable transition
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, duration);
}

// --- Language Functions ---
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language "${lang}" not found. Falling back to English.`);
        lang = 'en';
    }
    appState.setLanguage(lang);
    const t = translations[appState.language];

    // Update general UI elements
    dreamModeBtn.textContent = t.dreamModeButton;
    exploreBtn.textContent = t.exploreButton;
    generativeModeBtn.textContent = t.generativeModeButton;

    // Update Mission Control elements
    document.getElementById('missionTitle').textContent = t.missionPlanTitle;
    missionControlToggle.textContent = t.missionControlToggle;
    document.getElementById('targetsLabel').textContent = t.targetsStats;
    clearMissionBtn.textContent = t.abortMissionBtn;
    closeMissionControlBtn.setAttribute('aria-label', t.closeMissionControlAria);
    searchBox.setAttribute('aria-label', t.searchAria);
    searchBox.setAttribute('placeholder', t.searchPlaceholder || t.searchAria); // Update placeholder
    typeFilter.setAttribute('aria-label', t.filterAria);

    const missionDistanceEl = document.querySelector('.mission-distance');
    if (missionDistanceEl) {
        // Preserve the span value
        const span = missionDistanceEl.querySelector('span');
        missionDistanceEl.innerHTML = `${t.totalDistance}: `;
        missionDistanceEl.appendChild(span);
    }
    const reconBtn = document.getElementById('reconBtn');
    if (reconBtn) {
        reconBtn.textContent = t.executeRecon;
    }

    // Update Review Modal UI elements
    // reviewModalTitle.textContent = t.reviewsFor; // This will be set dynamically when modal opens
    currentAverageRatingElement.childNodes[0].nodeValue = `${t.averageRatingModal}: `; // Update text part of "Average Rating: N/A"
    addReviewTitleElement.textContent = t.addReviewTitle;
    userNameLabelElement.textContent = t.userNameLabel;
    ratingLabelElement.textContent = t.ratingLabel;
    reviewTextLabelElement.textContent = t.reviewTextLabel;
    submitReviewBtnElement.textContent = t.submitReviewBtn;

    // If review modal is open and showing reviews for an attraction, refresh its content
    if (reviewModal.style.display === 'flex' && currentlyReviewedAttraction) {
        reviewModalTitle.textContent = `${t.reviewsFor} ${currentlyReviewedAttraction}`; // Update title with current attraction
        renderReviews(currentlyReviewedAttraction); // Re-render reviews with new language
    } else {
        // If modal is closed, just update the placeholder text for average rating if needed
         avgRatingValueElement.textContent = t.noReviewsYet; // Or a generic "N/A" if preferred before opening
    }


    langButtons.forEach(button => {
        button.classList.toggle('activeLang', button.dataset.lang === appState.language);
    });

    // Refresh the currently open popup, if any
    allMarkers.forEach(marker => {
        if (marker.isPopupOpen()) {
            marker.setPopupContent(generatePopupContent(marker.attractionData));
            // Re-attach listeners for the new popup content
            const popupNode = marker.getPopup()._contentNode;
            attachPopupListeners(popupNode, marker.attractionData);
        }
    });
}

// Add event listeners to language buttons
langButtons.forEach(button => {
    button.addEventListener('click', function() {
        setLanguage(this.dataset.lang);
    });
});

dreamModeBtn.addEventListener('click', toggleDreamMode);

function toggleGenerativeMode() {
    generativeMode = !generativeMode;
    if (generativeMode) {
        map.addLayer(generativeLayer);
        generativeLayer.bringToFront();
        baseLayer.setOpacity(0.5); // Make original layer visible underneath
    } else {
        map.removeLayer(generativeLayer);
        baseLayer.setOpacity(1);
    }
    document.body.classList.toggle('generative-mode', generativeMode);
    generativeModeBtn.classList.toggle('active', generativeMode);
}

generativeModeBtn.addEventListener('click', toggleGenerativeMode);

exploreBtn.addEventListener('click', () => {
    const randomAttraction = attractions[Math.floor(Math.random() * attractions.length)];

    // Safety check if no attractions
    if (!randomAttraction) return;

    map.flyTo([randomAttraction.lat, randomAttraction.lng], 12, {
        animate: true,
        duration: 2.5
    });

    // Use event listener instead of timeout for reliability (Race Condition Fix)
    const onMoveEnd = () => {
        const marker = allMarkers.find(m => m.attractionData.name === randomAttraction.name);
        if (marker) {
            marker.openPopup();
        }
    };

    // Safety timeout in case moveend doesn't fire (e.g., already there)
    const safetyTimeout = setTimeout(() => {
        map.off('moveend', onMoveEnd);
        onMoveEnd();
    }, 3000);

    map.once('moveend', () => {
        clearTimeout(safetyTimeout);
        onMoveEnd();
    });
});

// --- Filtering Logic ---
function filterMarkers() {
    const searchTerm = searchBox.value.toLowerCase();
    const type = typeFilter.value;
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    let hasResults = false;

    allMarkers.forEach(marker => {
        const attraction = marker.attractionData;
        const nameMatch = attraction.name.toLowerCase().includes(searchTerm);
        const typeMatch = (type === 'all') || (attraction.type === type);

        if (nameMatch && typeMatch) {
            marker.addTo(map);

            // Populate Dropdown if searching
            if (searchTerm.length > 0) {
                hasResults = true;
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = attraction.name;
                item.setAttribute('role', 'option');
                item.tabIndex = 0; // Accessibility

                item.addEventListener('click', () => {
                    map.flyTo([attraction.lat, attraction.lng], 12);
                    marker.openPopup();
                    searchBox.value = attraction.name;
                    searchResults.classList.remove('active');
                });

                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        item.click();
                    }
                });

                searchResults.appendChild(item);
            }

        } else {
            map.removeLayer(marker);
        }
    });

    if (hasResults) {
        searchResults.classList.add('active');
    } else {
        searchResults.classList.remove('active');
    }
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const container = document.getElementById('filter-container');
    const searchResults = document.getElementById('searchResults');
    if (container && !container.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Performance: Debounce search input to prevent layout thrashing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

searchBox.addEventListener('input', debounce(filterMarkers, 300));
typeFilter.addEventListener('change', filterMarkers);

// --- Mission Control Logic ---

function toggleMissionControl() {
    missionControlPanel.classList.toggle('open');
    missionControlToggle.classList.toggle('active');
    const isHidden = !missionControlPanel.classList.contains('open');
    missionControlPanel.setAttribute('aria-hidden', isHidden);

    // Accessibility: Update aria-expanded
    missionControlToggle.setAttribute('aria-expanded', !isHidden);

    if (!isHidden) {
        // Accessibility: Move focus to the panel when opened
        const closeBtn = document.getElementById('closeMissionControl');
        if (closeBtn) closeBtn.focus();
    } else {
        // Return focus to toggle button when closed
        missionControlToggle.focus();
    }
}

missionControlToggle.addEventListener('click', toggleMissionControl);
closeMissionControlBtn.addEventListener('click', toggleMissionControl);

function renderMissionList(itinerary) {
    const t = translations[appState.language];
    missionCountElement.textContent = itinerary.length;

    if (itinerary.length === 0) {
        missionListElement.innerHTML = `<p class="empty-state">${t.noTargets}</p>`;
        return;
    }

    missionListElement.innerHTML = '';
    itinerary.forEach((attractionName, index) => {
        const item = document.createElement('div');
        item.className = 'mission-item';

        // Content wrapper for name and remove button
        const contentDiv = document.createElement('div');
        contentDiv.className = 'item-content';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = attractionName;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.setAttribute('aria-label', `${t.removeFromItinerary} ${attractionName}`);
        removeBtn.dataset.name = attractionName;
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            appState.removeFromItinerary(attractionName);
        });

        contentDiv.appendChild(nameSpan);
        contentDiv.appendChild(removeBtn);

        // Sequence Controls (Up/Down)
        const btnGroup = document.createElement('div');
        btnGroup.className = 'mission-btn-group';

        const upBtn = document.createElement('button');
        upBtn.className = 'move-btn';
        upBtn.innerHTML = '&#9650;'; // Up Arrow
        upBtn.setAttribute('aria-label', t.moveUpAria.replace('{name}', attractionName));
        upBtn.disabled = index === 0;
        upBtn.addEventListener('click', () => appState.moveItemUp(attractionName));

        const downBtn = document.createElement('button');
        downBtn.className = 'move-btn';
        downBtn.innerHTML = '&#9660;'; // Down Arrow
        downBtn.setAttribute('aria-label', t.moveDownAria.replace('{name}', attractionName));
        downBtn.disabled = index === itinerary.length - 1;
        downBtn.addEventListener('click', () => appState.moveItemDown(attractionName));

        btnGroup.appendChild(upBtn);
        btnGroup.appendChild(downBtn);

        item.appendChild(contentDiv);
        item.appendChild(btnGroup);
        missionListElement.appendChild(item);
    });
}

// Initial Render of Mission List
renderMissionList(appState.itinerary);

// Listen for itinerary changes
appState.subscribe('itineraryChanged', (itinerary) => {
    renderMissionList(itinerary);

    // Update Threat Profile
    if (pathfinderSystem) {
        pathfinderSystem.renderProfile(itinerary, 'threatProfileGraph');
    }

    // Refresh popups to update button state
    allMarkers.forEach(marker => {
        // Update marker style
        const icon = marker.getElement();
        if (icon) {
            if (appState.isInItinerary(marker.attractionData.name)) {
                icon.classList.add('mission-target');
            } else {
                icon.classList.remove('mission-target');
            }
        }

        if (marker.isPopupOpen()) {
            marker.setPopupContent(generatePopupContent(marker.attractionData));
            const popupNode = marker.getPopup()._contentNode;
            attachPopupListeners(popupNode, marker.attractionData);
        }
    });
});

clearMissionBtn.addEventListener('click', () => {
    appState.clearItinerary();
});

// Recon Button Event Listener
const reconBtn = document.getElementById('reconBtn');
if (reconBtn) {
    reconBtn.addEventListener('click', () => {
        if (missionPlanner) {
            missionPlanner.executeRecon();
        }
    });
}

setLanguage(appState.language);
