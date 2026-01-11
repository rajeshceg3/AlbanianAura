/**
 * MissionPlanner - Tactical Vector Overlay & Reconnaissance System (TVORS)
 * Handles visual routing, telemetry calculations, and mission simulation.
 */
class MissionPlanner {
    constructor(map, appState, attractions, riskSystem) {
        this.map = map;
        this.appState = appState;
        this.attractions = attractions;
        this.riskSystem = riskSystem;
        this.vectorLayer = L.layerGroup().addTo(map);
        this.isSimulating = false;

        this.initMissionControls();

        // Subscribe to state changes
        this.appState.subscribe('itineraryChanged', this.updateMission.bind(this));
        this.appState.subscribe('missionsUpdated', this.refreshMissionSelector.bind(this));
        this.appState.subscribe('missionSwitched', () => {
             this.refreshMissionSelector();
             this.updateMission(this.appState.itinerary);
        });

        // Initial draw
        this.updateMission(this.appState.itinerary);
    }

    initMissionControls() {
        const panel = document.getElementById('missionControlPanel');
        const listContainer = document.getElementById('missionList');

        // Create Mission Selector UI
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'mission-selector-container';

        selectorContainer.innerHTML = `
            <select id="missionSelector" aria-label="Select Mission Profile"></select>
            <button id="newMissionBtn" class="control-button" aria-label="Create New Mission" title="New Mission">+</button>
        `;

        // Create Analysis Button
        const analysisBtn = document.createElement('button');
        analysisBtn.className = 'control-button analysis-btn';
        analysisBtn.innerHTML = '<span class="icon">📊</span> Strategic Analysis';
        analysisBtn.onclick = () => this.openAnalysisModal();

        // Insert into DOM
        // Selector goes above the list
        panel.insertBefore(selectorContainer, listContainer);
        // Analysis goes below selector
        panel.insertBefore(analysisBtn, listContainer);

        // Bind Events
        document.getElementById('newMissionBtn').onclick = () => this.createNewMission();
        document.getElementById('missionSelector').onchange = (e) => this.appState.switchMission(e.target.value);

        this.refreshMissionSelector();
    }

    refreshMissionSelector() {
        const selector = document.getElementById('missionSelector');
        if (!selector) return;

        selector.innerHTML = '';
        const missions = this.appState.getMissions();
        const currentId = this.appState.currentMissionId;

        Object.values(missions).forEach(mission => {
            const option = document.createElement('option');
            option.value = mission.id;
            option.textContent = mission.name;
            option.selected = mission.id === currentId;
            selector.appendChild(option);
        });
    }

    createNewMission() {
        const name = prompt("Enter Mission Codename:");
        if (name) {
            const id = this.appState.createMission(name);
            this.appState.switchMission(id);
        }
    }

