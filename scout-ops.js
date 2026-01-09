/**
 * S.C.O.U.T. Ops Center
 * Strategic Command & Operations Utility for Tourists
 *
 * Handles real-time intel simulation, drone deployment, and event logging.
 */
class ScoutOpsCenter {
    constructor(map, appState, attractions) {
        this.map = map;
        this.appState = appState;
        this.attractions = attractions;
        this.intelLog = [];
        this.activeDrones = [];
        this.isOpsActive = false;

        this.intelEvents = [
            "Traffic congestion detected near {target}.",
            "Local festival starting at {target}. Crowd levels rising.",
            "Weather alert: Clear skies over {target}. Perfect visibility.",
            "Historic reenactment scheduled at {target}.",
            "Road maintenance on route to {target}. Expect delays.",
            "VIP convoy passing through {target}.",
            "Flash sale at local markets near {target}."
        ];

        this.appState.subscribe('languageChanged', (lang) => {
            this.updateLanguage(lang);
        });

        this.initUI();
        this.startIntelFeed();
    }

    initUI() {
        // Create the Ops Center Panel
        const opsPanel = document.createElement('div');
        opsPanel.id = 'scoutOpsPanel';
        opsPanel.className = 'scout-ops-panel';
        opsPanel.setAttribute('aria-hidden', 'true');

        // Initial strings based on current language
        const t = translations[this.appState.language] || translations['en'];

        opsPanel.innerHTML = `
            <div class="ops-header">
                <h3 id="opsCenterTitle">${t.opsCenterTitle}</h3>
                <span class="status-indicator">ONLINE</span>
                <button id="closeOpsCenter" aria-label="Close Ops Center">&times;</button>
            </div>
            <div class="ops-grid">
                <div class="intel-feed-section">
                    <h4 id="liveIntelFeedTitle">${t.liveIntelFeed}</h4>
                    <div id="intelFeed" class="intel-feed" role="log" aria-live="polite">
                        <div class="feed-item system" id="systemInitMsg">${t.systemInitialized}</div>
                    </div>
                </div>
                <div class="drone-control-section">
                    <h4 id="droneUplinkTitle">${t.droneUplink}</h4>
                    <div id="droneStatus" class="drone-status">
                        <p><span id="activeDronesLabel">${t.activeDrones}</span>: <span id="activeDroneCount">0</span>/3</p>
                        <p><span id="signalStrengthLabel">${t.signalStrength}</span>: <span class="signal-bar">█████</span> 100%</p>
                    </div>
                    <div class="drone-actions">
                        <p class="instruction" id="deployInstruction">${t.deployInstruction}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(opsPanel);

        // Add Toggle Button to Main UI
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'opsCenterToggle';
        toggleBtn.className = 'control-button ops-toggle';
        toggleBtn.innerHTML = `<span class="icon">📡</span> <span id="opsCenterBtnText">${t.opsCenterBtn}</span>`;
        toggleBtn.onclick = () => this.toggleOpsCenter();

        const uiControls = document.querySelector('.ui-controls');
        const exploreBtn = document.getElementById('exploreBtn');
        if (uiControls && exploreBtn) {
             uiControls.insertBefore(toggleBtn, exploreBtn);
        } else if (uiControls) {
             uiControls.appendChild(toggleBtn);
        }

        // Event Listeners
        const closeBtn = document.getElementById('closeOpsCenter');
        if (closeBtn) closeBtn.addEventListener('click', () => this.toggleOpsCenter());
    }

    updateLanguage(lang) {
        const t = translations[lang] || translations['en'];

        // Update Static Labels
        const title = document.getElementById('opsCenterTitle');
        if (title) title.textContent = t.opsCenterTitle;

        const liveFeedTitle = document.getElementById('liveIntelFeedTitle');
        if (liveFeedTitle) liveFeedTitle.textContent = t.liveIntelFeed;

        const initMsg = document.getElementById('systemInitMsg');
        if (initMsg) initMsg.textContent = t.systemInitialized;

        const droneUplinkTitle = document.getElementById('droneUplinkTitle');
        if (droneUplinkTitle) droneUplinkTitle.textContent = t.droneUplink;

        const activeDronesLabel = document.getElementById('activeDronesLabel');
        if (activeDronesLabel) activeDronesLabel.textContent = t.activeDrones;

        const signalStrengthLabel = document.getElementById('signalStrengthLabel');
        if (signalStrengthLabel) signalStrengthLabel.textContent = t.signalStrength;

        const deployInstruction = document.getElementById('deployInstruction');
        if (deployInstruction) deployInstruction.textContent = t.deployInstruction;

        const opsCenterBtnText = document.getElementById('opsCenterBtnText');
        if (opsCenterBtnText) opsCenterBtnText.textContent = t.opsCenterBtn;
    }

    toggleOpsCenter() {
        this.isOpsActive = !this.isOpsActive;
        const panel = document.getElementById('scoutOpsPanel');
        const toggle = document.getElementById('opsCenterToggle');

        panel.classList.toggle('active', this.isOpsActive);
        panel.setAttribute('aria-hidden', !this.isOpsActive);
        toggle.classList.toggle('active', this.isOpsActive);

        if (this.isOpsActive) {
            // Accessibility: Trap focus
            if (typeof trapFocus === 'function') {
                trapFocus(panel);
            }
            // Focus close button or first element
            const closeBtn = document.getElementById('closeOpsCenter');
            if (closeBtn) closeBtn.focus();
        } else {
            if (typeof removeTrapFocus === 'function') {
                removeTrapFocus(panel);
            }
            toggle.focus();
        }
    }

    startIntelFeed() {
        if (this.intelInterval) clearInterval(this.intelInterval);

        // Simulate incoming intel every 10-30 seconds
        this.intelInterval = setInterval(() => {
            if (this.isOpsActive && Math.random() > 0.6) {
                this.generateRandomEvent();
            }
        }, 15000);
    }

    generateRandomEvent() {
        if (!this.attractions || this.attractions.length === 0) return;

        const target = this.attractions[Math.floor(Math.random() * this.attractions.length)];
        // Ideally intelEvents should also be translated, but they are random simulation strings.
        // For now, we keep them in English as "Intercepted Chatter" style, or we could add them to translations.
        // Let's assume they remain English for "Realism" or simplicity in this refactor.
        const template = this.intelEvents[Math.floor(Math.random() * this.intelEvents.length)];
        const message = template.replace('{target}', target.name);
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });

        this.addLogEntry(`[${timestamp}] ${message}`, 'event');
    }

    addLogEntry(text, type = 'info') {
        const feed = document.getElementById('intelFeed');
        const item = document.createElement('div');
        item.className = `feed-item ${type}`;
        item.textContent = text;

        feed.insertBefore(item, feed.firstChild);

        // Keep only last 20 items
        if (feed.children.length > 20) {
            feed.removeChild(feed.lastChild);
        }
    }

    /**
     * Deploys a drone to the specified attraction.
     * @param {string} attractionName
     */
    deployDrone(attractionName) {
        const t = translations[this.appState.language] || translations['en'];

        if (this.activeDrones.length >= 3) {
            showToast(t.droneMaxCapacity);
            return;
        }

        const target = this.attractions.find(a => a.name === attractionName);
        if (!target) return;

        // Visuals
        const droneIcon = L.divIcon({
            className: 'drone-icon',
            html: '🚁',
            iconSize: [24, 24]
        });

        // Start from a random edge or user position? Let's start from center map for simplicity
        const startPos = this.map.getCenter();
        const droneMarker = L.marker(startPos, { icon: droneIcon }).addTo(this.map);

        this.activeDrones.push({ name: attractionName, marker: droneMarker });
        this.updateDroneCount();
        this.addLogEntry(t.launchingDrone.replace('{target}', attractionName), 'system');

        // Animate
        let progress = 0;
        const steps = 100;
        const interval = setInterval(() => {
            progress++;
            const lat = startPos.lat + (target.lat - startPos.lat) * (progress / steps);
            const lng = startPos.lng + (target.lng - startPos.lng) * (progress / steps);
            droneMarker.setLatLng([lat, lng]);

            if (progress >= steps) {
                clearInterval(interval);
                this.onDroneArrival(attractionName, droneMarker);
            }
        }, 20);
    }

    onDroneArrival(attractionName, droneMarker) {
        const t = translations[this.appState.language] || translations['en'];
        this.addLogEntry(t.droneArrived.replace('{target}', attractionName), 'success');

        setTimeout(() => {
            // Remove drone
            this.map.removeLayer(droneMarker);
            this.activeDrones = this.activeDrones.filter(d => d.name !== attractionName);
            this.updateDroneCount();

            // Unlock Intel
            this.unlockIntel(attractionName);
        }, 3000);
    }

    unlockIntel(attractionName) {
        const t = translations[this.appState.language] || translations['en'];
        const target = this.attractions.find(a => a.name === attractionName);

        // Generate dynamic "Live" stats
        const liveDensity = Math.floor(Math.random() * 100);
        const waitTime = Math.floor(Math.random() * 45);

        const intelMsg = t.scanComplete
            .replace('{target}', attractionName)
            .replace('{density}', liveDensity)
            .replace('{wait}', waitTime);

        this.addLogEntry(intelMsg, 'highlight');

        const alertMsg = t.intelUnlockedAlert
            .replace('{target}', attractionName.toUpperCase())
            .replace('{density}', liveDensity)
            .replace('{wait}', waitTime);

        showToast(alertMsg, 8000); // Longer duration for detailed intel
    }

    updateDroneCount() {
        document.getElementById('activeDroneCount').textContent = this.activeDrones.length;
    }
}
