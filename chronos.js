/**
 * Operation: CHRONOS
 * Chronological Reconnaissance & Operational Navigation Overlay System
 *
 * Allows temporal surveillance of the operational area across different historical eras.
 */
class ChronosSystem {
    constructor(map, appState) {
        this.map = map;
        this.appState = appState;
        this.active = false;
        this.currentEra = 'PRESENT';
        this.historicalMarkers = [];

        // Ensure data is loaded
        this.data = (typeof chronosData !== 'undefined') ? chronosData : { ANTIQUITY: [], MEDIEVAL: [], COLD_WAR: [] };

        this.eras = ['ANTIQUITY', 'MEDIEVAL', 'COLD_WAR', 'PRESENT'];

        // Initial setup
        this.initUI();
    }

    initUI() {
        // Create the Toggle Button in the main UI
        const uiControls = document.querySelector('.ui-controls');
        if (uiControls) {
            this.toggleBtn = document.createElement('button');
            this.toggleBtn.className = 'control-button chronos-toggle';
            this.toggleBtn.innerHTML = '<span class="icon">⏳</span> CHRONOS';
            this.toggleBtn.setAttribute('aria-label', 'Toggle Temporal Recon');
            this.toggleBtn.onclick = () => this.toggleSystem();

            // Insert before Generative Mode or at the end
            const genBtn = document.getElementById('generativeModeBtn');
            if (genBtn) {
                uiControls.insertBefore(this.toggleBtn, genBtn);
            } else {
                uiControls.appendChild(this.toggleBtn);
            }
        }

        // Create the Timeline Control Panel
        this.panel = document.createElement('div');
        this.panel.id = 'chronosPanel';
        this.panel.className = 'chronos-panel';
        this.panel.setAttribute('aria-hidden', 'true');
        this.panel.innerHTML = `
            <div class="chronos-header">
                <h3>TEMPORAL RECON</h3>
                <div class="chronos-status">ERA: <span id="chronosEraLabel">PRESENT</span></div>
            </div>
            <div class="timeline-container">
                <input type="range" id="chronosSlider" min="0" max="3" value="3" step="1">
                <div class="timeline-labels">
                    <span>500 BC</span>
                    <span>1400 AD</span>
                    <span>1970</span>
                    <span>2024</span>
                </div>
            </div>
            <div class="chronos-intel">
                <p id="chronosDescription">Standard operational view active.</p>
            </div>
        `;
        document.body.appendChild(this.panel);

        // Bind Slider Event
        const slider = document.getElementById('chronosSlider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const index = parseInt(e.target.value);
                this.setEra(this.eras[index]);
            });
        }
    }

    toggleSystem() {
        this.active = !this.active;
        this.toggleBtn.classList.toggle('active', this.active);
        this.panel.classList.toggle('active', this.active);
        this.panel.setAttribute('aria-hidden', !this.active);
        document.body.classList.toggle('chronos-active', this.active);

        if (this.active) {
            showToast("OPERATION CHRONOS: INITIALIZED");
            // Set initial state
            const slider = document.getElementById('chronosSlider');
            if (slider) {
                this.setEra(this.eras[parseInt(slider.value)]);
            }
        } else {
            // Reset to normal
            this.clearVisuals();
            this.clearHistoricalMarkers();
            this.restorePresentMarkers();
            showToast("TEMPORAL LINK SEVERED");
        }
    }

    setEra(era) {
        if (!this.active) return;
        this.currentEra = era;

        // Update UI Text
        const label = document.getElementById('chronosEraLabel');
        const desc = document.getElementById('chronosDescription');
        if (label) label.textContent = era.replace('_', ' ');
        if (desc) desc.textContent = this.getEraDescription(era);

        // Update System
        this.updateVisuals(era);
        this.updateMarkers(era);
    }

    getEraDescription(era) {
        const t = (this.appState && translations[this.appState.language]) ? translations[this.appState.language] : null;
        // Fallbacks if translations not yet updated
        switch (era) {
            case 'ANTIQUITY': return "Analyzing ancient Illyrian and Roman infrastructure.";
            case 'MEDIEVAL': return "Tracking Ottoman expansion and resistance strongholds.";
            case 'COLD_WAR': return "Surveillance of communist regime defense networks.";
            case 'PRESENT': return "Standard operational view active.";
            default: return "";
        }
    }

    updateVisuals(era) {
        // Remove all era classes first
        document.body.classList.remove('era-antiquity', 'era-medieval', 'era-coldwar');

        switch (era) {
            case 'ANTIQUITY':
                document.body.classList.add('era-antiquity');
                break;
            case 'MEDIEVAL':
                document.body.classList.add('era-medieval');
                break;
            case 'COLD_WAR':
                document.body.classList.add('era-coldwar');
                break;
            case 'PRESENT':
                // No specific class, default map
                break;
        }
    }

    updateMarkers(era) {
        // Clear existing historical markers
        this.clearHistoricalMarkers();

        if (era === 'PRESENT') {
            this.restorePresentMarkers();
        } else {
            this.hidePresentMarkers();
            this.spawnHistoricalMarkers(era);
        }
    }

    hidePresentMarkers() {
        // We assume 'allMarkers' is a global array of the main markers from script.js
        // Ideally we should pass it in, but for now we access the global if available,
        // or we rely on CSS to hide '.custom-marker' and we add a specific class to our new markers.
        // CSS approach is cleaner: .chronos-active:not(.era-present) .custom-marker { display: none; }
        // But we need to distinguish "Present" markers from "Historical" markers.
        // Let's implement this via JS for precision.

        if (typeof allMarkers !== 'undefined') {
            allMarkers.forEach(m => {
                // Check if it's already removed? Leaflet removeLayer is cheap.
                if (this.map.hasLayer(m)) {
                    this.map.removeLayer(m);
                }
            });
        }
    }

    restorePresentMarkers() {
        if (typeof allMarkers !== 'undefined') {
            allMarkers.forEach(m => {
                if (!this.map.hasLayer(m)) {
                    m.addTo(this.map);
                }
            });
        }
    }

    spawnHistoricalMarkers(era) {
        const points = this.data[era];
        if (!points) return;

        points.forEach(point => {
            const icon = L.divIcon({
                className: `chronos-marker marker-${era.toLowerCase()}`,
                html: `<div class="marker-inner"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = L.marker([point.lat, point.lng], { icon: icon }).addTo(this.map);

            // Generate Popup
            const desc = (point.description[this.appState.language] || point.description['en']);
            const content = `
                <div class="chronos-popup">
                    <h4>${point.name}</h4>
                    <p class="era-tag">${era.replace('_', ' ')}</p>
                    <p>${desc}</p>
                </div>
            `;
            marker.bindPopup(content);

            this.historicalMarkers.push(marker);
        });
    }

    clearHistoricalMarkers() {
        this.historicalMarkers.forEach(m => this.map.removeLayer(m));
        this.historicalMarkers = [];
    }

    clearVisuals() {
        document.body.classList.remove('era-antiquity', 'era-medieval', 'era-coldwar');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChronosSystem };
}
