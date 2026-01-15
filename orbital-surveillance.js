/**
 * Orbital Surveillance & Reconnaissance (OSR) System
 * "Operation: SKYWATCH"
 *
 * Simulates a reconnaissance satellite in Low Earth Orbit (LEO) passing over the map.
 * Provides "Satellite View" (high contrast/infrared) and boosts signal interception.
 */
class OrbitalSystem {
    constructor(map, appState) {
        this.map = map;
        this.appState = appState;
        this.isActive = false;
        this.satelliteMarker = null;
        this.swathPolygon = null;
        this.orbitPath = [];
        this.animationFrame = null;
        this.lastTime = 0;

        // Orbit Parameters
        // Albania bounds: Lat ~39-43, Lng ~19-21
        this.orbitParams = {
            minLat: 38.0,
            maxLat: 44.0,
            minLng: 18.0,
            maxLng: 22.0,
            period: 60000, // ms for full pass
            inclination: 0.2, // Sine wave amplitude modifier
            swathWidth: 0.4 // Degrees (~40km)
        };

        this.currentOrbitProgress = 0; // 0 to 1
        this.passCount = 0;
        this.speed = 0.0002; // Progress per frame approx

        this.init();
    }

    init() {
        // Create custom icon for satellite
        this.satelliteIcon = L.divIcon({
            className: 'satellite-icon',
            html: '<div class="sat-body">🛰️</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Initialize Layer Group for easy management if needed,
        // but simple markers are fine for now.
    }

    toggleSystem(active) {
        this.isActive = active;
        if (this.isActive) {
            this.startOrbit();
            document.body.classList.add('satellite-view');
            this.showHUD();
        } else {
            this.stopOrbit();
            document.body.classList.remove('satellite-view');
            this.hideHUD();
        }
    }

    startOrbit() {
        if (!this.satelliteMarker) {
            const startPos = this.calculatePosition(0);
            this.satelliteMarker = L.marker(startPos, {
                icon: this.satelliteIcon,
                zIndexOffset: 5000
            }).addTo(this.map);

            this.swathPolygon = L.polygon(this.calculateSwath(0), {
                color: '#00ffcc',
                fillColor: '#00ffcc',
                fillOpacity: 0.1,
                weight: 1,
                dashArray: '5, 5'
            }).addTo(this.map);
        }

        this.lastTime = performance.now();
        this.loop();
    }

    stopOrbit() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.satelliteMarker) {
            this.map.removeLayer(this.satelliteMarker);
            this.satelliteMarker = null;
        }
        if (this.swathPolygon) {
            this.map.removeLayer(this.swathPolygon);
            this.swathPolygon = null;
        }
    }

    loop() {
        if (!this.isActive) return;

        const now = performance.now();
        const dt = now - this.lastTime;
        this.lastTime = now;

        // Update progress
        // Speed adjusted by period. If period is 60s (60000ms), we need to advance 1/60000 per ms
        const progressStep = dt / this.orbitParams.period;
        this.currentOrbitProgress += progressStep;

        if (this.currentOrbitProgress > 1) {
            this.currentOrbitProgress = 0;
            this.passCount++;
            this.notifyPassComplete();
        }

        this.updateVisuals();
        this.animationFrame = requestAnimationFrame(() => this.loop());
    }

    updateVisuals() {
        if (!this.satelliteMarker || !this.swathPolygon) return;

        const pos = this.calculatePosition(this.currentOrbitProgress);
        const swath = this.calculateSwath(this.currentOrbitProgress);

        this.satelliteMarker.setLatLng(pos);
        this.swathPolygon.setLatLngs(swath);

        // Update HUD text if exists
        const hudEl = document.getElementById('sat-status-coords');
        if (hudEl) {
            hudEl.textContent = `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`;
        }
    }

    calculatePosition(progress) {
        // Simple linear interpolation for Latitude (South to North)
        // With a Sine wave for Longitude to simulate ground track
        const latRange = this.orbitParams.maxLat - this.orbitParams.minLat;
        const lat = this.orbitParams.minLat + (latRange * progress);

        // Longitude varies: Center + Amplitude * Sin(freq)
        // We want it to sweep across the map.
        // Let's make it sweep from West to East slightly as it goes North (Orbit inclination)
        const lngCenter = (this.orbitParams.minLng + this.orbitParams.maxLng) / 2;
        const lngOffset = (progress - 0.5) * 2; // -1 to 1

        // Add some sine wave wobble
        const wobble = Math.sin(progress * Math.PI * 4) * 0.1;

        const lng = lngCenter + lngOffset + wobble;

        return [lat, lng];
    }

    calculateSwath(progress) {
        const center = this.calculatePosition(progress);
        const width = this.orbitParams.swathWidth;
        // Create a rectangle/trapezoid around center
        // Simple approach: +/- width on longitude
        return [
            [center[0] - 0.2, center[1] - width], // Bottom Left
            [center[0] - 0.2, center[1] + width], // Bottom Right
            [center[0] + 0.2, center[1] + width], // Top Right
            [center[0] + 0.2, center[1] - width]  // Top Left
        ];
    }

    /**
     * Checks if a given LatLng is currently within the satellite's swath.
     * Used by SigintSystem to boost signal acquisition.
     */
    checkVisibility(lat, lng) {
        if (!this.isActive) return false;

        // Ray casting or simple bounds check?
        // Since our swath is defined by a simple box around the center point in calculateSwath,
        // we can check distance to current center vs width.
        const center = this.satelliteMarker.getLatLng();
        const point = L.latLng(lat, lng);

        // Simple distance check for now (approx 40km radius)
        // 0.4 degrees ~ 40km
        const dist = Math.abs(point.lng - center.lng);
        const latDist = Math.abs(point.lat - center.lat);

        // Must be close in both Lat (along track) and Lng (cross track)
        return (dist < this.orbitParams.swathWidth && latDist < 0.3);
    }

    taskSatellite(lat, lng) {
        // "Re-tasking" adjusts the orbit phase so the satellite is "approaching" the target
        // We calculate what progress value corresponds to this latitude
        // lat = minLat + range * progress => progress = (lat - minLat) / range

        const latRange = this.orbitParams.maxLat - this.orbitParams.minLat;
        let targetProgress = (lat - this.orbitParams.minLat) / latRange;

        // Clamp
        targetProgress = Math.max(0, Math.min(1, targetProgress));

        // We want the satellite to be "approaching", so set current progress
        // to a bit before the target (e.g., 5 seconds before)
        const preRoll = 0.1; // 10% of orbit before
        let newProgress = targetProgress - preRoll;

        if (newProgress < 0) newProgress += 1; // Wrap around

        this.currentOrbitProgress = newProgress;

        // Visual feedback
        const t = typeof translations !== 'undefined' ? translations[this.appState.language] : {};
        if (typeof showToast === 'function') {
            showToast(t.satRetasking || "SATELLITE RE-TASKING INITIATED...");
        }
    }

    showHUD() {
        let hud = document.getElementById('sat-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'sat-hud';
            hud.innerHTML = `
                <div class="sat-hud-header">ORBITAL VIEW ACTIVE</div>
                <div class="sat-hud-data">
                    <span>COORDS:</span> <span id="sat-status-coords">0.00, 0.00</span>
                </div>
                <div class="sat-hud-reticle"></div>
            `;
            document.body.appendChild(hud);
        }
        hud.style.display = 'block';
    }

    hideHUD() {
        const hud = document.getElementById('sat-hud');
        if (hud) hud.style.display = 'none';
    }

    notifyPassComplete() {
        // Optional: Trigger event or toast
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrbitalSystem };
}
