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

        this.initUI();
        this.startIntelFeed();
    }

    initUI() {
        // Create the Ops Center Panel
        const opsPanel = document.createElement('div');
        opsPanel.id = 'scoutOpsPanel';
        opsPanel.className = 'scout-ops-panel';
        opsPanel.setAttribute('aria-hidden', 'true');
        opsPanel.innerHTML = `
            <div class="ops-header">
                <h3>S.C.O.U.T. OPS CENTER</h3>
                <span class="status-indicator">ONLINE</span>
                <button id="closeOpsCenter" aria-label="Close Ops Center">&times;</button>
            </div>
            <div class="ops-grid">
                <div class="intel-feed-section">
                    <h4>LIVE INTEL FEED</h4>
                    <div id="intelFeed" class="intel-feed" role="log" aria-live="polite">
                        <div class="feed-item system">System initialized... awaiting data.</div>
                    </div>
                </div>
                <div class="drone-control-section">
                    <h4>DRONE UPLINK</h4>
                    <div id="droneStatus" class="drone-status">
                        <p>Active Drones: <span id="activeDroneCount">0</span>/3</p>
                        <p>Signal Strength: <span class="signal-bar">█████</span> 100%</p>
                    </div>
                    <div class="drone-actions">
                        <p class="instruction">Select a target on map to deploy.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(opsPanel);

        // Add Toggle Button to Main UI
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'opsCenterToggle';
        toggleBtn.className = 'control-button ops-toggle';
        toggleBtn.innerHTML = '<span class="icon">📡</span> OPS CENTER';
        toggleBtn.onclick = () => this.toggleOpsCenter();
        document.querySelector('.ui-controls').insertBefore(toggleBtn, document.getElementById('exploreBtn'));

        // Event Listeners
        document.getElementById('closeOpsCenter').addEventListener('click', () => this.toggleOpsCenter());
    }

    toggleOpsCenter() {
        this.isOpsActive = !this.isOpsActive;
        const panel = document.getElementById('scoutOpsPanel');
        const toggle = document.getElementById('opsCenterToggle');

        panel.classList.toggle('active', this.isOpsActive);
        panel.setAttribute('aria-hidden', !this.isOpsActive);
        toggle.classList.toggle('active', this.isOpsActive);
    }

    startIntelFeed() {
        // Simulate incoming intel every 10-30 seconds
        setInterval(() => {
            if (Math.random() > 0.6) {
                this.generateRandomEvent();
            }
        }, 15000);
    }

    generateRandomEvent() {
        const target = this.attractions[Math.floor(Math.random() * this.attractions.length)];
        const template = this.intelEvents[Math.floor(Math.random() * this.intelEvents.length)];
        const message = template.replace('{target}', target.name);
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });

        this.addLogEntry(`[${timestamp}] ${message}`, 'event');

        // Randomly affect crowd density (simulation)
        if (message.includes("Crowd") || message.includes("Festival")) {
            // This would hook into CrowdIntelSystem if we wanted to be fancy,
            // for now it's just flavor text.
        }
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
        if (this.activeDrones.length >= 3) {
            alert("Maximum drone capacity reached. Recall a drone first.");
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
        this.addLogEntry(`Launching drone to ${attractionName}...`, 'system');

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
        this.addLogEntry(`Drone arrived at ${attractionName}. Scanning...`, 'success');

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
        // Find attraction and get hidden info (simulated for now)
        const target = this.attractions.find(a => a.name === attractionName);

        // Generate dynamic "Live" stats
        const liveDensity = Math.floor(Math.random() * 100);
        const waitTime = Math.floor(Math.random() * 45);

        const intelMsg = `SCAN COMPLETE: ${attractionName} | Density: ${liveDensity}% | Wait: ${waitTime}m`;
        this.addLogEntry(intelMsg, 'highlight');

        alert(`CLASSIFIED INTEL UNLOCKED FOR ${attractionName.toUpperCase()}:\n\nCurrent Crowd Density: ${liveDensity}%\nEstimated Wait Time: ${waitTime} mins\n\nSecret: Locals recommend visiting the nearby back-alley cafe for the best view.`);
    }

    updateDroneCount() {
        document.getElementById('activeDroneCount').textContent = this.activeDrones.length;
    }
}
