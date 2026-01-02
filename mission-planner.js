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
