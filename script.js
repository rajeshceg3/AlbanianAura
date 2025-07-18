// Get references to HTML elements
const langButtons = document.querySelectorAll('#langSwitcher button');
const dreamModeBtn = document.getElementById('dreamModeBtn');

// Review Modal Elements
const reviewModal = document.getElementById('reviewModal');
const closeReviewModalBtn = document.getElementById('closeReviewModal');
const reviewModalTitle = document.getElementById('reviewModalTitle');
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
let currentLanguage = 'en'; // Default language
let attractionReviews = {}; // To store reviews: { "AttractionName": [{user, stars, review}, ...], ... }
let currentlyReviewedAttraction = null; // To keep track of which attraction's modal is open
let dreamMode = false;


// Define attractions
// (Assuming translations object is available from languages.js)
const attractions = [
  { name: 'Tirana', lat: 41.3275, lng: 19.8187, type: 'city' },
  { name: 'Berat', lat: 40.7050, lng: 19.9522, type: 'city' },
  { name: 'Gjirokastër', lat: 40.0755, lng: 20.1397, type: 'city' },
  { name: 'Albanian Riviera', lat: 40.1500, lng: 19.7833, type: 'beach' }, // Approximate center
  { name: 'Llogara Pass', lat: 40.2000, lng: 19.5833, type: 'nature' },
  { name: 'Lake Ohrid (Albanian side)', lat: 41.0000, lng: 20.7000, type: 'nature' }, // Approximate for Albanian part
  { name: 'Theth National Park', lat: 42.3950, lng: 19.7736, type: 'nature' },
  { name: 'Ksamil', lat: 39.7667, lng: 20.0000, type: 'beach' },
  { name: 'Rozafa Castle', lat: 42.0469, lng: 19.4928, type: 'history' },
  { name: 'Butrint', lat: 39.7464, lng: 20.0194, type: 'history' }
];

// Initialize the map and set its view to Albania
var map = L.map('map').setView([41.1533, 20.1683], 7); // Coordinates for Albania and zoom level

// Add a tile layer to the map (using OpenStreetMap)
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let generativeLayer = null;

const allMarkers = [];
const pulsatingMarkers = [];

// Helper function to generate popup content
function generatePopupContent(attraction) {
    const t = translations[currentLanguage];
    const description = `Discover the beauty of ${attraction.name}. More details coming soon!`;

    // Rating and Review related content
    const reviews = attractionReviews[attraction.name] || [];
    const avgRating = calculateAverageRating(attraction.name);
    let ratingDisplay = t.noReviewsYetPopup; // Default text
    if (reviews.length > 0) {
        ratingDisplay = `${t.averageRatingPopup}: ${avgRating.toFixed(1)} <span class="star-icon">&#9733;</span> (${reviews.length} ${reviews.length === 1 ? t.reviewCountSingular : t.reviewCountPlural})`;
    }

    return `
        <h3>${attraction.name}</h3>
        <p>${description}</p>
        <div class="popup-rating-summary">
            <span class="avg-rating-text">${ratingDisplay}</span>
        </div>
        <button class="view-reviews-btn" data-name="${attraction.name}">${t.viewAddReviewBtn}</button>
        <hr style="margin: 8px 0;">
        <a href="#" target="_blank">${t.moreInfoLink}</a> | <a href="#" target="_blank">${t.bookingsLink}</a>
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
  marker.addTo(map);
  allMarkers.push(marker);

  // Initialize review array for each attraction
  if (!attractionReviews[attraction.name]) {
    attractionReviews[attraction.name] = [];
  }
});

// --- Review Functions ---

function calculateAverageRating(attractionName) {
    const reviews = attractionReviews[attractionName] || [];
    if (reviews.length === 0) return 0;
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    return totalStars / reviews.length;
}

function renderReviews(attractionName) {
    const t = translations[currentLanguage];
    reviewsListElement.innerHTML = ''; // Clear current reviews
    const reviews = attractionReviews[attractionName] || [];
    const avgRating = calculateAverageRating(attractionName);

    avgRatingValueElement.textContent = reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? t.reviewCountSingular : t.reviewCountPlural})` : t.noReviewsYet;

    if (reviews.length === 0) {
        reviewsListElement.innerHTML = `<p>${t.noReviewsYet}.</p>`;
        return;
    }

    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');

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
    currentlyReviewedAttraction = attractionName;
    const t = translations[currentLanguage];
    reviewModalTitle.textContent = `${t.reviewsFor} ${attractionName}`;

    renderReviews(attractionName);

    // Reset form
    reviewForm.reset();
    ratingValueInput.value = "0"; // Reset hidden star value
    // Reset visual stars
    const stars = starRatingContainer.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('selected'));

    reviewModal.style.display = 'flex';
}

function closeReviewModal() {
    reviewModal.style.display = 'none';
    currentlyReviewedAttraction = null;
}

