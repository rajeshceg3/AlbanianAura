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
const attractions = attractionsData;

// Initialize the map and set its view to Albania
var map = L.map('map', { tap: false }).setView([41.1533, 20.1683], 7); // Coordinates for Albania and zoom level

// Add a tile layer to the map (using a pastel-themed layer)
const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

let generativeLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

const allMarkers = [];

// Helper function to generate popup content
function generatePopupContent(attraction) {
    const t = translations[appState.language];
    const description = attractions.find(a => a.name === attraction.name)?.description[appState.language] || `Discover the beauty of ${attraction.name}. More details coming soon!`;
    const moreInfoLink = attractions.find(a => a.name === attraction.name)?.moreInfoLink || '#';
    const bookingsLink = attractions.find(a => a.name === attraction.name)?.bookingsLink || '#';

    // Rating and Review related content
    const reviews = appState.getReviews(attraction.name);
    const avgRating = calculateAverageRating(attraction.name);
    let ratingDisplay = t.noReviewsYetPopup; // Default text
    if (reviews.length > 0) {
        ratingDisplay = `${t.averageRatingPopup}: ${avgRating.toFixed(1)} <span class="star-icon">&#9733;</span> (${reviews.length} ${reviews.length === 1 ? t.reviewCountSingular : t.reviewCountPlural})`;
    }

    const isInMission = appState.isInItinerary(attraction.name);
    const missionBtnText = isInMission ? t.removeFromItinerary : t.addToItinerary;
    const missionBtnClass = isInMission ? 'mission-btn remove' : 'mission-btn add';

    return `
        <h3>${attraction.name}</h3>
        <p>${description}</p>
        <div class="popup-rating-summary">
            <span class="avg-rating-text">${ratingDisplay}</span>
        </div>
        <div class="popup-actions">
            <button class="view-reviews-btn" data-name="${attraction.name}">${t.viewAddReviewBtn}</button>
            <button class="trivia-btn" data-name="${attraction.name}">${t.triviaButton}</button>
            <button class="${missionBtnClass}" data-name="${attraction.name}">${missionBtnText}</button>
        </div>
        <hr style="margin: 8px 0;">
        <a href="${moreInfoLink}" target="_blank">${t.moreInfoLink}</a> | <a href="${bookingsLink}" target="_blank">${t.bookingsLink}</a>
    `;
}

// Helper function to create a custom icon
function createCustomIcon() {
    return L.divIcon({
        className: 'custom-marker',
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

    // Initial check for mission status styling
    // We need to wait for the marker to be added to DOM to access .getElement(),
    // but addTo(map) should handle that if the map is initialized.
    // However, custom icons might take a split second.
    // Let's just do it in the next tick or trust it works if we add a class to the divIcon options initially if we wanted.
    // But since I'm modifying classList of the element, I'll rely on the subscription or a one-time init.
});

// One-time init for marker styles after they are added
setTimeout(() => {
    allMarkers.forEach(marker => {
         const icon = marker.getElement();
         if (icon && appState.isInItinerary(marker.attractionData.name)) {
             icon.classList.add('mission-target');
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
            starsDisplay += `<span class="star-icon">${i < review.stars ? '&#9733;' : '&#9734;'}</span>`; // Filled or empty star
        }

        reviewItem.innerHTML = `
            <p class="user-name">${review.user || t.anonymousUser} <span class="rating-static">${starsDisplay}</span></p>
            <p class="review-text">${review.review}</p>
        `;
        reviewsListElement.appendChild(reviewItem);
    });
}

function openReviewModal(attractionName) {
    lastFocusedElement = document.activeElement;
    currentlyReviewedAttraction = attractionName;
    const t = translations[appState.language];
    reviewModalTitle.textContent = `${t.reviewsFor} ${attractionName}`;

    renderReviews(attractionName);

    // Reset form
    reviewForm.reset();
    ratingValueInput.value = "0"; // Reset hidden star value
    // Reset visual stars
    const stars = starRatingContainer.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('selected'));

    reviewModal.style.display = 'flex';
    closeReviewModalBtn.focus();
}

function closeReviewModal() {
    reviewModal.style.display = 'none';
    currentlyReviewedAttraction = null;
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

function openTriviaModal(attractionName) {
    lastFocusedElement = document.activeElement;
    const attraction = attractions.find(a => a.name === attractionName);
    if (!attraction || !attraction.trivia) return;

    const t = translations[appState.language];
    triviaModalTitle.textContent = t.triviaModalTitle || "Did you know?";
triviaModalContent.textContent = attraction.trivia[appState.language] ?? attraction.trivia.en;
    triviaModal.style.display = 'flex';
    closeTriviaModalBtn.focus();
}

function closeTriviaModal() {
    triviaModal.style.display = 'none';
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// Star rating interaction
starRatingContainer.querySelectorAll('.star').forEach(star => {
    function setRating(value) {
        ratingValueInput.value = value;
        starRatingContainer.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('selected', parseInt(s.dataset.value) <= parseInt(value));
        });
    }

    star.addEventListener('click', function() {
        setRating(this.dataset.value);
    });

    star.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setRating(this.dataset.value);
        }
    });

    // Hover effect for stars
    star.addEventListener('mouseover', function() {
        const hoverValue = this.dataset.value;
        starRatingContainer.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('hovered', parseInt(s.dataset.value) <= parseInt(hoverValue));
        });
    });
    star.addEventListener('mouseout', function() {
        starRatingContainer.querySelectorAll('.star').forEach(s => s.classList.remove('hovered'));
    });
});

reviewForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const t = translations[appState.language];
    const userName = userNameInput.value.trim() || t.anonymousUser;
    const rating = parseInt(ratingValueInput.value);
    const reviewText = reviewTextInput.value.trim();

    if (rating === 0) {
        alert(t.selectRatingAlert); // Or display this message in a less intrusive way
        return;
    }
    if (!reviewText) {
        alert(t.writeReviewAlert); // Or display this message in a less intrusive way
        return;
    }

    const newReview = {
        user: userName,
        stars: rating,
        review: reviewText,
        date: new Date().toISOString() // Optional: store review date
    };

    appState.addReview(currentlyReviewedAttraction, newReview);

    // Show confirmation
    const confirmation = reviewModal.querySelector('.confirmation-message');
    confirmation.classList.add('visible');

    setTimeout(() => {
        confirmation.classList.remove('visible');
        renderReviews(currentlyReviewedAttraction); // Re-render reviews in modal
        reviewForm.reset();
        ratingValueInput.value = "0";
        starRatingContainer.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
    }, 1500);


    // Optionally, refresh the popup if it's open for this attraction
    allMarkers.forEach(marker => {
        if (marker.attractionData.name === currentlyReviewedAttraction && marker.isPopupOpen()) {
            marker.setPopupContent(generatePopupContent(marker.attractionData));
             // Re-attach listeners for the new popup content
            const popupNode = marker.getPopup()._contentNode;
            attachPopupListeners(popupNode, marker.attractionData);
        }
    });
});

closeReviewModalBtn.addEventListener('click', closeReviewModal);
closeTriviaModalBtn.addEventListener('click', closeTriviaModal);
window.addEventListener('click', function(event) { // Close modal if clicked outside
    if (event.target === reviewModal) {
        closeReviewModal();
    }
    if (event.target === triviaModal) {
        closeTriviaModal();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (reviewModal.style.display === 'flex') {
            closeReviewModal();
        }
        if (triviaModal.style.display === 'flex') {
            closeTriviaModal();
        }
    }
});



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
            if (appState.isInItinerary(attractionData.name)) {
                appState.removeFromItinerary(attractionData.name);
            } else {
                appState.addToItinerary(attractionData.name);
            }
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
    }
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
    map.flyTo([randomAttraction.lat, randomAttraction.lng], 12, {
        animate: true,
        duration: 2.5
    });

    // Open popup after flying to the location
    setTimeout(() => {
        const marker = allMarkers.find(m => m.attractionData.name === randomAttraction.name);
        if (marker) {
            marker.openPopup();
        }
    }, 2600); // Wait for the flight animation to finish
});

// --- Filtering Logic ---
function filterMarkers() {
    const searchTerm = searchBox.value.toLowerCase();
    const type = typeFilter.value;

    allMarkers.forEach(marker => {
        const attraction = marker.attractionData;
        const nameMatch = attraction.name.toLowerCase().includes(searchTerm);
        const typeMatch = (type === 'all') || (attraction.type === type);

        if (nameMatch && typeMatch) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

searchBox.addEventListener('input', filterMarkers);
typeFilter.addEventListener('change', filterMarkers);

// --- Mission Control Logic ---

function toggleMissionControl() {
    missionControlPanel.classList.toggle('open');
    missionControlToggle.classList.toggle('active');
    const isHidden = !missionControlPanel.classList.contains('open');
    missionControlPanel.setAttribute('aria-hidden', isHidden);
}

missionControlToggle.addEventListener('click', toggleMissionControl);
closeMissionControlBtn.addEventListener('click', toggleMissionControl);

function renderMissionList(itinerary) {
    const t = translations[appState.language];
    missionCountElement.textContent = itinerary.length;

    if (itinerary.length === 0) {
        missionListElement.innerHTML = `<p class="empty-state">${t.noReviewsYet ? 'No targets selected.' : 'No targets selected.'}</p>`; // Fallback string handling
        return;
    }

    missionListElement.innerHTML = '';
    itinerary.forEach(attractionName => {
        const item = document.createElement('div');
        item.className = 'mission-item';

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

        item.appendChild(nameSpan);
        item.appendChild(removeBtn);
        missionListElement.appendChild(item);
    });
}

// Initial Render of Mission List
renderMissionList(appState.itinerary);

// Listen for itinerary changes
appState.subscribe('itineraryChanged', (itinerary) => {
    renderMissionList(itinerary);

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

setLanguage(appState.language);
