// Get references to HTML elements
const langButtons = document.querySelectorAll('#langSwitcher button');
const dreamModeBtn = document.getElementById('dreamModeBtn');
const exploreBtn = document.getElementById('exploreBtn');

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
    {
        name: 'Tirana',
        lat: 41.3275,
        lng: 19.8187,
        type: 'city',
        description: {
            en: 'The vibrant capital of Albania, known for its colorful buildings and lively atmosphere.',
            sq: 'Kryeqyteti i gjallë i Shqipërisë, i njohur për ndërtesat e tij shumëngjyrëshe dhe atmosferën e gjallë.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Tirana',
        bookingsLink: 'https://www.booking.com/city/al/tirana.html'
    },
    {
        name: 'Berat',
        lat: 40.7050,
        lng: 19.9522,
        type: 'city',
        description: {
            en: 'A UNESCO World Heritage site, famous for its white Ottoman houses.',
            sq: 'Një sit i Trashëgimisë Botërore të UNESCO-s, i famshëm për shtëpitë e bardha osmane.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Berat',
        bookingsLink: 'https://www.booking.com/city/al/berat.html'
    },
    {
        name: 'Gjirokastër',
        lat: 40.0755,
        lng: 20.1397,
        type: 'city',
        description: {
            en: 'A well-preserved Ottoman town with a magnificent castle and stone houses.',
            sq: 'Një qytet osman i ruajtur mirë me një kështjellë madhështore dhe shtëpi guri.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Gjirokastër',
        bookingsLink: 'https://www.booking.com/city/al/gjirokaster.html'
    },
    {
        name: 'Albanian Riviera',
        lat: 40.1500,
        lng: 19.7833,
        type: 'beach',
        description: {
            en: 'Stunning coastline with crystal clear waters and beautiful beaches.',
            sq: 'Bregdeti mahnitës me ujëra të kristalta dhe plazhe të bukura.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Albanian_Riviera',
        bookingsLink: 'https://www.booking.com/region/al/albanian-riviera.html'
    },
    {
        name: 'Llogara Pass',
        lat: 40.2000,
        lng: 19.5833,
        type: 'nature',
        description: {
            en: 'A spectacular mountain pass with breathtaking views of the Ionian coast.',
            sq: 'Një kalim malor spektakolar me pamje mahnitëse të bregdetit Jon.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Llogara_Pass',
        bookingsLink: 'https://www.booking.com/hotel/al/llogara-tourist-village.html'
    },
    {
        name: 'Lake Ohrid (Albanian side)',
        lat: 41.0000,
        lng: 20.7000,
        type: 'nature',
        description: {
            en: 'One of Europe\'s oldest and deepest lakes, a UNESCO World Heritage site.',
            sq: 'Një nga liqenet më të vjetra dhe më të thella të Evropës, një sit i Trashëgimisë Botërore të UNESCO-s.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Lake_Ohrid',
        bookingsLink: 'https://www.booking.com/city/al/pogradec.html'
    },
    {
        name: 'Theth National Park',
        lat: 42.3950,
        lng: 19.7736,
        type: 'nature',
        description: {
            en: 'A stunningly beautiful area in the Albanian Alps, perfect for hiking.',
            sq: 'Një zonë mahnitëse e bukur në Alpet Shqiptare, e përkryer për ecje.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Theth_National_Park',
        bookingsLink: 'https://www.booking.com/city/al/theth.html'
    },
    {
        name: 'Ksamil',
        lat: 39.7667,
        lng: 20.0000,
        type: 'beach',
        description: {
            en: 'A beautiful village with pristine beaches and four small islands.',
            sq: 'Një fshat i bukur me plazhe të pacenuara dhe katër ishuj të vegjël.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Ksamil',
        bookingsLink: 'https://www.booking.com/city/al/ksamil.html'
    },
    {
        name: 'Rozafa Castle',
        lat: 42.0469,
        lng: 19.4928,
        type: 'history',
        description: {
            en: 'A legendary castle near Shkodër with panoramic views.',
            sq: 'Një kështjellë legjendare pranë Shkodrës me pamje panoramike.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Rozafa_Castle',
        bookingsLink: 'https://www.booking.com/city/al/shkoder.html'
    },
    {
        name: 'Butrint',
        lat: 39.7464,
        lng: 20.0194,
        type: 'history',
        description: {
            en: 'An ancient Greek and Roman city, a UNESCO World Heritage site.',
            sq: 'Një qytet i lashtë grek dhe romak, një sit i Trashëgimisë Botërore të UNESCO-s.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Butrint',
        bookingsLink: 'https://www.booking.com/attraction/al/butrint-national-park.html'
    }
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
    const description = attractions.find(a => a.name === attraction.name)?.description[currentLanguage] || `Discover the beauty of ${attraction.name}. More details coming soon!`;
    const moreInfoLink = attractions.find(a => a.name === attraction.name)?.moreInfoLink || '#';
    const bookingsLink = attractions.find(a => a.name === attraction.name)?.bookingsLink || '#';

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

function createDreamLayer() {
    const DreamLayer = L.GridLayer.extend({
        onAdd: function(map) {
            L.GridLayer.prototype.onAdd.call(this, map);
            this._map = map;
            this._canvas = document.createElement('canvas');
            this._canvas.style.position = 'absolute';
            this._canvas.style.pointerEvents = 'none';
            this.getPane().appendChild(this._canvas);
            this.on('tileunload', e => this._onTileUnload(e));
            this._resize();
            this._animate();
        },

        onRemove: function(map) {
            L.GridLayer.prototype.onRemove.call(this, map);
            this.getPane().removeChild(this._canvas);
        },

        _resize: function() {
            const size = this._map.getSize();
            this._canvas.width = size.x;
            this._canvas.height = size.y;
        },

        _onTileUnload: function(e) {
            // No-op, just to prevent errors
        },

        _animate: function() {
            if (!this._map) return;

            const ctx = this._canvas.getContext('2d');
            const width = this._canvas.width;
            const height = this._canvas.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Your animation logic here
            // Example: flowing particles
            if (!this._particles) {
                this._particles = [];
                for (let i = 0; i < 100; i++) {
                    this._particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: Math.random() - 0.5,
                        vy: Math.random() - 0.5,
                        radius: Math.random() * 2 + 1
                    });
                }
            }

            this._particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fill();
            });

            requestAnimationFrame(this._animate.bind(this));
        }
    });

    return new DreamLayer();
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
    const phrases = {
        'Tirana': "The city breathes in whispers of concrete and color.",
        'Berat': "A thousand windows gaze into the river of time.",
        'Gjirokastër': "Stones remember the footsteps of forgotten kings.",
        'Albanian Riviera': "Where the sea sings lullabies to the sleeping mountains.",
        'Llogara Pass': "The wind carries tales from the eagle's nest to the sun-bleached shores.",
        'Lake Ohrid (Albanian side)': "Time sleeps in the deep, cold heart of the ancient lake.",
        'Theth National Park': "Here, the mountains dream of a world without men, cloaked in mist.",
        'Ksamil': "Islands of memory in a sea of turquoise forgetting.",
        'Rozafa Castle': "A mother's love, a fortress of sorrow, watching the rivers meet.",
        'Butrint': "Echoes of empires in the rustling reeds, where history slumbers."
    };
    return phrases[attractionName] || "A place between worlds, waiting to be discovered.";
}

function toggleDreamMode() {
    document.body.classList.toggle('dream-mode', dreamMode);

    if (dreamMode) {
        if (!generativeLayer) {
            generativeLayer = createDreamLayer();
        }
        generativeLayer.addTo(map);
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();
        document.getElementById('map').style.cursor='default';

        allMarkers.forEach(marker => map.removeLayer(marker));
        pulsatingMarkers.forEach(marker => marker.addTo(map));

    } else {
        if (generativeLayer) {
            generativeLayer.remove();
        }
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();
        document.getElementById('map').style.cursor='grab';

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
    exploreBtn.textContent = t.exploreButton;

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

exploreBtn.addEventListener('click', () => {
    const randomAttraction = attractions[Math.floor(Math.random() * attractions.length)];
    map.flyTo([randomAttraction.lat, randomAttraction.lng], 12, {
        animate: true,
        duration: 2.5
    });

    setTimeout(() => {
        const marker = allMarkers.find(m => m.attractionData.name === randomAttraction.name);
        if (marker) {
            marker.openPopup();
        }
    }, 2600);
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
