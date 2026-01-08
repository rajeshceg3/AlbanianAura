class AppState {
    constructor() {
        this.language = 'en';
        this.reviews = this.loadReviews();
        this.itinerary = this.loadItinerary();
        this.listeners = {};
    }

    loadReviews() {
        try {
            const saved = localStorage.getItem('albania_reviews');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('LocalStorage access denied or error:', e);
        }
        // Default initial reviews if none saved or error
        return {
            'Tirana': [
                { user: 'Alex', stars: 5, review: 'Vibrant city with lots to see!' },
                { user: 'Maria', stars: 4, review: 'Good coffee, friendly people.' }
            ],
            'Berat': [
                { user: 'John D.', stars: 5, review: 'Absolutely stunning, a must-see.' }
            ]
        };
    }

    saveReviews() {
        try {
            localStorage.setItem('albania_reviews', JSON.stringify(this.reviews));
        } catch (e) {
            console.warn('LocalStorage access denied or error:', e);
        }
    }

    loadItinerary() {
        try {
            const saved = localStorage.getItem('albania_itinerary');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('LocalStorage access denied or error:', e);
            return [];
        }
    }

    saveItinerary() {
        try {
            localStorage.setItem('albania_itinerary', JSON.stringify(this.itinerary));
        } catch (e) {
            console.warn('LocalStorage access denied or error:', e);
        }
        this.notify('itineraryChanged', this.itinerary);
    }

    addToItinerary(attractionName) {
        if (!this.itinerary.includes(attractionName)) {
            this.itinerary.push(attractionName);
            this.saveItinerary();
        }
    }

    removeFromItinerary(attractionName) {
        this.itinerary = this.itinerary.filter(name => name !== attractionName);
        this.saveItinerary();
    }

    moveItemUp(attractionName) {
        const index = this.itinerary.indexOf(attractionName);
        if (index > 0) {
            [this.itinerary[index], this.itinerary[index - 1]] = [this.itinerary[index - 1], this.itinerary[index]];
            this.saveItinerary();
        }
    }

    moveItemDown(attractionName) {
        const index = this.itinerary.indexOf(attractionName);
        if (index < this.itinerary.length - 1) {
            [this.itinerary[index], this.itinerary[index + 1]] = [this.itinerary[index + 1], this.itinerary[index]];
            this.saveItinerary();
        }
    }

    setItinerary(newItinerary) {
        this.itinerary = newItinerary;
        this.saveItinerary();
    }

    clearItinerary() {
        this.itinerary = [];
        this.saveItinerary();
    }

    isInItinerary(attractionName) {
        return this.itinerary.includes(attractionName);
    }

    addReview(attractionName, review) {
        if (!this.reviews[attractionName]) {
            this.reviews[attractionName] = [];
        }
        this.reviews[attractionName].push(review);
        this.saveReviews();
        this.notify('reviewAdded', { attractionName, review });
    }

    getReviews(attractionName) {
        return this.reviews[attractionName] || [];
    }

    setLanguage(lang) {
        this.language = lang;
        this.notify('languageChanged', lang);
    }

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

const appState = new AppState();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState };
}
