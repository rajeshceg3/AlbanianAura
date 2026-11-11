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

            showToast("TACTICAL COMMAND VIEW: ACTIVE");
        } else {
            document.body.classList.remove('command-mode');
            this.overlay.style.display = 'none';
            this.overlay.setAttribute('aria-hidden', 'true');
            this.toggleBtn.classList.remove('active');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandHUD };
}
