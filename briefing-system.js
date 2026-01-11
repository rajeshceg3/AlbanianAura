/**
 * MissionBriefingSystem - Classified Dossier Generator
 * Generates a self-contained HTML briefing document for the mission.
 */
class MissionBriefingSystem {
    constructor(appState, attractions, riskSystem) {
        this.appState = appState;
        this.attractions = attractions;
        this.riskSystem = riskSystem;
    }

    /**
     * Generates and triggers download of the Mission Briefing HTML.
     */
    generateBriefing() {
        const itinerary = this.appState.itinerary;
        if (!itinerary || itinerary.length === 0) {
            console.warn("Cannot generate briefing: Empty itinerary");
            return;
        }

        const missionName = "OPERATION: " + (this.appState.currentMissionId ? this.appState.getMissions()[this.appState.currentMissionId].name.toUpperCase() : "ALPHA");
        const threatLevel = this.riskSystem ? this.riskSystem.getThreatLevel() : "UNKNOWN";
        const weather = this.riskSystem ? this.riskSystem.currentWeather : "UNKNOWN";

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MISSION DOSSIER: ${missionName}</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #f0f0f0; color: #333; padding: 40px; }
        .classified-stamp {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 10rem; color: rgba(255,0,0,0.1); border: 10px solid rgba(255,0,0,0.1); padding: 20px;
            pointer-events: none; z-index: 0; user-select: none;
        }
        .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; }
        .logo { font-size: 2rem; font-weight: bold; }
        .meta { text-align: right; }
        .section { margin-bottom: 30px; background: #fff; padding: 20px; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.05); position: relative; z-index: 1; }
        h2 { background: #333; color: #fff; padding: 10px; margin-top: 0; font-size: 1.2rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
        .risk-high { color: #d00; font-weight: bold; }
        .risk-med { color: #e90; }
        .risk-low { color: #090; }
        .intel-box { background: #eee; padding: 10px; margin-top: 5px; font-style: italic; border-left: 3px solid #666; }
        .footer { text-align: center; font-size: 0.8rem; color: #666; margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
        @media print {
            body { background: #fff; }
            .section { box-shadow: none; border: 1px solid #000; }
        }
    </style>
</head>
<body>
    <div class="classified-stamp">TOP SECRET</div>

    <div class="header">
        <div class="logo">S.T.R.A.T.C.O.M.<br><span style="font-size: 1rem;">ALBANIA DIVISION</span></div>
        <div class="meta">
            <strong>REF:</strong> ${Date.now().toString(36).toUpperCase()}<br>
            <strong>DATE:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>THREAT LEVEL:</strong> ${threatLevel}<br>
            <strong>WEATHER:</strong> ${weather}
        </div>
    </div>

    <h1>${missionName}</h1>

    <div class="section">
        <h2>MISSION SUMMARY</h2>
        <p><strong>OBJECTIVE:</strong> Execute reconnaissance and intelligence gathering across ${itinerary.length} designated sectors.</p>
        <p><strong>OPERATIONAL STATUS:</strong> APPROVED</p>
    </div>

    <div class="section">
        <h2>TACTICAL ITINERARY</h2>
        <table>
            <thead>
                <tr>
                    <th>SEQ</th>
                    <th>TARGET</th>
                    <th>COORDINATES</th>
                    <th>RISK ASSESSMENT</th>
                </tr>
            </thead>
            <tbody>
                ${this._generateTableRows(itinerary)}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>INTELLIGENCE ANNEX</h2>
        ${this._generateIntel(itinerary)}
    </div>

    <div class="footer">
        WARNING: THIS DOCUMENT CONTAINS CLASSIFIED INFORMATION. UNAUTHORIZED DISCLOSURE IS PUNISHABLE BY COURT MARTIAL.
        <br>DESTROY AFTER READING.
    </div>
</body>
</html>
        `;

        // Create Blob and Download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STRATCOM_DOSSIER_${Date.now()}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    _generateTableRows(itinerary) {
        return itinerary.map((name, index) => {
            const attr = this.attractions.find(a => a.name === name);
            // Calculate a static risk for the briefing (assuming mid-day operation)
            const risk = this.riskSystem ? this.riskSystem.calculateSegmentRisk(null, attr, 12) : 0.5;

            let riskClass = 'risk-low';
            let riskLabel = 'LOW';
            if (risk > 0.4) { riskClass = 'risk-med'; riskLabel = 'MODERATE'; }
            if (risk > 0.7) { riskClass = 'risk-high'; riskLabel = 'CRITICAL'; }

            return `
                <tr>
                    <td>${(index + 1).toString().padStart(2, '0')}</td>
                    <td><strong>${name.toUpperCase()}</strong></td>
                    <td>${attr.lat.toFixed(4)}, ${attr.lng.toFixed(4)}</td>
                    <td class="${riskClass}">${riskLabel} (${Math.round(risk * 100)}%)</td>
                </tr>
            `;
        }).join('');
    }

    _generateIntel(itinerary) {
        return itinerary.map(name => {
            const attr = this.attractions.find(a => a.name === name);
            const intel = attr.sigint && attr.sigint.intel ? attr.sigint.intel.en : "No signal intercepts available.";
            return `
                <div style="margin-bottom: 20px;">
                    <strong>TARGET: ${name}</strong>
                    <div class="intel-box">"${intel}"</div>
                </div>
            `;
        }).join('');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MissionBriefingSystem };
}