    openAnalysisModal() {
        // Find or create modal
        let modal = document.getElementById('analysisModal');
        if (!modal) {
             // Let logic below handle creation if missing in HTML,
             // but strictly we should add it to HTML.
             // For now we assume HTML will have it or we create it here.
             console.warn("Analysis modal not found in DOM");
             return;
        }

        const missions = this.appState.getMissions();
        const tbody = document.getElementById('analysisTableBody');
        tbody.innerHTML = '';

        // Helper to calc stats
        const calcStats = (targets) => {
            let dist = 0;
            let duration = 0;
            let risk = 0;

            const points = targets.map(name => this.attractions.find(a => a.name === name)).filter(Boolean);

            for(let i=0; i<points.length-1; i++) {
                dist += new L.LatLng(points[i].lat, points[i].lng).distanceTo(new L.LatLng(points[i+1].lat, points[i+1].lng));
            }

            points.forEach(p => {
                duration += (p.crowdStats ? p.crowdStats.duration : 60);
                // Simple risk heuristic: peak hour proximity?
                // Let's just sum maxDensity for "Risk Score"
                if (p.crowdStats) risk += p.crowdStats.maxDensity;
            });

            // Add travel time approx (50km/h)
            duration += (dist / 1000 / 50) * 60;

            return {
                dist: (dist/1000).toFixed(1),
                duration: Math.round(duration / 60), // hours
                risk: (risk / (points.length || 1)).toFixed(2) // avg density
            };
        };

        // Find Max values for bars
        let maxDist = 0;
        const rows = [];

        Object.values(missions).forEach(m => {
            const stats = calcStats(m.targets);
            if (parseFloat(stats.dist) > maxDist) maxDist = parseFloat(stats.dist);
            rows.push({ mission: m, stats });
        });

        rows.forEach(({ mission, stats }) => {
            const tr = document.createElement('tr');
            if (mission.id === this.appState.currentMissionId) tr.classList.add('active-mission');

            // Risk Color
            const riskVal = parseFloat(stats.risk);
            const riskColor = riskVal < 0.3 ? '#33ff99' : (riskVal < 0.6 ? '#ffcc00' : '#ff3333');

            // Bar width
            const barWidth = maxDist > 0 ? (stats.dist / maxDist) * 100 : 0;

            tr.innerHTML = `
                <td><strong>${mission.name}</strong>${mission.id === this.appState.currentMissionId ? ' (ACTIVE)' : ''}</td>
                <td>
                    ${stats.dist} km
                    <div class="bar-container"><div class="bar-fill" style="width: ${barWidth}%;"></div></div>
                </td>
                <td>${stats.duration} hrs</td>
                <td style="color: ${riskColor}">${stats.risk}</td>
                <td>
                    ${mission.id !== this.appState.currentMissionId ?
                        `<button class="control-button small-btn" onclick="appState.switchMission('${mission.id}'); document.getElementById('closeAnalysisModal').click();">ACTIVATE</button>` :
                        '<span style="font-size:0.8rem; color:#666;">ACTIVE</span>'
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Open Modal
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Updates the tactical vector overlay based on the current itinerary.
     * @param {string[]} itinerary - List of attraction names
     */
    updateMission(itinerary) {
        this.vectorLayer.clearLayers();

        if (!itinerary || itinerary.length < 2) {
            this.updateTelemetry(0);
            return;
        }

        const points = itinerary.map(name => {
            const attr = this.attractions.find(a => a.name === name);
            return attr ? new L.LatLng(attr.lat, attr.lng) : null;
        }).filter(p => p !== null);

        if (points.length < 2) return;

        // Draw the flight path segments
        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i+1];
            const segDist = start.distanceTo(end);
            totalDistance += segDist;

            // Determine color based on risk
            let color = '#00ffcc'; // Default tactical cyan
            if (this.riskSystem) {
                // Find attraction data for "end" point to check density risk
                // This is an approximation since points are just latlngs here
                // We'll search by proximity (inefficient but safe) or just pass names in future
                const targetAttr = this.attractions.find(a =>
                    Math.abs(a.lat - end.lat) < 0.0001 && Math.abs(a.lng - end.lng) < 0.0001
                );

                // Use default time 12:00 for map view visualization
                const risk = this.riskSystem.calculateSegmentRisk(null, targetAttr, 12);
                color = this.riskSystem.getRiskColor(risk);
            }

            const polyline = L.polyline([start, end], {
                color: color,
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 10',
                className: 'tactical-path'
            });
            this.vectorLayer.addLayer(polyline);
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
            const t = (typeof translations !== 'undefined' && translations[this.appState.language])
                      ? translations[this.appState.language]
                      : (typeof translations !== 'undefined' ? translations['en'] : { missionAborted: "Mission Aborted" });
            showToast(t.missionAborted || "Mission Aborted");
            return;
        }

        this.isSimulating = true;
        // Apply class to body to trigger CSS locks (disables UI interactions)
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
            const targetLatLng = L.latLng(attraction.lat, attraction.lng);
            const currentCenter = this.map.getCenter();

            // If already close enough, resolve immediately to avoid hanging
            if (currentCenter.distanceTo(targetLatLng) < 100) {
                 const marker = allMarkers.find(m => m.attractionData.name === attraction.name);
                 if (marker) marker.openPopup();
                 resolve();
                 return;
            }

            this.map.flyTo([attraction.lat, attraction.lng], 12, {
                animate: true,
                duration: 2
            });

            // Handler for moveend
            const onMoveEnd = () => {
                clearTimeout(timeout);
                // Open popup on arrival
                const marker = allMarkers.find(m => m.attractionData.name === attraction.name);
                if (marker) marker.openPopup();
                resolve();
            };

            // Add a safety timeout in case moveend never fires
            const timeout = setTimeout(() => {
                // If timeout triggers, we must remove the listener to avoid side effects later
                this.map.off('moveend', onMoveEnd);
                resolve();
            }, 3000);

            this.map.once('moveend', onMoveEnd);
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
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            this.rafId = requestAnimationFrame(() => {
                this.updateVisualization();
                this.rafId = null;
            });
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

/**
 * PathfinderSystem - Strategic Route Optimization & Threat Assessment Module.
 * "Operation: Pathfinder"
 */
class PathfinderSystem {
    constructor(map, attractions, crowdIntelSystem) {
        this.map = map;
        this.attractions = attractions;
        this.crowdIntelSystem = crowdIntelSystem;
    }

    /**
     * Optimizes the itinerary using a Nearest Neighbor algorithm.
     * Keeps the first target as the fixed start point (Base of Operations).
     * @param {string[]} itinerary - List of attraction names
     * @returns {string[]} - Optimized list of attraction names
     */
    optimizeRoute(itinerary) {
        if (itinerary.length <= 2) return itinerary;

        const optimized = [itinerary[0]];
        const remaining = itinerary.slice(1);

        while (remaining.length > 0) {
            const lastPoint = this.getLatLng(optimized[optimized.length - 1]);
            let nearestIndex = -1;
            let minDist = Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const currentPoint = this.getLatLng(remaining[i]);
                const dist = lastPoint.distanceTo(currentPoint);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIndex = i;
                }
            }

            optimized.push(remaining[nearestIndex]);
            remaining.splice(nearestIndex, 1);
        }

        return optimized;
    }

    getLatLng(name) {
        const attr = this.attractions.find(a => a.name === name);
        return new L.LatLng(attr.lat, attr.lng);
    }

    /**
     * Generates and renders the Mission Threat Profile (Crowd Density over steps).
     * @param {string[]} itinerary
     * @param {string} containerId
     */
    renderProfile(itinerary, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (itinerary.length === 0) {
            container.innerHTML = '';
            container.parentElement.style.display = 'none';
            return;
        }

        container.parentElement.style.display = 'block';
        container.innerHTML = '';

        // Data Preparation
        const data = itinerary.map((name, index) => {
            const attr = this.attractions.find(a => a.name === name);
            // Use current time from CrowdIntelSystem or default to peak for assessment
            // For a static profile, we might show "Peak Potential Threat" or "Current Threat"
            // Let's show "Current Projected Threat" based on current slider time.
            const density = this.crowdIntelSystem ? this.crowdIntelSystem.calculateDensity(attr) : 0.5;
            return { name, density };
        });

        // SVG Dimensions
        const width = container.clientWidth || 280;
        const height = 100;
        const barWidth = (width / data.length) - 4;
        const maxBarHeight = 80;

        let svgContent = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Define gradients
        svgContent += `
            <defs>
                <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff3333"/>
                    <stop offset="50%" stop-color="#ffcc00"/>
                    <stop offset="100%" stop-color="#00ffcc"/>
                </linearGradient>
            </defs>
        `;

        data.forEach((d, i) => {
            const h = Math.max(d.density * maxBarHeight, 5); // Min height 5
            const x = i * (width / data.length) + 2;
            const y = height - h - 15; // Leave room for labels

            // Threat Level Color
            let fill = '#00ffcc';
            if (d.density > 0.3) fill = '#ffcc00';
            if (d.density > 0.6) fill = '#ff3333';

            svgContent += `
                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="2" fill="${fill}" opacity="0.8">
                    <animate attributeName="height" from="0" to="${h}" dur="0.5s" fill="freeze" />
                    <animate attributeName="y" from="${height - 15}" to="${y}" dur="0.5s" fill="freeze" />
                </rect>
                <text x="${x + barWidth/2}" y="${height-2}" font-family="monospace" font-size="10" fill="#666" text-anchor="middle">${i+1}</text>
            `;
        });

        svgContent += `</svg>`;
        container.innerHTML = svgContent;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MissionPlanner, CrowdIntelSystem, PathfinderSystem };
}
