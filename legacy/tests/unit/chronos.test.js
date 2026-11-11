import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChronosSystem } from '../../chronos.js';

describe('ChronosSystem', () => {
    let chronos;
    let mockMap;
    let mockAppState;

    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = `
            <div class="ui-controls"></div>
        `;
        document.body.classList.remove('chronos-active', 'era-antiquity', 'era-medieval', 'era-coldwar');

        // Mock Globals
        global.showToast = vi.fn();
        global.translations = {
            en: {
                // Mock translations needed
            }
        };

        // Mock Data
        global.chronosData = {
            ANTIQUITY: [{ name: 'Test Ancient', lat: 1, lng: 1, description: { en: 'Test' } }],
            MEDIEVAL: [{ name: 'Test Medieval', lat: 2, lng: 2, description: { en: 'Test' } }],
            COLD_WAR: []
        };

        // Mock Leaflet
        const mockMarker = {
            addTo: vi.fn().mockReturnThis(),
            bindPopup: vi.fn().mockReturnThis(),
            remove: vi.fn()
        };

        global.L = {
            marker: vi.fn(() => mockMarker),
            divIcon: vi.fn()
        };

        mockMap = {
            hasLayer: vi.fn(),
            removeLayer: vi.fn(),
            addLayer: vi.fn()
        };

        mockAppState = {
            language: 'en'
        };

        // Initialize System
        chronos = new ChronosSystem(mockMap, mockAppState);
    });

    it('should initialize UI correctly', () => {
        const btn = document.querySelector('.chronos-toggle');
        expect(btn).toBeTruthy();

        const panel = document.getElementById('chronosPanel');
        expect(panel).toBeTruthy();
    });

    it('should toggle activation state', () => {
        chronos.toggleSystem();
        expect(chronos.active).toBe(true);
        expect(document.body.classList.contains('chronos-active')).toBe(true);

        chronos.toggleSystem();
        expect(chronos.active).toBe(false);
        expect(document.body.classList.contains('chronos-active')).toBe(false);
    });

    it('should set era and update visuals', () => {
        chronos.active = true;
        chronos.setEra('ANTIQUITY');

        expect(chronos.currentEra).toBe('ANTIQUITY');
        expect(document.body.classList.contains('era-antiquity')).toBe(true);

        chronos.setEra('MEDIEVAL');
        expect(document.body.classList.contains('era-antiquity')).toBe(false);
        expect(document.body.classList.contains('era-medieval')).toBe(true);
    });

    it('should spawn historical markers', () => {
        chronos.active = true;
        chronos.setEra('ANTIQUITY');

        expect(global.L.marker).toHaveBeenCalled();
        expect(chronos.historicalMarkers.length).toBe(1);
    });

    it('should clear markers when switching to PRESENT', () => {
        chronos.active = true;
        chronos.setEra('ANTIQUITY');
        expect(chronos.historicalMarkers.length).toBe(1);

        chronos.setEra('PRESENT');
        expect(mockMap.removeLayer).toHaveBeenCalled(); // Called to clear historical markers
        expect(chronos.historicalMarkers.length).toBe(0);
    });
});
