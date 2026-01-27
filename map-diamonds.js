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
const brazilDiamondPoints = [
    { lat: -15.780698, lng: -47.939108 },
    { lat: -15.780099, lng: -47.938894 },
    { lat: -15.779462, lng: -47.938682 },
    { lat: -15.778987, lng: -47.938467 },
    { lat: -15.778471, lng: -47.938025 },
    { lat: -15.77821, lng: -47.937569 },
    { lat: -15.77806, lng: -47.937137 },
    { lat: -15.778014, lng: -47.93656 },
];

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
                0.0125,
                5,
                0.01875,
                7,
                0.025,
                10,
                0.0375,
                12,
                0.05,
                13,
                0.0625,
                14,
                0.075,
                15,
                0.1,
                16,
                0.125,
                17,
                0.15,
                18,
                0.1875,
                20,
                0.25,
            ],
            "icon-allow-overlap": true,
        },
    });
}

// Setup location click handlers for zooming to regions
function setupLocationClickHandlers(map) {
    const locationClicks = {
        brazil: { center: [-47.938, -15.779], zoom: 19 },
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
