import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SigintSystem } from '../../sigint.js';

// Mock Globals
global.L = {
    divIcon: () => ({}),
    marker: () => ({
        addTo: () => ({
            on: () => {}
        })
    }),
};

global.showToast = vi.fn();
global.trapFocus = vi.fn();
global.removeTrapFocus = vi.fn();
global.cancelAnimationFrame = vi.fn();
global.requestAnimationFrame = vi.fn(() => 123);
global.getComputedStyle = vi.fn(() => ({ getPropertyValue: () => '#ffffff' }));

// Mock openModal/closeModal
global.openModal = vi.fn((modal) => {
    modal.classList.add('active'); // Simulate script.js behavior
});
global.closeModal = vi.fn((modal) => {
    modal.classList.remove('active'); // Simulate script.js behavior
});

describe('SigintSystem', () => {
    let sigintSystem;
    let mockMap;
    let mockAppState;
    let mockAttractions;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="sigintModal" style="display: none;">
                <h3 id="sigintTitle"></h3>
                <div id="sigintContent"></div>
                <button id="closeSigintModal"></button>
            </div>
        `;
        document.body.classList.add = vi.fn();
        document.body.classList.remove = vi.fn();

        // Mock Map
        mockMap = {
            removeLayer: vi.fn(),
            addLayer: vi.fn(),
            on: vi.fn()
        };

        // Mock AppState
        mockAppState = {
            unlockedSignals: [],
            unlockSignal: vi.fn(),
            language: 'en'
        };

        mockAttractions = [
            { name: 'Target Alpha', lat: 41, lng: 20, sigint: { frequency: 100, encryption: 3, intel: { en: 'Secret' } } }
        ];

        sigintSystem = new SigintSystem(mockMap, mockAppState, mockAttractions);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should toggle system on and render signals', () => {
        sigintSystem.toggleSystem(true);
        expect(sigintSystem.isActive).toBe(true);
        expect(document.body.classList.add).toHaveBeenCalledWith('sigint-active');
    });

    it('should toggle system off and clear signals', () => {
        sigintSystem.signalLayers = ['layer1', 'layer2'];
        sigintSystem.toggleSystem(false);
        expect(sigintSystem.isActive).toBe(false);
        expect(document.body.classList.remove).toHaveBeenCalledWith('sigint-active');
        expect(mockMap.removeLayer).toHaveBeenCalledTimes(2);
    });

    it('should open decryption terminal using openModal', () => {
        const attraction = mockAttractions[0];

        // Mock canvas context
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            fillStyle: '',
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn()
        }));

        sigintSystem.openDecryptionTerminal(attraction);

        const modal = document.getElementById('sigintModal');

        // Should call global openModal
        expect(global.openModal).toHaveBeenCalledWith(modal);
        expect(modal.classList.contains('active')).toBe(true); // Because our mock adds it

        // Should start animation loop
        expect(global.requestAnimationFrame).toHaveBeenCalled();

        // Should NOT call trapFocus directly (as openModal handles it)
        expect(global.trapFocus).not.toHaveBeenCalled();
    });

    it('should stop decryption when system is toggled off', () => {
        // Start something
        sigintSystem.animationFrame = 999;

        sigintSystem.toggleSystem(false);

        expect(global.cancelAnimationFrame).toHaveBeenCalledWith(999);
        expect(sigintSystem.animationFrame).toBeNull();
    });
});
