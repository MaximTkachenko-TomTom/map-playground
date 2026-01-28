// Diamond Markers - Region definitions and rendering
// This module handles all diamond-related functionality using symbol layer with line placement

// Constants for width coefficient calculation
const DEGREE_TO_RADIAN = Math.PI / 180;
const EARTH_EQUATOR_IN_METERS = 40075016.686;
const IDEAL_TILE_SIZE_IN_PIXELS = 512;

// Compute Mercator scale factor based on latitude
function computeMercatorScaleFactor(latitude) {
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

const canadaDiamondPoints2 = [
    { lat: 53.648043, lng: -113.491033 },
    { lat: 53.648236, lng: -113.490929 },
    { lat: 53.648374, lng: -113.490736 },
    { lat: 53.648487, lng: -113.490462 },
    { lat: 53.648563, lng: -113.490162 },
    { lat: 53.648595, lng: -113.489826 },
    { lat: 53.648581, lng: -113.48944 },
    { lat: 53.648506, lng: -113.489145 },
    { lat: 53.648388, lng: -113.488896 },
    { lat: 53.648245, lng: -113.488697 },
    { lat: 53.648091, lng: -113.488595 },
    { lat: 53.647942, lng: -113.488563 },
    { lat: 53.647776, lng: -113.488584 },
    { lat: 53.647624, lng: -113.488697 },
    { lat: 53.64749, lng: -113.488861 },
    { lat: 53.647376, lng: -113.489099 },
    { lat: 53.647312, lng: -113.489335 },
    { lat: 53.647277, lng: -113.489698 },
    { lat: 53.647269, lng: -113.490006 },
    { lat: 53.647264, lng: -113.490344 },
    { lat: 53.647261, lng: -113.490634 },
    { lat: 53.647261, lng: -113.490947 },
];

// Calculate bearing (angle in degrees) between two points
function calculateBearing(point1, point2) {
    const lat1 = point1.lat * DEGREE_TO_RADIAN;
    const lat2 = point2.lat * DEGREE_TO_RADIAN;
    const dLng = (point2.lng - point1.lng) * DEGREE_TO_RADIAN;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360;
}

// Create GeoJSON points from diamond coordinates
function createDiamondPoints(pointsArray, region) {
    const features = pointsArray.map((point, index) => {
        let bearing = 0;

        // Calculate bearing to next point if available, otherwise use bearing from previous point
        if (index < pointsArray.length - 1) {
            bearing = calculateBearing(point, pointsArray[index + 1]);
        } else if (index > 0) {
            bearing = calculateBearing(pointsArray[index - 1], point);
        }

        return {
            type: "Feature",
            properties: {
                region: region,
                mercator_scale_factor: computeMercatorScaleFactor(point.lat),
                bearing: bearing,
            },
            geometry: {
                type: "Point",
                coordinates: [point.lng, point.lat],
            },
        };
    });

    return {
        type: "FeatureCollection",
        features: features,
    };
}

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

            // Create line and symbol representations for canadaDiamondPoints2
            const canadaPoints2Line = createDiamondLine(canadaDiamondPoints2, "Canada");
            const canadaPoints2Symbols = createDiamondPoints(canadaDiamondPoints2, "Canada");

            // Add both sources
            addCanadaLineSource(map, canadaPoints2Line);
            addCanadaSymbolSource(map, canadaPoints2Symbols);

            // Add both layers
            addCanadaLineLayer(map);
            addCanadaSymbolLayer(map);

            // Setup toggle for Canada diamond rendering modes
            setupDiamondModeToggle(map);

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

// Add Canada line source
function addCanadaLineSource(map, canadaLine) {
    map.addSource("canada-line", {
        type: "geojson",
        data: canadaLine,
    });
}

// Add Canada symbol source
function addCanadaSymbolSource(map, canadaSymbols) {
    map.addSource("canada-symbols", {
        type: "geojson",
        data: canadaSymbols,
    });
}

// Add diamond points source to map (deprecated - kept for reference)
function addDiamondPointsSource(map, diamondPoints) {
    map.addSource("diamonds-points", {
        type: "geojson",
        data: diamondPoints,
    });
}

// Add diamond symbol layer with line placement for orientation
function addDiamondLayer(map) {
    map.addLayer({
        id: "diamonds",
        type: "symbol",
        source: "diamonds",
        minzoom: 17,
        layout: {
            "symbol-placement": "line",
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                15,
                ["*", 32768, ["get", "mercator_scale_factor"], 0.03],
                22,
                ["*", 4.1943e6, ["get", "mercator_scale_factor"], 0.03],
            ],
            "icon-rotate": 90,
            "icon-rotation-alignment": "map",
            "symbol-spacing": 400,
            "icon-allow-overlap": false,
        },
    });
}

