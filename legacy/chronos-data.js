/**
 * CHRONOS DATABASE
 * Classified Historical Reconnaissance & Operational Navigation Overlay System
 *
 * Contains temporal datasets for "Operation: CHRONOS".
 */

const chronosData = {
    ANTIQUITY: [
        {
            name: "Apollonia",
            lat: 40.7131,
            lng: 19.4716,
            type: "ruins",
            description: {
                en: "Ancient Greek trade colony founded in 588 BC. A vital stronghold in Caesar's civil war.",
                sq: "Koloni tregtare greke e lashtë e themeluar në 588 para Krishtit. Një bastion jetik në luftën civile të Cezarit."
            }
        },
        {
            name: "Via Egnatia (Durrës Start)",
            lat: 41.3246,
            lng: 19.4565,
            type: "logistics",
            description: {
                en: "Starting point of the ancient Roman road connecting Rome to Constantinople.",
                sq: "Pika fillestare e rrugës së lashtë romake që lidh Romën me Kostandinopojën."
            }
        },
        {
            name: "Amantia",
            lat: 40.3786,
            lng: 19.6958,
            type: "ruins",
            description: {
                en: "Illyrian city with a well-preserved stadium and temple ruins.",
                sq: "Qytet ilir me një stadium dhe rrënoja tempujsh të ruajtura mirë."
            }
        }
    ],
    MEDIEVAL: [
        {
            name: "Krujë Castle",
            lat: 41.5080,
            lng: 19.7933,
            type: "fortress",
            description: {
                en: "Stronghold of Skanderbeg during his rebellion against the Ottoman Empire (1443-1468).",
                sq: "Bastioni i Skënderbeut gjatë rebelimit të tij kundër Perandorisë Osmane (1443-1468)."
            }
        },
        {
            name: "Lezhë Memorial",
            lat: 41.7801,
            lng: 19.6426,
            type: "political",
            description: {
                en: "Site of the League of Lezhë (1444), uniting Albanian princes against the Ottomans.",
                sq: "Vendi i Lidhjes së Lezhës (1444), duke bashkuar princat shqiptarë kundër osmanëve."
            }
        },
        {
            name: "Berat Citadel",
            lat: 40.7077,
            lng: 19.9503,
            type: "fortress",
            description: {
                en: "Fortified city continuously inhabited since antiquity, heavily developed in the 13th century.",
                sq: "Qytet i fortifikuar i banuar vazhdimisht që nga lashtësia, i zhvilluar shumë në shekullin e 13-të."
            }
        }
    ],
    COLD_WAR: [
        {
            name: "Bunk'Art 1 (Tirana)",
            lat: 41.3516,
            lng: 19.8601,
            type: "bunker",
            description: {
                en: "Massive atomic bunker built for Enver Hoxha and the general staff.",
                sq: "Bunker atomik masiv i ndërtuar për Enver Hoxhën dhe shtabin e përgjithshëm."
            }
        },
        {
            name: "Porto Palermo Submarine Base",
            lat: 40.0625,
            lng: 19.7923,
            type: "military",
            description: {
                en: "Secret tunnel for submarines, part of the naval defense strategy.",
                sq: "Tunel sekret për nëndetëset, pjesë e strategjisë së mbrojtjes detare."
            }
        },
        {
            name: "Spaç Prison",
            lat: 41.8986,
            lng: 20.0464,
            type: "prison",
            description: {
                en: "Notorious labor camp for political prisoners, symbol of regime oppression.",
                sq: "Kamp famëkeq i punës për të burgosurit politikë, simbol i shtypjes së regjimit."
            }
        },
        {
            name: "Gjadër Air Base",
            lat: 41.8897,
            lng: 19.5983,
            type: "military",
            description: {
                en: "Underground air base built into the mountain to protect jets from airstrikes.",
                sq: "Bazë ajrore nëntokësore e ndërtuar në mal për të mbrojtur avionët nga sulmet ajrore."
            }
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { chronosData };
}
