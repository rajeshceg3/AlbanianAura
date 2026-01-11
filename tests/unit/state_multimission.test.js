import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppState } from '../../state.js';

describe('AppState Multi-Mission', () => {
    let appState;

    beforeEach(() => {
        // Mock localStorage
        const store = {};
        const localStorageMock = {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value.toString(); },
            clear: () => { for (const key in store) delete store[key]; }
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        appState = new AppState();
    });

    it('should initialize with a default mission', () => {
        expect(appState.currentMissionId).toBeDefined();
        const missions = appState.getMissions();
        expect(Object.keys(missions).length).toBeGreaterThan(0);
        expect(appState.itinerary).toEqual([]);
    });

    it('should create a new mission', () => {
        const id = appState.createMission('Operation Beta');
        expect(id).toBeDefined();
        expect(appState.getMissions()[id].name).toBe('Operation Beta');
        // Should not switch automatically
        expect(appState.currentMissionId).not.toBe(id);
    });

    it('should switch missions', () => {
        const id = appState.createMission('Operation Beta');
        appState.switchMission(id);
        expect(appState.currentMissionId).toBe(id);

        // Add item to new mission
        appState.addToItinerary('Berat');
        expect(appState.itinerary).toEqual(['Berat']);

        // Switch back to default
        const defaultId = Object.keys(appState.getMissions())[0];
        if (defaultId === id) throw new Error("IDs should be different");

        appState.switchMission(defaultId);
        expect(appState.itinerary).toEqual([]);
    });

    it('should persist missions to localStorage', () => {
        const id = appState.createMission('Operation Gamma');
        appState.switchMission(id);
        appState.addToItinerary('Tirana');

        // Simulate reload
        const newAppState = new AppState();
        expect(newAppState.getMissions()[id]).toBeDefined();
        // Should default to last active or default?
        // Let's say we persist active mission ID too.
        expect(newAppState.currentMissionId).toBe(id);
        expect(newAppState.itinerary).toEqual(['Tirana']);
    });
});
