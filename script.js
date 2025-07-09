// Get references to HTML elements
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const itineraryListElement = document.getElementById('itineraryList');
const itineraryNotification = document.getElementById('itineraryNotification'); // Added this line
const langButtons = document.querySelectorAll('#langSwitcher button');

// App state
let currentLanguage = 'en'; // Default language
let tripItinerary = [];

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
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const allMarkers = [];

// Helper function to generate popup content
function generatePopupContent(attraction) {
    const t = translations[currentLanguage];
    // Basic placeholder for description - could be made more dynamic if needed
    const description = `Discover the beauty of ${attraction.name}. More details coming soon!`;

    let buttonText = t.addToItinerary;
    let buttonDisabled = false;
    if (tripItinerary.some(item => item.name === attraction.name)) {
        buttonText = t.inItinerary;
        buttonDisabled = true;
    }

    return `
        <h3>${attraction.name}</h3>
        <p>${description}</p>
        <a href="#" target="_blank">${t.moreInfoLink}</a> | <a href="#" target="_blank">${t.bookingsLink}</a>
        <br>
        <button class="addToItineraryBtn" data-name="${attraction.name}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
    `;
}

// Add markers for each attraction
attractions.forEach(function(attraction) {
  const marker = L.marker([attraction.lat, attraction.lng]);
  marker.attractionData = attraction; // Store attraction data on the marker
  // Content will be set on 'popupopen' to ensure it uses the current language
  marker.addTo(map);
  allMarkers.push(marker);
});

// Function to filter attractions based on search input and type filter
function filterAttractions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;

    allMarkers.forEach(marker => {
        const attractionName = marker.attractionData.name.toLowerCase();
        const attractionType = marker.attractionData.type;

        // Check if the attraction matches the search term and selected type
        const nameMatch = attractionName.includes(searchTerm);
        const typeMatch = selectedType === "" || attractionType === selectedType;

        if (nameMatch && typeMatch) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map); // Show marker if not already on map
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker); // Hide marker if currently on map
            }
        }
    });
}

// Add event listeners
searchInput.addEventListener('input', filterAttractions);
typeFilter.addEventListener('change', filterAttractions);

// --- Itinerary Functions ---

function renderItinerary() {
    itineraryListElement.innerHTML = ''; // Clear current list
    const t = translations[currentLanguage];

    tripItinerary.forEach((attraction, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = attraction.name; // Attraction name itself is not translated here

        const removeButton = document.createElement('button');
        removeButton.textContent = t.removeFromItinerary;
        removeButton.onclick = () => {
            tripItinerary.splice(index, 1); // Remove attraction from array
            renderItinerary(); // Re-render the list
        };

        listItem.appendChild(removeButton);
        itineraryListElement.appendChild(listItem);
    });
}

function addToItinerary(attractionName, buttonElement) { // Added buttonElement
    // Find the full attraction object from the main 'attractions' array
    const attractionToAdd = attractions.find(attr => attr.name === attractionName);
    if (!attractionToAdd) {
        console.error("Attraction not found:", attractionName);
        return;
    }

    // Check if already in itinerary
    if (!tripItinerary.some(item => item.name === attractionToAdd.name)) {
        tripItinerary.push(attractionToAdd);
        renderItinerary();
        if (buttonElement) { // If buttonElement is provided
            buttonElement.textContent = translations[currentLanguage].addedToItinerary;
            buttonElement.disabled = true;
        }
    } else {
        // alert(attractionToAdd.name + ' is already in your itinerary.'); // Old alert
        itineraryNotification.textContent = attractionToAdd.name + ' is already in your itinerary.';
        itineraryNotification.style.display = 'block'; // Show notification
        setTimeout(() => {
            itineraryNotification.textContent = '';
            itineraryNotification.style.display = 'none'; // Hide notification
        }, 3000); // Hide after 3 seconds
    }
}

// Event delegation for popups to set content and attach listeners
map.on('popupopen', function(e) {
    const marker = e.popup._source; // Get the marker associated with the popup
    if (marker && marker.attractionData) {
        // Regenerate and set content based on current language
        e.popup.setContent(generatePopupContent(marker.attractionData));

        // Re-attach button listener because setContent replaces the old button
        const popupNode = e.popup._contentNode;
        const addButton = popupNode.querySelector('.addToItineraryBtn');
        if (addButton) {
            // No need for listenerAttached dataset property here as onclick is reassigned
            // Check if the button is already disabled by generatePopupContent
            if (!addButton.disabled) {
                addButton.onclick = function() {
                    const attractionName = this.dataset.name;
                    // Pass 'this' (the button itself) to addToItinerary to modify it
                    addToItinerary(attractionName, this);
                    // map.closePopup(); // Optionally close popup
                };
            }
        }
    }
});


// --- Language Functions ---
function setLanguage(lang) {
    // Fallback to English if the selected language or its translations are not found
    if (!translations[lang]) {
        console.warn(`Language "${lang}" not found. Falling back to English.`);
        lang = 'en';
    }
    currentLanguage = lang;
    const t = translations[lang]; // Now lang is guaranteed to be a valid key (either original or 'en')

    // Update UI elements
    document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    const typeFilterElement = document.getElementById('typeFilter');
    typeFilterElement.options[0].textContent = t.allTypesOption;
    typeFilterElement.options[1].textContent = t.cityOption;
    typeFilterElement.options[2].textContent = t.beachOption;
    typeFilterElement.options[3].textContent = t.natureOption;
    typeFilterElement.options[4].textContent = t.historyOption;

    document.getElementById('itinerary').querySelector('h2').textContent = t.itineraryTitle;
    document.getElementById('langLabel').textContent = t.languageSwitcherLabel;

    // Update language switcher button styles
    langButtons.forEach(button => {
        if (button.dataset.lang === currentLanguage) { // Use currentLanguage after potential fallback
            button.classList.add('activeLang');
        } else {
            button.classList.remove('activeLang');
        }
    });

    renderItinerary(); // Refresh itinerary for "Remove" button text

    // Close any open popup so it can be regenerated with new language if opened again
    if (map.closePopup) {
        map.closePopup();
    }
}

// Add event listeners to language buttons
langButtons.forEach(button => {
    button.addEventListener('click', function() {
        setLanguage(this.dataset.lang);
    });
});

// Initial render and language setting
renderItinerary(); // Initial render for empty itinerary
setLanguage(currentLanguage); // Initialize page with default language
