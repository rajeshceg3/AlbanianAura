/**
 * SandtableSystem - Tactical Simulation Environment
 * "Operation: SANDTABLE"
 *
 * Allows the user to place tactical assets (Threats, Safehouses) onto the map
 * to simulate different operational scenarios and stress-test mission plans.
 */
class SandtableSystem {
    constructor(map, appState) {
        this.map = map;
        this.appState = appState;
        this.isActive = false;
        this.assets = []; // { id, type, marker, circle, lat, lng }
        this.layerGroup = L.layerGroup().addTo(map);

        this.assetTypes = {
            'THREAT': {
                name: 'Hostile Emitter',
                icon: '☢️',
                color: '#ff3333',
                radius: 8000, // meters
                riskModifier: 0.5,
                description: 'Increases risk in sector.'
            },
            'SAFE': {
                name: 'Safehouse',
                icon: '🛡️',
                color: '#33ff99',
                radius: 5000,
                riskModifier: -0.3,
                description: 'Reduces risk in sector.'
            },
            'JAMMER': {
                name: 'Comms Jammer',
                icon: '⚡',
                color: '#ffcc00',
                radius: 6000,
                riskModifier: 0.2,
                description: 'Disrupts drone feeds.'
            }
        };

        this.initUI();
    }

    initUI() {
        // Toggle Button (Injected into UI Controls)
        const uiControls = document.querySelector('.ui-controls');
        if (uiControls) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'sandtableToggle';
            toggleBtn.className = 'control-button sandtable-btn';
            toggleBtn.innerHTML = '<span class="icon">♟️</span> Sandtable';
            toggleBtn.onclick = () => this.toggleMode();
            uiControls.appendChild(toggleBtn);
        }

        // Asset Palette (Hidden by default)
        this.palette = document.createElement('div');
        this.palette.id = 'sandtablePalette';
        this.palette.className = 'sandtable-palette';
        this.palette.innerHTML = `
            <div class="palette-header">
                <h4>Tactical Assets</h4>
                <span class="mode-indicator">SIMULATION ACTIVE</span>
            </div>
            <div class="asset-list">
                ${Object.entries(this.assetTypes).map(([key, type]) => `
                    <div class="asset-item" draggable="true" data-type="${key}">
                        <span class="asset-icon" style="color: ${type.color}">${type.icon}</span>
                        <div class="asset-info">
                            <span class="asset-name">${type.name}</span>
                            <span class="asset-desc">${type.description}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="palette-footer">
                <button id="clearAssetsBtn" class="control-button small-btn danger">Clear All</button>
            </div>
        `;
        document.body.appendChild(this.palette);

        // Bind Events
        this.bindEvents();
    }

    bindEvents() {
        // Drag and Drop Logic for Assets
        const assetItems = this.palette.querySelectorAll('.asset-item');
        assetItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', item.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        // Map Drop Zone
        const mapContainer = document.getElementById('map');
        mapContainer.addEventListener('dragover', (e) => {
            if (this.isActive) {
                e.preventDefault(); // Allow drop
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        mapContainer.addEventListener('drop', (e) => {
            if (this.isActive) {
                e.preventDefault();
                const type = e.dataTransfer.getData('type');
                if (type && this.assetTypes[type]) {
                    // Calculate LatLng from drop point
                    const point = this.map.mouseEventToContainerPoint(e);
                    const latLng = this.map.containerPointToLatLng(point);
                    this.addAsset(type, latLng);
                }
            }
        });

        document.getElementById('clearAssetsBtn').addEventListener('click', () => {
            this.clearAssets();
        });
    }

    toggleMode() {
        this.isActive = !this.isActive;
        document.body.classList.toggle('sandtable-mode', this.isActive);
        document.getElementById('sandtableToggle').classList.toggle('active', this.isActive);
        this.palette.classList.toggle('active', this.isActive);

        if (this.isActive) {
            this.map.dragging.enable(); // Ensure map is usable
            // Maybe switch tile layer if we had a blueprint one,
            // but CSS filter in style.css will handle the visual shift.
        }
    }

    addAsset(typeKey, latLng) {
        const type = this.assetTypes[typeKey];
        const id = 'asset_' + Date.now();

        // 1. Create Marker
        const icon = L.divIcon({
            className: 'sandtable-marker',
            html: `<div style="color:${type.color}; font-size: 24px;">${type.icon}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker(latLng, {
            icon: icon,
            draggable: true
        }).addTo(this.layerGroup);

        // 2. Create Radius Circle
        const circle = L.circle(latLng, {
            color: type.color,
            fillColor: type.color,
            fillOpacity: 0.1,
            radius: type.radius,
            dashArray: '5, 5',
            weight: 1
        }).addTo(this.layerGroup);

        // 3. Store Asset
        const asset = { id, type: typeKey, marker, circle, lat: latLng.lat, lng: latLng.lng };
        this.assets.push(asset);

        // 4. Bind Marker Events
        marker.on('drag', (e) => {
            const newPos = e.target.getLatLng();
            circle.setLatLng(newPos);
            asset.lat = newPos.lat;
            asset.lng = newPos.lng;
        });

        marker.on('dragend', () => {
            this.notifyChange();
        });

        marker.on('click', () => {
            // Simple remove on click for now (or open menu)
            if (confirm(`Remove ${type.name}?`)) {
                this.removeAsset(id);
            }
        });

        this.notifyChange();
    }

    removeAsset(id) {
        const index = this.assets.findIndex(a => a.id === id);
        if (index > -1) {
            const asset = this.assets[index];
            this.layerGroup.removeLayer(asset.marker);
            this.layerGroup.removeLayer(asset.circle);
            this.assets.splice(index, 1);
            this.notifyChange();
        }
    }

    clearAssets() {
        this.assets.forEach(a => {
            this.layerGroup.removeLayer(a.marker);
            this.layerGroup.removeLayer(a.circle);
        });
        this.assets = [];
        this.notifyChange();
    }

    notifyChange() {
        // Dispatch event for other systems (MissionPlanner, RiskAnalysis)
        const event = new CustomEvent('sandtableUpdated', {
            detail: { assets: this.assets }
        });
        window.dispatchEvent(event);
    }

    /**
     * API for RiskAnalysisSystem
     * Returns a risk modifier for a given location based on proximity to assets.
     */
    getRiskModifier(lat, lng) {
        let modifier = 0;
        const point = L.latLng(lat, lng);

        this.assets.forEach(asset => {
            const type = this.assetTypes[asset.type];
            const dist = point.distanceTo(L.latLng(asset.lat, asset.lng));

            if (dist <= type.radius) {
                // Linear falloff or flat? Let's do flat for "Zone" effect
                // Or maybe simple falloff?
                // For strategic clarity, full effect inside the zone is better.
                modifier += type.riskModifier;
            }
        });

        return modifier;
    }
}
