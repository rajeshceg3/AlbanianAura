class AppState {
    constructor() {
        this.language = 'en';
        this.listeners = {};

        // Safely load initial state
        this.reviews = this.loadReviews();
        this.unlockedSignals = this.loadUnlockedSignals();
        this.clearanceLevel = this.calculateClearanceLevel();

        // Multi-Mission Support
        this.savedMissions = this.loadMissions();
        this.currentMissionId = this.loadCurrentMissionId();

        // Ensure valid state
        this.ensureValidMissionState();
    }

    // --- Mission / Itinerary Management ---

    generateId() {
        return 'mission_' + Math.random().toString(36).substr(2, 9);
    }

    loadMissions() {
        try {
            const saved = localStorage.getItem('albania_missions');
            if (saved) {
                return JSON.parse(saved);
            }

            // Migration: Check for legacy itinerary
            const legacy = localStorage.getItem('albania_itinerary');
            const defaultId = this.generateId();
            const initialMissions = {};

            initialMissions[defaultId] = {
                id: defaultId,
                name: 'Operation Alpha',
                targets: legacy ? JSON.parse(legacy) : []
            };

            return initialMissions;
        } catch (e) {
            console.warn('LocalStorage access denied or error:', e);
            // Fallback in memory
            const id = this.generateId();
            return { [id]: { id, name: 'Operation Alpha', targets: [] } };
        }
    }

    loadCurrentMissionId() {
        try {
            const saved = localStorage.getItem('albania_current_mission_id');
            if (saved && this.savedMissions && this.savedMissions[saved]) {
                return saved;
            }
        } catch (e) {
            console.warn('Error loading mission ID', e);
        }
        // Return the first key available
        return Object.keys(this.savedMissions)[0];
    }

    ensureValidMissionState() {
        if (!this.savedMissions || Object.keys(this.savedMissions).length === 0) {
            const id = this.generateId();
            this.savedMissions = { [id]: { id, name: 'Operation Alpha', targets: [] } };
            this.currentMissionId = id;
            this.saveMissions();
        } else if (!this.savedMissions[this.currentMissionId]) {
            this.currentMissionId = Object.keys(this.savedMissions)[0];
            this.saveMissions();
        }
    }

    get itinerary() {
        return this.savedMissions[this.currentMissionId].targets;
    }

    set itinerary(newTargets) {
        if (this.savedMissions[this.currentMissionId]) {
            this.savedMissions[this.currentMissionId].targets = newTargets;
            this.saveMissions();
        }
    }

    // Public API for Missions

    getMissions() {
        return this.savedMissions;
    }

    createMission(name) {
        const id = this.generateId();
        this.savedMissions[id] = {
            id: id,
            name: name || `Operation ${Object.keys(this.savedMissions).length + 1}`,
            targets: []
        };
        this.saveMissions();
        this.notify('missionsUpdated', this.savedMissions);
        return id;
    }

    switchMission(id) {
        if (this.savedMissions[id]) {
            this.currentMissionId = id;
            this.saveMissions();
            this.notify('itineraryChanged', this.itinerary); // Notify visualizers
            this.notify('missionSwitched', id);
        }
    }

    deleteMission(id) {
        const keys = Object.keys(this.savedMissions);
        if (keys.length <= 1) {
            // Prevent deleting the last mission
             return false;
        }

        if (this.savedMissions[id]) {
            delete this.savedMissions[id];

            if (this.currentMissionId === id) {
                // Switch to another one
                this.currentMissionId = Object.keys(this.savedMissions)[0];
                this.notify('missionSwitched', this.currentMissionId);
                this.notify('itineraryChanged', this.itinerary);
            }

            this.saveMissions();
            this.notify('missionsUpdated', this.savedMissions);
            return true;
        }
        return false;
    }

    renameMission(id, newName) {
        if (this.savedMissions[id]) {
            this.savedMissions[id].name = newName;
            this.saveMissions();
            this.notify('missionsUpdated', this.savedMissions);
        }
    }

    saveMissions() {
        try {
            localStorage.setItem('albania_missions', JSON.stringify(this.savedMissions));
            localStorage.setItem('albania_current_mission_id', this.currentMissionId);
            // Maintain backward compatibility
            if (this.currentMissionId && this.savedMissions[this.currentMissionId]) {
                 localStorage.setItem('albania_itinerary', JSON.stringify(this.savedMissions[this.currentMissionId].targets));
            }
        } catch (e) {
            console.warn('LocalStorage error:', e);
            this.notify('error', 'Storage Error: Unable to save mission data. Storage might be full.');
        }
    }

    // Wrapped save for legacy method names calling it
    saveItinerary() {
        this.saveMissions();
        this.notify('itineraryChanged', this.itinerary);
    }

    // --- Legacy / Existing Itinerary Methods ---

    addToItinerary(attractionName) {
        if (!this.itinerary.includes(attractionName)) {
            this.itinerary.push(attractionName);
            this.saveItinerary();
        }
    }

    removeFromItinerary(attractionName) {
        // filter creates a new array, so the setter is called
        this.itinerary = this.itinerary.filter(name => name !== attractionName);
        // Setter calls saveMissions, but we also want to notify
        this.notify('itineraryChanged', this.itinerary);
    }

    moveItemUp(attractionName) {
        const list = this.itinerary;
        const index = list.indexOf(attractionName);
        if (index > 0) {
            [list[index], list[index - 1]] = [list[index - 1], list[index]];
            this.saveItinerary(); // Saves and notifies
        }
    }

    moveItemDown(attractionName) {
        const list = this.itinerary;
        const index = list.indexOf(attractionName);
        if (index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
            this.saveItinerary();
        }
    }

    setItinerary(newItinerary) {
        this.itinerary = newItinerary; // Uses setter
        this.notify('itineraryChanged', this.itinerary);
    }

    clearItinerary() {
        this.itinerary = [];
        this.saveItinerary();
    }

    isInItinerary(attractionName) {
        return this.itinerary.includes(attractionName);
    }

    // --- Other State ---

    loadUnlockedSignals() {
        try {
            const saved = localStorage.getItem('albania_sigint');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveUnlockedSignals() {
        try {
            localStorage.setItem('albania_sigint', JSON.stringify(this.unlockedSignals));
        } catch (e) {
            console.warn('LocalStorage error', e);
            this.notify('error', 'Storage Error: Unable to save SIGINT progress.');
        }
    }

    unlockSignal(attractionName) {
        if (!this.unlockedSignals.includes(attractionName)) {
            this.unlockedSignals.push(attractionName);
            this.saveUnlockedSignals();
            this.clearanceLevel = this.calculateClearanceLevel();
            this.notify('signalUnlocked', attractionName);
            this.notify('clearanceLevelChanged', this.clearanceLevel);
        }
    }

    calculateClearanceLevel() {
        const unlockedCount = this.unlockedSignals.length;
        return Math.min(5, Math.floor(unlockedCount / 2) + 1);
    }

    loadReviews() {
        try {
            const saved = localStorage.getItem('albania_reviews');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}
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
             this.notify('error', 'Storage Error: Unable to save review.');
             throw e; // Rethrow so caller knows it failed
        }
    }

    addReview(attractionName, review) {
        try {
            if (!this.reviews[attractionName]) {
                this.reviews[attractionName] = [];
            }
            this.reviews[attractionName].push(review);
            this.saveReviews();
            this.notify('reviewAdded', { attractionName, review });
            return true;
        } catch (e) {
            console.error("Failed to add review:", e);
            return false;
        }
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

    destroy() {
        this.listeners = {};
    }
}

const appState = new AppState();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, appState };
}
