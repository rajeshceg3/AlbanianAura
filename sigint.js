class SigintSystem {
    constructor(map, appState, attractions) {
        this.map = map;
        this.appState = appState;
        this.attractions = attractions;
        this.isActive = false;
        this.signalLayers = [];
        this.activeSignal = null; // The signal currently being decrypted
        this.init();
    }

    init() {
        // Any pre-init logic
    }

    toggleSystem(active) {
        this.isActive = active;
        if (this.isActive) {
            this.renderSignals();
            document.body.classList.add('sigint-active');
            showToast("SIGINT Scanner Activated. Searching for frequencies...", 2000);
        } else {
            this.clearSignals();
            document.body.classList.remove('sigint-active');
        }
    }

    clearSignals() {
        this.signalLayers.forEach(layer => this.map.removeLayer(layer));
        this.signalLayers = [];
    }

    renderSignals() {
        this.clearSignals();
        this.attractions.forEach(attraction => {
            if (!attraction.sigint) return;

            const isUnlocked = this.appState.unlockedSignals.includes(attraction.name);
            const color = isUnlocked ? '#33ff99' : '#ffcc00'; // Green if unlocked, Amber if locked

            // Create a pulsing circle marker
            const pulseIcon = L.divIcon({
                className: `sigint-marker ${isUnlocked ? 'unlocked' : 'locked'}`,
                html: `<div class="pulse-ring" style="border-color: ${color}"></div><div class="signal-dot" style="background: ${color}"></div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([attraction.lat, attraction.lng], {
                icon: pulseIcon,
                zIndexOffset: 1000
            }).addTo(this.map);

            marker.on('click', () => {
                this.handleSignalClick(attraction);
            });

            this.signalLayers.push(marker);
        });
    }

    handleSignalClick(attraction) {
        if (this.appState.unlockedSignals.includes(attraction.name)) {
            // Already unlocked, show the intel directly
            this.showDecryptedIntel(attraction);
        } else {
            // Start decryption process
            this.openDecryptionTerminal(attraction);
        }
    }

    openDecryptionTerminal(attraction) {
        this.activeSignal = attraction;
        const modal = document.getElementById('sigintModal');
        const title = document.getElementById('sigintTitle');
        const content = document.getElementById('sigintContent');

        // Reset state
        modal.classList.add('active');
        title.textContent = `SIGNAL DETECTED: ${attraction.sigint.frequency} MHz`;

        // Render the mini-game interface
        content.innerHTML = `
            <div class="terminal-screen">
                <div class="signal-viz">
                    <canvas id="signalCanvas" width="300" height="100"></canvas>
                </div>
                <div class="encryption-status">ENCRYPTION LEVEL: ${'█'.repeat(attraction.sigint.encryption)}</div>
                <p class="instruction">Align frequency to decrypt...</p>

                <div class="slider-container">
                    <input type="range" id="freqSlider" min="0" max="100" value="50" class="freq-slider">
                </div>

                <button id="decryptBtn" class="terminal-btn" disabled>INITIATE DECRYPTION</button>
            </div>
        `;

        this.initDecryptionGame(attraction);

        // Accessibility: Trap focus
        // (Assuming similar trapFocus function available or implementation here)
        const closeBtn = document.getElementById('closeSigintModal');
        closeBtn.focus();
    }

    initDecryptionGame(attraction) {
        const canvas = document.getElementById('signalCanvas');
        const ctx = canvas.getContext('2d');
        const slider = document.getElementById('freqSlider');
        const decryptBtn = document.getElementById('decryptBtn');

        let targetFreq = Math.random() * 80 + 10; // Random target between 10-90
        let currentFreq = 50;
        let animationFrame;

        const drawSignal = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Target Wave (Ghost)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
            ctx.lineWidth = 2;
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + Math.sin((x + Date.now() / 20) * (targetFreq / 500)) * 30;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw User Wave
            ctx.beginPath();
            const proximity = 1 - Math.abs(currentFreq - targetFreq) / 100;
            const color = proximity > 0.9 ? '#33ff99' : '#ffcc00'; // Green when close
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            // Add some noise if far away
            const noise = (1 - proximity) * 10;

            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + Math.sin((x + Date.now() / 20) * (currentFreq / 500)) * 30 + (Math.random() - 0.5) * noise;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Check alignment
            if (Math.abs(currentFreq - targetFreq) < 5) {
                decryptBtn.disabled = false;
                decryptBtn.classList.add('ready');
            } else {
                decryptBtn.disabled = true;
                decryptBtn.classList.remove('ready');
            }

            if (document.getElementById('sigintModal').classList.contains('active')) {
                animationFrame = requestAnimationFrame(drawSignal);
            }
        };

        slider.addEventListener('input', (e) => {
            currentFreq = parseInt(e.target.value);
        });

        decryptBtn.addEventListener('click', () => {
            cancelAnimationFrame(animationFrame);
            this.processDecryption(attraction);
        });

        drawSignal();
    }

    processDecryption(attraction) {
        const content = document.getElementById('sigintContent');
        content.innerHTML = `<div class="terminal-text">DECRYPTING... <span class="blink">_</span></div>`;

        setTimeout(() => {
            this.appState.unlockSignal(attraction.name);
            this.showDecryptedIntel(attraction);
            // Refresh markers to update color
            this.renderSignals();
        }, 1500);
    }

    showDecryptedIntel(attraction) {
        const modal = document.getElementById('sigintModal');
        const title = document.getElementById('sigintTitle');
        const content = document.getElementById('sigintContent');

        modal.classList.add('active');
        title.textContent = `DECRYPTED INTEL: ${attraction.name.toUpperCase()}`;

        const intelText = attraction.sigint.intel[this.appState.language] || attraction.sigint.intel['en'];

        content.innerHTML = `
            <div class="intel-dossier">
                <div class="intel-header">
                    <span>CLEARANCE: LEVEL ${attraction.sigint.encryption}</span>
                    <span>TYPE: ${attraction.sigint.type}</span>
                </div>
                <div class="intel-body typewriter">
                    ${intelText}
                </div>
                <div class="intel-footer">
                    LOGGED IN ARCHIVE
                </div>
            </div>
        `;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SigintSystem };
}
