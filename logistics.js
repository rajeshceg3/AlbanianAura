/**
 * LogisticsSystem - Temporal Operations Grid (T.O.G.)
 * Handles mission timing, travel estimation, and risk assessment based on temporal factors.
 */
class LogisticsSystem {
    constructor(map, appState, attractions) {
        this.map = map;
        this.appState = appState;
        this.attractions = attractions;
        this.averageSpeed = 50; // km/h
        this.metersPerMinute = (this.averageSpeed * 1000) / 60;
        this.missionStartTime = 8 * 60; // 08:00 default (in minutes from midnight)

        this.initUI();

        // Subscribe to state changes
        this.appState.subscribe('itineraryChanged', () => this.updateTimeline());
    }

    initUI() {
        // Add timeline container to Mission Control
        const panel = document.getElementById('missionControlPanel');
        const statsSection = panel.querySelector('.mission-stats');

        // Create container before the stats section or append to it?
        // Let's insert it before the stats for better visibility
        const timelineContainer = document.createElement('div');
        timelineContainer.id = 'missionTimeline';
        timelineContainer.className = 'mission-timeline';

        // Header with Start Time Control
        const header = document.createElement('div');
        header.className = 'timeline-header';
        header.innerHTML = `
            <h3>Mission Timeline</h3>
            <div class="start-time-control">
                <label for="missionStartInput">Start:</label>
                <input type="time" id="missionStartInput" value="08:00">
            </div>
        `;

        const list = document.createElement('div');
        list.id = 'timelineList';
        list.className = 'timeline-list';

        timelineContainer.appendChild(header);
        timelineContainer.appendChild(list);

        // Insert before stats
        panel.insertBefore(timelineContainer, statsSection);

        // Listener for start time
        document.getElementById('missionStartInput').addEventListener('change', (e) => {
            const [hours, minutes] = e.target.value.split(':').map(Number);
            this.missionStartTime = hours * 60 + minutes;
            this.updateTimeline();
        });
    }

    updateTimeline() {
        const itinerary = this.appState.itinerary;
        const list = document.getElementById('timelineList');
        list.innerHTML = '';

        if (itinerary.length === 0) {
            list.innerHTML = '<p class="empty-timeline">No active mission parameters.</p>';
            return;
        }

        let currentTime = this.missionStartTime;
        let previousLocation = null;

        // Render Start Point
        this.renderTimelineItem(list, {
            time: currentTime,
            type: 'start',
            name: 'MISSION START',
            risk: null
        });

        itinerary.forEach((name, index) => {
            const attraction = this.attractions.find(a => a.name === name);
            if (!attraction) return;

            // Calculate Travel Time
            if (previousLocation) {
                const dist = new L.LatLng(previousLocation.lat, previousLocation.lng)
                              .distanceTo(new L.LatLng(attraction.lat, attraction.lng));

                const travelMinutes = Math.round(dist / this.metersPerMinute);

                // Render Travel Segment
                this.renderTravelSegment(list, travelMinutes);

                currentTime += travelMinutes;
            }

            // Arrival at Target
            const arrivalTime = currentTime;
            const duration = attraction.crowdStats ? attraction.crowdStats.duration : 60;
            const departureTime = currentTime + duration;

            // Risk Assessment
            const risk = this.assessRisk(attraction, arrivalTime, departureTime);

            this.renderTimelineItem(list, {
                time: arrivalTime,
                endTime: departureTime,
                type: 'target',
                name: attraction.name,
                duration: duration,
                risk: risk
            });

            currentTime = departureTime;
            previousLocation = attraction;
        });

        // Render End
        this.renderTimelineItem(list, {
            time: currentTime,
            type: 'end',
            name: 'MISSION COMPLETE',
            risk: null
        });
    }

    assessRisk(attraction, arrivalTime, departureTime) {
        if (!attraction.crowdStats) return 'UNKNOWN';

        const arrivalHour = (arrivalTime / 60) % 24;
        const peakHour = attraction.crowdStats.peakHour;

        // Check if visit overlaps with peak hour (within +/- 1.5 hours)
        const timeDiff = Math.abs(arrivalHour - peakHour);

        if (timeDiff < 1.5) return 'HIGH';
        if (timeDiff < 3) return 'MODERATE';
        return 'LOW';
    }

    formatTime(minutes) {
        let h = Math.floor(minutes / 60) % 24;
        let m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    renderTimelineItem(container, data) {
        const item = document.createElement('div');
        item.className = `timeline-node ${data.type}`;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'node-time';
        timeSpan.textContent = this.formatTime(data.time);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'node-content';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'node-name';
        nameDiv.textContent = data.name;

        contentDiv.appendChild(nameDiv);

        if (data.type === 'target') {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'node-details';
            detailsDiv.textContent = `Duration: ${data.duration}m`;

            if (data.risk) {
                const riskBadge = document.createElement('span');
                riskBadge.className = `risk-badge ${data.risk.toLowerCase()}`;
                riskBadge.textContent = `${data.risk} RISK`;
                detailsDiv.appendChild(riskBadge);
            }
            contentDiv.appendChild(detailsDiv);

            // Add departure time hint
            const depTime = document.createElement('div');
            depTime.className = 'node-departure';
            depTime.textContent = `Departs: ${this.formatTime(data.endTime)}`;
            contentDiv.appendChild(depTime);
        }

        item.appendChild(timeSpan);
        item.appendChild(contentDiv);
        container.appendChild(item);
    }

    renderTravelSegment(container, minutes) {
        const segment = document.createElement('div');
        segment.className = 'timeline-segment';
        segment.innerHTML = `<span class="travel-icon">⬇</span> <span class="travel-time">${minutes} min transit</span>`;
        container.appendChild(segment);
    }
}