// Create GeoJSON line from diamond points
function createDiamondLine(pointsArray, region) {
    if (pointsArray.length < 2) {
        return { type: "FeatureCollection", features: [] };
    }

    const widthCoefficient = computeMercatorScaleFactor(pointsArray[0].lat);

    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    region: region,
                    mercator_scale_factor: widthCoefficient,
                },
                geometry: {
                    type: "LineString",
                    coordinates: pointsArray.map((p) => [p.lng, p.lat]),
                },
            },
        ],
    };
}

// Add Canada line layer
function addCanadaLineLayer(map) {
    map.addLayer({
        id: "canada-line",
        type: "symbol",
        source: "canada-line",
        minzoom: 17,
        layout: {
            "symbol-placement": "line",
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                15,
                ["*", 32768, ["get", "mercator_scale_factor"], 0.03],
                22,
                ["*", 4.1943e6, ["get", "mercator_scale_factor"], 0.03],
            ],
            "icon-rotate": 90,
            "icon-rotation-alignment": "map",
            "symbol-spacing": 400,
            "icon-allow-overlap": false,
        },
    });
}

// Add Canada symbol layer
function addCanadaSymbolLayer(map) {
    map.addLayer({
        id: "canada-symbols",
        type: "symbol",
        source: "canada-symbols",
        minzoom: 17,
        layout: {
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                15,
                ["*", 32768, ["get", "mercator_scale_factor"], 0.03],
                22,
                ["*", 4.1943e6, ["get", "mercator_scale_factor"], 0.03],
            ],
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": false,
        },
    });
}

// Add diamond points symbol layer (deprecated - kept for reference)
function addDiamondPointsLayer(map) {
    map.addLayer({
        id: "diamonds-points",
        type: "symbol",
        source: "diamonds-points",
        minzoom: 17,
        layout: {
            "icon-image": "diamond-icon",
            "icon-size": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                15,
                ["*", 32768, ["get", "mercator_scale_factor"], 0.03],
                22,
                ["*", 4.1943e6, ["get", "mercator_scale_factor"], 0.03],
            ],
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": false,
        },
    });
}

// Create GeoJSON lines connecting diamonds within each region
function createDiamondLines() {
    const features = [];

    // Connect Brazil diamonds
    if (brazilDiamondPoints.length > 1) {
        const widthCoefficient = computeMercatorScaleFactor(brazilDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Brazil", mercator_scale_factor: widthCoefficient },
            geometry: {
                type: "LineString",
                coordinates: brazilDiamondPoints.map((p) => [p.lng, p.lat]),
            },
        });
    }

    // Connect Canada diamonds
    if (canadaDiamondPoints.length > 1) {
        const widthCoefficient = computeMercatorScaleFactor(canadaDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Canada", mercator_scale_factor: widthCoefficient },
            geometry: {
                type: "LineString",
                coordinates: canadaDiamondPoints.map((p) => [p.lng, p.lat]),
            },
        });
    }

    // Connect Mexico diamonds when available
    if (mexicoDiamondPoints.length > 1) {
        const widthCoefficient = computeMercatorScaleFactor(mexicoDiamondPoints[0].lat);
        features.push({
            type: "Feature",
            properties: { region: "Mexico", mercator_scale_factor: widthCoefficient },
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

// Setup toggle for diamond rendering modes
function setupDiamondModeToggle(map) {
    const modeSwitch = document.getElementById("diamond-mode-switch");

    if (!modeSwitch) return;

    modeSwitch.addEventListener("change", (e) => {
        if (e.target.checked) {
            // Checked = Symbol mode
            map.setLayoutProperty("canada-line", "visibility", "none");
            map.setLayoutProperty("canada-symbols", "visibility", "visible");
        } else {
            // Unchecked = Line mode
            map.setLayoutProperty("canada-line", "visibility", "visible");
            map.setLayoutProperty("canada-symbols", "visibility", "none");
        }
    });

    // Initialize with line mode visible (unchecked)
    modeSwitch.checked = false;
    map.setLayoutProperty("canada-line", "visibility", "visible");
    map.setLayoutProperty("canada-symbols", "visibility", "none");
}

// Setup location click handlers for zooming to regions
function setupLocationClickHandlers(map) {
    const locationClicks = {
        brazil: { center: [-47.938, -15.779], zoom: 19 },
        mexico: { center: [-101.5037, 19.4326], zoom: 14 },
        canada: { center: [-113.489909, 53.647888], zoom: 18 },
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
