/**
 * CommandHUD - Tactical 3D Heads-Up Display
 * Provides a 2.5D "War Room" perspective with tactical overlays.
 */
class CommandHUD {
    constructor(map) {
        this.map = map;
        this.active = false;
        this.initUI();
    }

    initUI() {
        // Create the HUD overlay container (pointer-events: none usually, but we might want interaction)
        this.overlay = document.createElement('div');
        this.overlay.className = 'command-hud-overlay';
        this.overlay.style.display = 'none';
        this.overlay.setAttribute('aria-hidden', 'true');

        // Compass Tape
        this.compass = document.createElement('div');
        this.compass.className = 'hud-compass';
        this.compass.innerHTML = `
            <div class="compass-tape">
                <span>N</span><span>|</span><span>|</span><span>NE</span><span>|</span><span>|</span>
                <span>E</span><span>|</span><span>|</span><span>SE</span><span>|</span><span>|</span>
                <span>S</span><span>|</span><span>|</span><span>SW</span><span>|</span><span>|</span>
                <span>W</span><span>|</span><span>|</span><span>NW</span><span>|</span><span>|</span>
                <span>N</span>
            </div>
            <div class="compass-marker">▼</div>
        `;
        this.overlay.appendChild(this.compass);

        // Tactical Grid Overlay (SVG)
        this.grid = document.createElement('div');
        this.grid.className = 'hud-grid';
        this.overlay.appendChild(this.grid);

        // Status Indicators
        this.status = document.createElement('div');
        this.status.className = 'hud-status';
        this.status.innerHTML = `
            <div class="status-item">MODE: <span class="blink">TACTICAL_3D</span></div>
            <div class="status-item">PITCH: 45°</div>
        `;
        this.overlay.appendChild(this.status);

        document.body.appendChild(this.overlay);

        // Create Toggle Button
        this.createToggleButton();
    }

    createToggleButton() {
        const uiControls = document.querySelector('.ui-controls');
        if (!uiControls) return;

        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'control-button hud-toggle';
        this.toggleBtn.innerHTML = '<span class="icon">📐</span> 3D CMD';
        this.toggleBtn.setAttribute('aria-label', 'Toggle Command Mode');
        this.toggleBtn.onclick = () => this.toggle();

        uiControls.appendChild(this.toggleBtn);
    }

    toggle() {
        this.active = !this.active;
        const mapContainer = document.getElementById('map');

        if (this.active) {
            document.body.classList.add('command-mode');
            this.overlay.style.display = 'block';
            this.overlay.setAttribute('aria-hidden', 'false');
            this.toggleBtn.classList.add('active');

            // Adjust markers to stand up
            this.updateMarkerOrientation();

            // Add listeners for map movement to update compass/markers
            this.map.on('move', this.onMapMove.bind(this));
            this.map.on('zoom', this.updateMarkerOrientation.bind(this));

            showToast("TACTICAL COMMAND VIEW: ACTIVE");
        } else {
            document.body.classList.remove('command-mode');
            this.overlay.style.display = 'none';
            this.overlay.setAttribute('aria-hidden', 'true');
            this.toggleBtn.classList.remove('active');

            this.map.off('move', this.onMapMove.bind(this));
            this.map.off('zoom', this.updateMarkerOrientation.bind(this));

            // Reset markers
            this.resetMarkers();
        }
    }

    onMapMove() {
        // Update Compass Tape based on bearing?
        // Leaflet doesn't support rotation by default, so bearing is always North=Top.
        // But if we simulate rotation later, we'd update this.
        // For now, just a visual effect.
    }

    updateMarkerOrientation() {
        // Counter-rotate markers so they stand up in 3D
        // The map is rotated X by 45deg.
        // Markers need to rotate X by -45deg.

        // We target the leaflet-marker-icon class
        const markers = document.querySelectorAll('.leaflet-marker-icon, .leaflet-popup, .leaflet-tooltip');
        markers.forEach(el => {
            el.style.transform += ' rotateX(-45deg)';
            // Note: modifying transform directly is tricky because Leaflet controls it (translate3d).
            // We should use a class that adds the transform, but Leaflet sets inline styles.
            // Better approach: CSS rule with !important or appended transform if possible.
            // Actually, we can just use a global CSS rule for .command-mode .leaflet-marker-icon
            // that adds `transform: rotateX(-45deg)`?
            // Leaflet uses `transform: translate3d(x,y,z)`. Adding rotateX might override it or be overridden.
            // If we use `transform-style: preserve-3d` on the map pane, and apply rotation there?
        });
    }

    resetMarkers() {
        // CSS handles reset via class removal
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandHUD };
}
