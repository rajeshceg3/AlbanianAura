import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrbitalSystem } from '../../orbital-surveillance.js';

// Mocks
const mockMap = {
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    mouseEventToContainerPoint: vi.fn(),
    containerPointToLatLng: vi.fn(),
    getBounds: vi.fn(() => ({
        getNorth: () => 43,
        getSouth: () => 39,
        getEast: () => 21,
        getWest: () => 19
    }))
};

const mockAppState = {
    language: 'en'
};

// Mock Leaflet globals
global.L = {
    divIcon: vi.fn(() => ({})),
    marker: vi.fn(() => ({
        addTo: vi.fn(function() { return this; }), // Chainable
        setLatLng: vi.fn(),
        getLatLng: vi.fn(() => ({ lat: 40, lng: 20 }))
    })),
    polygon: vi.fn(() => ({
        addTo: vi.fn(function() { return this; }), // Chainable
        setLatLngs: vi.fn()
    })),
    latLng: vi.fn((lat, lng) => ({ lat, lng }))
};

global.translations = {
    en: { satRetasking: "SATELLITE RE-TASKING..." }
};

global.showToast = vi.fn();
global.requestAnimationFrame = vi.fn((cb) => {
    return 1;
});
global.cancelAnimationFrame = vi.fn();

describe('OrbitalSystem', () => {
    let orbitalSystem;

    beforeEach(() => {
        vi.clearAllMocks();
        orbitalSystem = new OrbitalSystem(mockMap, mockAppState);
    });

    it('should initialize with default values', () => {
        expect(orbitalSystem.isActive).toBe(false);
        expect(orbitalSystem.currentOrbitProgress).toBe(0);
    });

    it('should start orbit when toggled on', () => {
        orbitalSystem.toggleSystem(true);
        expect(orbitalSystem.isActive).toBe(true);
        expect(global.L.marker).toHaveBeenCalled();
        expect(global.L.polygon).toHaveBeenCalled();
        expect(document.body.classList.contains('satellite-view')).toBe(true);
    });

    it('should stop orbit when toggled off', () => {
        orbitalSystem.toggleSystem(true);

        // Ensure markers are set
        expect(orbitalSystem.satelliteMarker).toBeTruthy();
        expect(orbitalSystem.swathPolygon).toBeTruthy();

        orbitalSystem.toggleSystem(false);

        expect(orbitalSystem.isActive).toBe(false);
        expect(mockMap.removeLayer).toHaveBeenCalledTimes(2);
        expect(document.body.classList.contains('satellite-view')).toBe(false);
    });

    it('should calculate position based on progress', () => {
        const posStart = orbitalSystem.calculatePosition(0);
        const posMid = orbitalSystem.calculatePosition(0.5);
        const posEnd = orbitalSystem.calculatePosition(1);

        expect(posStart[0]).toBeCloseTo(orbitalSystem.orbitParams.minLat);
        expect(posEnd[0]).toBeCloseTo(orbitalSystem.orbitParams.maxLat);
        expect(posMid[0]).toBeCloseTo((orbitalSystem.orbitParams.minLat + orbitalSystem.orbitParams.maxLat) / 2);
    });

    it('should check visibility correctly', () => {
        orbitalSystem.toggleSystem(true);

        // Mock the marker position
        // We need to overwrite the getLatLng on the instance's satelliteMarker property
        // The mock above returns a NEW object every time L.marker is called.
        // We need to make sure we are modifying the one the class is using.

        // Because of how we mocked L.marker, orbitalSystem.satelliteMarker is the object returned by the factory.
        // We can just mock the method on it.
        orbitalSystem.satelliteMarker.getLatLng = vi.fn(() => ({ lat: 40, lng: 20 }));

        // Point close by (within swathWidth 0.4 lng, 0.3 lat)
        const isVisible = orbitalSystem.checkVisibility(40.1, 20.1);
        expect(isVisible).toBe(true);

        // Point far away
        const isNotVisible = orbitalSystem.checkVisibility(42, 21);
        expect(isNotVisible).toBe(false);
    });

    it('should retask satellite correctly', () => {
        orbitalSystem.toggleSystem(true);

        const targetLat = orbitalSystem.orbitParams.maxLat;
        orbitalSystem.taskSatellite(targetLat, 20);

        const expectedProgress = 1.0 - 0.1; // MaxLat corresponds to progress 1, minus preRoll 0.1

        expect(orbitalSystem.currentOrbitProgress).toBeCloseTo(expectedProgress, 2);
        expect(global.showToast).toHaveBeenCalledWith("SATELLITE RE-TASKING...");
    });
});
