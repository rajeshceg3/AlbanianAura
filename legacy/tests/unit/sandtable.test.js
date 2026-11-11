
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiskAnalysisSystem } from '../../risk-analysis.js';

// Mock Leaflet and dependencies
global.L = {
    layerGroup: () => ({ addTo: () => ({}), removeLayer: () => ({}) }),
    divIcon: () => ({}),
    marker: () => ({ addTo: () => ({ on: () => {} }) }),
    circle: () => ({ addTo: () => ({ setLatLng: () => {} }) }),
    latLng: (lat, lng) => ({
        lat, lng,
        distanceTo: () => 0 // Mock distance
    })
};

global.document = {
    createElement: () => ({
        classList: { toggle: () => {} },
        querySelectorAll: () => [],
        addEventListener: () => {},
        appendChild: () => {}
    }),
    body: {
        classList: { toggle: () => {} },
        appendChild: () => {}
    },
    getElementById: () => ({
        addEventListener: () => {},
        classList: { toggle: () => {} }
    }),
    querySelector: () => ({
        appendChild: () => {}
    })
};

global.window = {
    dispatchEvent: () => {}
};

// Mock SandtableSystem (since we can't import it easily without module exports or reading file)
// We will manually replicate the logic or mock the class behavior expected by RiskAnalysis
// But for a true integration test of logic, we should test the RiskAnalysis integration logic specifically.

describe('RiskAnalysisSystem with Sandtable Integration', () => {
    let riskSystem;
    let mockSandtable;

    beforeEach(() => {
        const mockCrowdIntel = { active: false };
        riskSystem = new RiskAnalysisSystem(mockCrowdIntel);

        mockSandtable = {
            getRiskModifier: vi.fn()
        };
    });

    it('should calculate base risk correctly without sandtable', () => {
        riskSystem.currentWeather = 'CLEAR'; // Risk 0.0
        // Crowd 0.2, Traffic 0.1 (default)
        // Total = (0 * 0.3) + (0.2 * 0.4) + (0.1 * 0.3) = 0.08 + 0.03 = 0.11
        const risk = riskSystem.calculateSegmentRisk(null, { type: 'nature' }, 12);
        expect(risk).toBeCloseTo(0.11, 2);
    });

    it('should add sandtable threat modifier to risk score', () => {
        riskSystem.setSandtableSystem(mockSandtable);
        mockSandtable.getRiskModifier.mockReturnValue(0.5); // Simulating a threat

        riskSystem.currentWeather = 'CLEAR';
        // Base 0.11 + 0.5 = 0.61
        const risk = riskSystem.calculateSegmentRisk(null, { type: 'nature', lat: 0, lng: 0 }, 12);
        expect(risk).toBeCloseTo(0.61, 2);
    });

    it('should reduce risk with sandtable safehouse modifier', () => {
        riskSystem.setSandtableSystem(mockSandtable);
        mockSandtable.getRiskModifier.mockReturnValue(-0.05); // Simulating a safehouse

        riskSystem.currentWeather = 'CLEAR';
        // Base 0.11 - 0.05 = 0.06
        const risk = riskSystem.calculateSegmentRisk(null, { type: 'nature', lat: 0, lng: 0 }, 12);
        expect(risk).toBeCloseTo(0.06, 2);
    });

    it('should clamp risk score between 0 and 1', () => {
        riskSystem.setSandtableSystem(mockSandtable);
        mockSandtable.getRiskModifier.mockReturnValue(10.0); // Massive threat

        const risk = riskSystem.calculateSegmentRisk(null, { type: 'nature', lat: 0, lng: 0 }, 12);
        expect(risk).toBe(1.0);
    });
});