// Star rating interaction
starRatingContainer.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
        const value = this.dataset.value;
        ratingValueInput.value = value;
        starRatingContainer.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('selected', parseInt(s.dataset.value) <= parseInt(value));
        });
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
    const t = translations[currentLanguage];
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

    if (!attractionReviews[currentlyReviewedAttraction]) {
        attractionReviews[currentlyReviewedAttraction] = [];
    }
    attractionReviews[currentlyReviewedAttraction].push(newReview);

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
window.addEventListener('click', function(event) { // Close modal if clicked outside
    if (event.target === reviewModal) {
        closeReviewModal();
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

function createGenerativeLayer() {
    const GenerativeLayer = L.GridLayer.extend({
        createTile: function (coords) {
            const tile = document.createElement('canvas');
            const tileSize = this.getTileSize();
            tile.width = tileSize.x;
            tile.height = tileSize.y;
            const ctx = tile.getContext('2d');

            // Ethereal background
            const gradient = ctx.createRadialGradient(tileSize.x / 2, tileSize.y / 2, 0, tileSize.x / 2, tileSize.y / 2, tileSize.x);
            gradient.addColorStop(0, `hsl(${Math.random() * 360}, 100%, 75%, 0.1)`);
            gradient.addColorStop(1, `hsl(${Math.random() * 360}, 100%, 50%, 0)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, tileSize.x, tileSize.y);

            // Floating particles
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * tileSize.x, Math.random() * tileSize.y, Math.random() * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
                ctx.fill();
            }

            return tile;
        }
    });
    return new GenerativeLayer();
}

function createPulsatingMarker(attraction) {
    const latlng = [attraction.lat, attraction.lng];
    const marker = L.circleMarker(latlng, {
        radius: 10,
        fillColor: "#ff0000",
        color: "#ff0000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'pulsating-marker'
    });

    marker.on('click', () => {
        createRippleEffect(attraction.lat, attraction.lng);
        const phrase = getSurrealPhrase(attraction.name);
        L.popup()
            .setLatLng(latlng)
            .setContent(phrase)
            .openOn(map);
    });

    return marker;
}

function createRippleEffect(lat, lng) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const ripple = L.circle([lat, lng], {
                radius: 0,
                color: 'white',
                weight: 2,
                fillOpacity: 0,
                className: 'ripple-effect'
            }).addTo(map);

            let radius = 0;
            const interval = setInterval(() => {
                radius += 200;
                ripple.setRadius(radius);
                if (radius > 2000) {
                    clearInterval(interval);
                    map.removeLayer(ripple);
                }
            }, 50);
        }, i * 200);
    }
}

function getSurrealPhrase(attractionName) {
    switch (attractionName) {
        case 'Tirana':
            return "The city breathes in whispers of concrete and color.";
        case 'Berat':
            return "A thousand windows gaze into the void.";
        case 'Gjirokastër':
            return "Stones remember the footsteps of forgotten kings.";
        case 'Albanian Riviera':
            return "Where the sea sings lullabies to the sleeping mountains.";
        case 'Llogara Pass':
            return "The wind carries tales from the eagle's nest.";
        case 'Lake Ohrid (Albanian side)':
            return "Time sleeps in the deep, cold heart of the lake.";
        case 'Theth National Park':
            return "Here, the mountains dream of a world without men.";
        case 'Ksamil':
            return "Islands of memory in a sea of turquoise forgetting.";
        case 'Rozafa Castle':
            return "A mother's love, a fortress of sorrow.";
        case 'Butrint':
            return "Echoes of empires in the rustling reeds.";
        default:
            return "A place between worlds.";
    }
}

function toggleDreamMode() {
    document.body.classList.toggle('dream-mode', dreamMode);

    if (dreamMode) {
        if (!generativeLayer) {
            generativeLayer = createGenerativeLayer();
        }
        generativeLayer.addTo(map);
        baseLayer.setOpacity(0.1); // Keep it slightly visible for context

        allMarkers.forEach(marker => map.removeLayer(marker));
        pulsatingMarkers.forEach(marker => marker.addTo(map));

    } else {
        if (generativeLayer) {
            generativeLayer.remove();
        }
        baseLayer.setOpacity(1);

        pulsatingMarkers.forEach(marker => map.removeLayer(marker));
        allMarkers.forEach(marker => marker.addTo(map));
    }
}


// --- Language Functions ---
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language "${lang}" not found. Falling back to English.`);
        lang = 'en';
    }
    currentLanguage = lang;
    const t = translations[currentLanguage];

    // Update general UI elements
    dreamModeBtn.textContent = t.dreamModeButton;

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
        button.classList.toggle('activeLang', button.dataset.lang === currentLanguage);
    });

    if (map.closePopup) {
        map.closePopup();
    }
    // Refresh currently open popup if any
    allMarkers.forEach(marker => {
        if (marker.isPopupOpen()) {
            marker.setPopupContent(generatePopupContent(marker.attractionData));
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

dreamModeBtn.addEventListener('click', () => {
    dreamMode = !dreamMode;
    toggleDreamMode();
});

// Initial render and language setting
// Sample reviews data (can be expanded)
attractionReviews = {
    'Tirana': [
        { user: 'Alex', stars: 5, review: 'Vibrant city with lots to see!' },
        { user: 'Maria', stars: 4, review: 'Good coffee, friendly people.' }
    ],
    'Berat': [
        { user: 'John D.', stars: 5, review: 'Absolutely stunning, a must-see.' }
    ],
    // ... add more sample reviews for other attractions if desired
};

// Create pulsating markers once and store them
attractions.forEach(attraction => {
    pulsatingMarkers.push(createPulsatingMarker(attraction));
});

setLanguage(currentLanguage);
