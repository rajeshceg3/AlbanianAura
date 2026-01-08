import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrowdIntelSystem, PathfinderSystem } from '../../mission-planner.js';

describe('CrowdIntelSystem', () => {
    let system;
    let mockMap;
    let mockAttractions;

    beforeEach(() => {
        // Mock Leaflet
        global.L = {
            layerGroup: () => ({
                addTo: () => ({
                    clearLayers: vi.fn(),
                    addLayer: vi.fn()
                })
            }),
            circle: () => ({
                addTo: () => ({
                    bindTooltip: vi.fn()
                })
            })
        };

        mockMap = {};
        mockAttractions = [];
        system = new CrowdIntelSystem(mockMap, mockAttractions);
    });

    it('should calculate density correctly', () => {
        const attraction = {
            crowdStats: { maxDensity: 1.0, peakHour: 12 }
        };

        // At peak hour
        system.setHour(12);
        expect(system.calculateDensity(attraction)).toBeCloseTo(1.0);

        // Far from peak hour (12 vs 18 = 6 hours diff)
        // decay = exp(-(36)/(18)) = exp(-2) = 0.135
        system.setHour(18);
        expect(system.calculateDensity(attraction)).toBeCloseTo(0.135, 2);
    });

    it('should return correct threat color', () => {
        expect(system.getThreatColor(0.2)).toBe('#00ffcc');
        expect(system.getThreatColor(0.5)).toBe('#ffcc00');
        expect(system.getThreatColor(0.8)).toBe('#ff3333');
    });
});

describe('PathfinderSystem', () => {
    let system;
    let mockMap;
    let mockAttractions;

    beforeEach(() => {
         global.L = {
            LatLng: class {
                constructor(lat, lng) {
                    this.lat = lat;
                    this.lng = lng;
                }
                distanceTo(other) {
                    // Simple Euclidean distance for test
                    return Math.sqrt(
                        Math.pow(this.lat - other.lat, 2) +
                        Math.pow(this.lng - other.lng, 2)
                    );
                }
            }
        };

        mockAttractions = [
            { name: 'Start', lat: 0, lng: 0 },
            { name: 'Far', lat: 10, lng: 10 },
            { name: 'Near', lat: 1, lng: 1 }
        ];

        system = new PathfinderSystem(mockMap, mockAttractions, null);
    });

    it('should optimize route using nearest neighbor', () => {
        // Start -> Far -> Near (Unoptimized)
        // Optimized should be Start -> Near -> Far
        const itinerary = ['Start', 'Far', 'Near'];
        const optimized = system.optimizeRoute(itinerary);

        expect(optimized).toEqual(['Start', 'Near', 'Far']);
    });

    it('should handle small itineraries', () => {
        const itinerary = ['A', 'B'];
        expect(system.optimizeRoute(itinerary)).toEqual(['A', 'B']);
    });
});
