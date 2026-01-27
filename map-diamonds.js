// Diamond Markers - Region definitions and rendering
// This module handles all diamond-related functionality using symbol layer with line placement

// Constants for width coefficient calculation
const DEGREE_TO_RADIAN = Math.PI / 180;
const EARTH_EQUATOR_IN_METERS = 40075016.686;
const IDEAL_TILE_SIZE_IN_PIXELS = 256;

// Compute width coefficient based on latitude
function computeWidthCoefficient(latitude) {
    const latitudeRadian = latitude * DEGREE_TO_RADIAN;
    let cosLatitude = Math.cos(latitudeRadian);

    // Avoid division by zero at poles
    if (Math.abs(cosLatitude) < 1e-10) {
        cosLatitude = 1e-10;
    }

    return IDEAL_TILE_SIZE_IN_PIXELS / (EARTH_EQUATOR_IN_METERS * cosLatitude);
}

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
    // Load diamond image and use it as symbol icon
    loadImageToMap(DIAMOND_IMAGE_DATA_URL, "diamond-icon", map)
        .then(() => {
            // Create diamond lines
            const diamondLines = createDiamondLines();

            // Add diamond lines source
            addDiamondSource(map, diamondLines);

            // Add diamond symbol layer with line placement
            addDiamondLayer(map);

            // Setup location click handlers
            setupLocationClickHandlers(map);
        })
        .catch((error) => {
            console.error("Failed to initialize diamonds:", error);
        });
}

// Add diamond source to map
function addDiamondSource(map, diamondLines) {
    map.addSource("diamonds", {
        type: "geojson",
        data: diamondLines,
    });
}

// Add diamond symbol layer with line placement for orientation
function addDiamondLayer(map) {
    map.addLayer({
        id: "diamonds",
        type: "symbol",
        source: "diamonds",
        layout: {
            "symbol-placement": "line",
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                15,
                ["*", 32768, ["get", "width_coefficient"], 0.06],
                22,
                ["*", 4.1943e6, ["get", "width_coefficient"], 0.06],
            ],
            "icon-rotate": 90,
            "icon-rotation-alignment": "map",
            "symbol-spacing": 100,
            "icon-allow-overlap": true,
        },
    });
}

// Create GeoJSON lines connecting diamonds within each region
function createDiamondLines() {
    const features = [];

    // Connect Brazil diamonds
    if (brazilDiamondPoints.length > 1) {
        const widthCoefficient = computeWidthCoefficient(brazilDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Brazil", width_coefficient: widthCoefficient },
            geometry: {
                type: "LineString",
                coordinates: brazilDiamondPoints.map((p) => [p.lng, p.lat]),
            },
        });
    }

    // Connect Canada diamonds
    if (canadaDiamondPoints.length > 1) {
        const widthCoefficient = computeWidthCoefficient(canadaDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Canada", width_coefficient: widthCoefficient },
            geometry: {
                type: "LineString",
                coordinates: canadaDiamondPoints.map((p) => [p.lng, p.lat]),
            },
        });
    }

    // Connect Mexico diamonds when available
    if (mexicoDiamondPoints.length > 1) {
        const widthCoefficient = computeWidthCoefficient(mexicoDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Mexico", width_coefficient: widthCoefficient },
            geometry: {
                type: "LineString",
                coordinates: mexicoDiamondPoints.map((p) => [p.lng, p.lat]),
            },
        });
    }

    return {
        type: "FeatureCollection",
        features: features,
    };
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
