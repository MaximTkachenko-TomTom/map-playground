// Diamond Markers - Region definitions and rendering
// This module handles all diamond-related functionality using image-based markers

// Define three regions with their coordinates and colors
const regions = [
    {
        name: "Brazil",
        color: "#2e7d32",
        outlineColor: "#1b5e20",
        center: [-51.9253, -15.7975], // São Paulo area
    },
    {
        name: "Mexico",
        color: "#f57c00",
        outlineColor: "#e65100",
        center: [-101.5037, 19.4326], // Mexico City area
    },
    {
        name: "Canada",
        color: "#1565c0",
        outlineColor: "#0d47a1",
        center: [-106.3468, 56.1304], // Alberta area
    },
];

// Define hardcoded diamond points for each region
const brazilDiamondPoints = [];

const mexicoDiamondPoints = [];

const canadaDiamondPoints = [
    { lat: 53.646622, lng: -113.482579 },
    { lat: 53.646632, lng: -113.48167 },
    { lat: 53.646638, lng: -113.481021 },
    { lat: 53.646641, lng: -113.480366 },
    { lat: 53.64666, lng: -113.480004 },
    { lat: 53.646687, lng: -113.479328 },
    { lat: 53.64669, lng: -113.478403 },
];

// Initialize diamonds on map load
function initializeDiamonds(map) {
    // Load diamond image and initialize map features
    loadImageToMap(DIAMOND_IMAGE_DATA_URL, "diamond-icon", map)
        .then(() => {
            // Create diamond markers for each region
            const allDiamonds = [];

            regions.forEach((region) => {
                let pointsToUse = [];
                if (region.name === "Brazil") {
                    pointsToUse = brazilDiamondPoints;
                } else if (region.name === "Mexico") {
                    pointsToUse = mexicoDiamondPoints;
                } else if (region.name === "Canada") {
                    pointsToUse = canadaDiamondPoints;
                }

                pointsToUse.forEach((point) => {
                    allDiamonds.push({
                        type: "Feature",
                        properties: {
                            region: region.name,
                            color: region.color,
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [point.lng, point.lat],
                        },
                    });
                });
            });

            // Add diamond source and layer to map
            addDiamondSource(map, allDiamonds);
            addDiamondLayer(map);

            // Setup location click handlers
            setupLocationClickHandlers(map);
        })
        .catch((error) => {
            console.error("Failed to initialize diamonds:", error);
        });
}

// Add diamond source to map
function addDiamondSource(map, allDiamonds) {
    map.addSource("diamonds", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: allDiamonds,
        },
    });
}

// Add diamond layer to map
function addDiamondLayer(map) {
    map.addLayer({
        id: "diamonds",
        type: "symbol",
        source: "diamonds",
        layout: {
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                3,
                0.1,
                5,
                0.15,
                7,
                0.2,
                10,
                0.3,
                12,
                0.4,
                13,
                0.5,
                14,
                0.6,
                15,
                0.8,
                16,
                1,
                17,
                1.2,
                18,
                1.5,
                20,
                2,
            ],
            "icon-allow-overlap": true,
        },
    });
}

// Setup location click handlers for zooming to regions
function setupLocationClickHandlers(map) {
    const locationClicks = {
        brazil: { center: [-51.9253, -15.7975], zoom: 14 },
        mexico: { center: [-101.5037, 19.4326], zoom: 14 },
        canada: { center: [-113.481, 53.6467], zoom: 19 },
    };

    const elements = document.querySelectorAll(".location-info");

    elements.forEach((element) => {
        element.addEventListener("click", () => {
            const region = element.dataset.region;
            const target = locationClicks[region];
            if (target) {
                map.flyTo({
                    center: target.center,
                    zoom: target.zoom,
                    duration: 1500,
                });
            }
        });
    });
}
