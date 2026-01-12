/**
 * RiskAnalysisSystem - Global Threat Assessment & Environmental Simulation
 * "Operation: STORM WATCH"
 *
 * Aggregates data from CrowdIntel, Weather, and Traffic simulations to provide
 * a unified Risk Score for mission segments.
 */
class RiskAnalysisSystem {
    constructor(crowdIntelSystem) {
        this.crowdIntelSystem = crowdIntelSystem;
        this.weatherStates = ['CLEAR', 'CLOUDY', 'RAIN', 'FOG', 'STORM'];
        this.currentWeather = 'CLEAR';
        this.trafficLevels = ['LOW', 'MODERATE', 'HEAVY', 'GRIDLOCK'];

        // Simulation Parameters
        this.weatherImpact = {
            'CLEAR': 0.0,
            'CLOUDY': 0.1,
            'RAIN': 0.3,
            'FOG': 0.5,
            'STORM': 0.8
        };

        this.trafficImpact = {
            'LOW': 0.0,
            'MODERATE': 0.2,
            'HEAVY': 0.5,
            'GRIDLOCK': 0.9
        };

        // Initialize random weather
        this.simulateWeather();

        // Auto-update weather every few minutes (simulated)
        this.weatherInterval = setInterval(() => this.simulateWeather(), 300000); // 5 mins
    }

    destroy() {
        if (this.weatherInterval) {
            clearInterval(this.weatherInterval);
            this.weatherInterval = null;
        }
    }

    /**
     * Simulates a weather change based on a Markov-like chain (simplified).
     */
    simulateWeather() {
        const rand = Math.random();
        if (rand < 0.6) this.currentWeather = 'CLEAR';
        else if (rand < 0.8) this.currentWeather = 'CLOUDY';
        else if (rand < 0.9) this.currentWeather = 'RAIN';
        else if (rand < 0.95) this.currentWeather = 'FOG';
        else this.currentWeather = 'STORM';

        console.log(`[STRATCOM] Weather Update: ${this.currentWeather}`);
        // Dispatch event if we had an event bus, for now we rely on polling/redraws
    }

    /**
     * Calculates the risk for a specific travel segment.
     * @param {Object} from - Attraction object (start)
     * @param {Object} to - Attraction object (end)
     * @param {number} time - Hour of day (0-23)
     * @returns {number} Risk Score (0.0 - 1.0)
     */
    calculateSegmentRisk(from, to, time) {
        // 1. Environmental Risk (Weather)
        const weatherRisk = this.weatherImpact[this.currentWeather];

        // 2. Intelligence Risk (Crowd Density at destination)
        // We use the destination's crowd density as a proxy for "Area Threat"
        let crowdRisk = 0.2; // Base
        if (this.crowdIntelSystem && to) {
            // Temporarily set hour on crowd intel to check specific time, or use calculateDensity logic directly
            // For statelessness, we replicate logic or assume CrowdIntel has a helper
            // We'll reuse the logic directly here to avoid side effects on the system's current time
            crowdRisk = this._calculateDensityAtTime(to, time);
        }

        // 3. Logistics Risk (Traffic - Simulated based on time and location type)
        // Cities have higher traffic risk during peak hours (08-09, 16-18)
        let trafficRisk = 0.1;
        if (to && to.type === 'city') {
            if ((time >= 8 && time <= 9) || (time >= 16 && time <= 18)) {
                trafficRisk = this.trafficImpact['HEAVY'];
            } else {
                trafficRisk = this.trafficImpact['MODERATE'];
            }
        }

        // Weighted Sum
        // Weather: 30%, Crowd: 40%, Traffic: 30%
        const totalRisk = (weatherRisk * 0.3) + (crowdRisk * 0.4) + (trafficRisk * 0.3);

        return Math.min(1.0, Math.max(0.0, totalRisk));
    }

    /**
     * Helper to calc density for a specific time without changing global state.
     */
    _calculateDensityAtTime(attraction, hour) {
        if (!attraction.crowdStats) return 0.2;
        const { maxDensity, peakHour } = attraction.crowdStats;
        const diff = Math.abs(hour - peakHour);
        const decay = Math.exp(-(diff * diff) / (2 * 3 * 3));
        return maxDensity * decay;
    }

    /**
     * Returns a color code for a given risk score.
     */
    getRiskColor(score) {
        if (score < 0.3) return '#00ffcc'; // Green/Cyan (Safe)
        if (score < 0.5) return '#ccff00'; // Lime
        if (score < 0.7) return '#ffcc00'; // Yellow
        if (score < 0.85) return '#ff6600'; // Orange
        return '#ff3333'; // Red (Critical)
    }

    getThreatLevel() {
        if (this.currentWeather === 'STORM') return 'DEFCON 2';
        if (this.currentWeather === 'FOG') return 'DEFCON 3';
        return 'DEFCON 4'; // Normal ops
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiskAnalysisSystem };
}
