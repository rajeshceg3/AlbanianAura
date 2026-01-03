/**
 * MissionPlanner - Tactical Vector Overlay & Reconnaissance System (TVORS)
 * Handles visual routing, telemetry calculations, and mission simulation.
 */
class MissionPlanner {
    constructor(map, appState, attractions) {
        this.map = map;
        this.appState = appState;
        this.attractions = attractions;
        this.vectorLayer = L.layerGroup().addTo(map);
        this.isSimulating = false;

        // Subscribe to state changes
        this.appState.subscribe('itineraryChanged', this.updateMission.bind(this));

        // Initial draw
        this.updateMission(this.appState.itinerary);
    }

    /**
     * Updates the tactical vector overlay based on the current itinerary.
     * @param {string[]} itinerary - List of attraction names
     */
    updateMission(itinerary) {
        this.vectorLayer.clearLayers();

        if (itinerary.length < 2) {
            this.updateTelemetry(0);
            return;
        }

        const points = itinerary.map(name => {
            const attr = this.attractions.find(a => a.name === name);
            return attr ? new L.LatLng(attr.lat, attr.lng) : null;
        }).filter(p => p !== null);

        if (points.length < 2) return;

        // Draw the flight path
        const polyline = L.polyline(points, {
            color: '#00ffcc', // Tactical cyan
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10',
            className: 'tactical-path'
        });

        this.vectorLayer.addLayer(polyline);

        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += points[i].distanceTo(points[i+1]);
        }

        this.updateTelemetry(totalDistance);
    }

    /**
     * Updates the UI with mission statistics.
     * @param {number} distanceMeters
     */
    updateTelemetry(distanceMeters) {
        const km = (distanceMeters / 1000).toFixed(1);
        const distanceEl = document.getElementById('missionDistance');
        if (distanceEl) {
            distanceEl.textContent = `${km} km`;
        }
    }

    /**
     * Executes the reconnaissance simulation (Fly-through).
     */
    async executeRecon() {
        if (this.isSimulating) return;

        const itinerary = this.appState.itinerary;
        if (itinerary.length === 0) {
            const t = translations[this.appState.language];
            alert(t.missionAborted);
            return;
        }

        this.isSimulating = true;
        document.body.classList.add('recon-active');

        // Close sidebar for better view
        const panel = document.getElementById('missionControlPanel');
        if (panel && panel.classList.contains('open')) {
            document.getElementById('missionControlToggle').click();
        }

        for (const name of itinerary) {
            if (!this.isSimulating) break; // Allow abort

            const attraction = this.attractions.find(a => a.name === name);
            if (attraction) {
                await this.flyToTarget(attraction);
                await new Promise(r => setTimeout(r, 2000)); // Hover time
            }
        }

        this.stopRecon();
    }

    /**
     * Helper to fly to a specific target and wait for animation.
     */
    flyToTarget(attraction) {
        return new Promise(resolve => {
            this.map.flyTo([attraction.lat, attraction.lng], 12, {
                animate: true,
                duration: 2
            });

            this.map.once('moveend', () => {
                // Open popup on arrival
                const marker = allMarkers.find(m => m.attractionData.name === attraction.name);
                if (marker) marker.openPopup();
                resolve();
            });
        });
    }

    stopRecon() {
        this.isSimulating = false;
        document.body.classList.remove('recon-active');
        this.map.closePopup();
    }
}

/**
 * CrowdIntelSystem - Analyzes and visualizes threat levels (crowd density)
 * based on temporal data.
 */
class CrowdIntelSystem {
    constructor(map, attractions) {
        this.map = map;
        this.attractions = attractions;
        this.layerGroup = L.layerGroup().addTo(map);
        this.active = false;
        this.currentHour = 12; // Default 12:00
    }

    toggleSystem(active) {
        this.active = active;
        if (active) {
            this.updateVisualization();
            document.body.classList.add('crowd-intel-active');
        } else {
            this.layerGroup.clearLayers();
            document.body.classList.remove('crowd-intel-active');
        }
    }

    setHour(hour) {
        this.currentHour = hour;
        if (this.active) {
            this.updateVisualization();
        }
    }

    /**
     * Calculates density (0-1) for a specific attraction at the current hour.
     * Uses a Gaussian-like distribution around the peak hour.
     */
    calculateDensity(attraction) {
        if (!attraction.crowdStats) return 0.2; // Default low density

        const { maxDensity, peakHour } = attraction.crowdStats;
        const diff = Math.abs(this.currentHour - peakHour);

        // Simple decay: density drops as we move away from peak
        // Standard deviation approx 3 hours
        const decay = Math.exp(-(diff * diff) / (2 * 3 * 3));

        return maxDensity * decay;
    }

    updateVisualization() {
        this.layerGroup.clearLayers();

        this.attractions.forEach(attr => {
            const density = this.calculateDensity(attr);
            const color = this.getThreatColor(density);
            const radius = 500 + (density * 1000); // Visual radius based on density

            L.circle([attr.lat, attr.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.3 * density,
                radius: radius,
                weight: 2,
                className: density > 0.7 ? 'pulse-circle' : '' // Add CSS animation for high density
            }).addTo(this.layerGroup)
            .bindTooltip(`Crowd Level: ${Math.round(density * 100)}%`, {
                className: 'tactical-tooltip',
                direction: 'top'
            });
        });
    }

    getThreatColor(density) {
        if (density < 0.3) return '#00ffcc'; // Green/Cyan (Safe)
        if (density < 0.6) return '#ffcc00'; // Yellow (Caution)
        return '#ff3333'; // Red (High Threat)
    }
}
