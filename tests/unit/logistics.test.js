import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogisticsSystem } from '../../logistics.js';

describe('LogisticsSystem', () => {
    let logistics;
    let mockMap;
    let mockAppState;
    let mockAttractions;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="missionControlPanel">
                <div class="mission-stats"></div>
            </div>
        `;

        mockMap = {};
        mockAppState = {
            subscribe: vi.fn(),
            itinerary: []
        };
        mockAttractions = [
            {
                name: 'Attraction A',
                lat: 40.0,
                lng: 20.0,
                crowdStats: { peakHour: 10, duration: 60 }
            },
            {
                name: 'Attraction B',
                lat: 40.01,
                lng: 20.01,
                crowdStats: { peakHour: 14, duration: 45 }
            }
        ];

        // Mock Leaflet LatLng
        global.L = {
            LatLng: class {
                constructor(lat, lng) {
                    this.lat = lat;
                    this.lng = lng;
                }
                distanceTo() {
                    return 1000; // 1km for testing
                }
            }
        };

        logistics = new LogisticsSystem(mockMap, mockAppState, mockAttractions);
    });

    it('should initialize UI correctly', () => {
        const container = document.getElementById('missionTimeline');
        expect(container).toBeTruthy();
        expect(container.querySelector('input[type="time"]')).toBeTruthy();
    });

    it('should format time correctly', () => {
        expect(logistics.formatTime(480)).toBe('08:00'); // 8 * 60
        expect(logistics.formatTime(485)).toBe('08:05');
        expect(logistics.formatTime(1439)).toBe('23:59');
    });

    it('should assess risk correctly', () => {
        const attraction = { crowdStats: { peakHour: 10 } };

        // Arrival at 10:00 (600 mins) - Peak is 10
        // Diff is 0 -> HIGH Risk (< 1.5)
        expect(logistics.assessRisk(attraction, 600, 660)).toBe('HIGH');

        // Arrival at 12:00 (720 mins) - Peak is 10
        // Diff is 2 -> MODERATE Risk (< 3)
        expect(logistics.assessRisk(attraction, 720, 780)).toBe('MODERATE');

        // Arrival at 14:00 (840 mins) - Peak is 10
        // Diff is 4 -> LOW Risk
        expect(logistics.assessRisk(attraction, 840, 900)).toBe('LOW');
    });

    it('should update timeline on itinerary change', () => {
        mockAppState.itinerary = ['Attraction A', 'Attraction B'];

        logistics.updateTimeline();

        const items = document.querySelectorAll('.timeline-node');
        expect(items.length).toBe(4); // Start, A, B, End

        const segments = document.querySelectorAll('.timeline-segment');
        expect(segments.length).toBe(1); // Between A and B (Start to A is implicit in this simplified test or logic)
        // Wait, looking at code:
        // Start Node
        // Loop:
        //   If previous -> render segment
        //   Render Node
        // End Node

        // Loop 0 (A): prev=null. No segment. Render A.
        // Loop 1 (B): prev=A. Render segment. Render B.
        // End.

        // So expected segments: 1.
    });
});
