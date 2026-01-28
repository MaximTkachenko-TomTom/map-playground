// Diamond Markers - Region definitions and rendering
// This module handles all diamond-related functionality using symbol layer with line placement

// Define three regions with their coordinates and colors
const regions = [
    {
        name: "Brazil",
        color: "#2e7d32",
        outlineColor: "#1b5e20",
    },
    {
        name: "Mexico",
        color: "#f57c00",
        outlineColor: "#e65100",
    },
    {
        name: "Canada",
        color: "#1565c0",
        outlineColor: "#0d47a1",
    },
];

// Define hardcoded diamond points for each region
const brazilDiamondPoints = [
    { lat: -15.778334, lng: -47.938623 },
    { lat: -15.778133, lng: -47.938558 },
    { lat: -15.777898, lng: -47.938483 },
    { lat: -15.777689, lng: -47.938406 },
    { lat: -15.777567, lng: -47.938357 },
    { lat: -15.777446, lng: -47.938151 },
    { lat: -15.777405, lng: -47.937899 },
    { lat: -15.777464, lng: -47.937668 },
    { lat: -15.777529, lng: -47.937478 },
    { lat: -15.777591, lng: -47.937266 },
];

const mexicoDiamondPoints = [];

const canadaDiamondPoints = [
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

// Create GeoJSON points from diamond coordinates
function createDiamondPointsData(pointsArray, region) {
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
                mercator_scale_factor: calculateMercatorScaleFactor(point.lat),
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

// Create GeoJSON line from diamond points
function createDiamondLineData(pointsArray, region) {
    if (pointsArray.length < 2) {
        return { type: "FeatureCollection", features: [] };
    }

    const mercatorScaleFactor = calculateMercatorScaleFactor(pointsArray[0].lat);

    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    region: region,
                    mercator_scale_factor: mercatorScaleFactor,
                },
                geometry: {
                    type: "LineString",
                    coordinates: pointsArray.map((p) => [p.lng, p.lat]),
                },
            },
        ],
    };
}

// Initialize diamonds on map load
function initializeDiamonds(map) {
    // Load diamond image and use it as symbol icon
    loadImageToMap(DIAMOND_IMAGE_DATA_URL, "diamond-icon", map, 0.66)
        .then(() => {
            // Initialize Brazil diamonds
            const brazilPointsLine = createDiamondLineData(brazilDiamondPoints, "Brazil");
            const brazilPointsSymbols = createDiamondPointsData(brazilDiamondPoints, "Brazil");
            addDiamondSource(map, "brazil-line", brazilPointsLine);
            addDiamondSource(map, "brazil-symbols", brazilPointsSymbols);
            addDiamondLineLayer(map, "brazil-line");
            addDiamondSymbolLayer(map, "brazil-symbols");

            // Initialize Canada diamonds
            const canadaPointsLine = createDiamondLineData(canadaDiamondPoints, "Canada");
            const canadaPointsSymbols = createDiamondPointsData(canadaDiamondPoints, "Canada");
            addDiamondSource(map, "canada-line", canadaPointsLine);
            addDiamondSource(map, "canada-symbols", canadaPointsSymbols);
            addDiamondLineLayer(map, "canada-line");
            addDiamondSymbolLayer(map, "canada-symbols");

            // Setup toggle for diamond rendering modes
            setupDiamondModeToggle(map);

            // Setup location click handlers
            setupLocationClickHandlers(map);
        })
        .catch((error) => {
            console.error("Failed to initialize diamonds:", error);
        });
}

// Add diamond source to map
function addDiamondSource(map, sourceId, data) {
    map.addSource(sourceId, {
        type: "geojson",
        data: data,
    });
}

// Add diamond line layer (reusable for any region)
function addDiamondLineLayer(map, sourceId) {
    map.addLayer({
        id: sourceId,
        type: "symbol",
        source: sourceId,
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
            "symbol-spacing": 150,
            "icon-allow-overlap": false,
        },
    });
}

// Add diamond symbol layer (reusable for any region)
function addDiamondSymbolLayer(map, sourceId) {
    map.addLayer({
        id: sourceId,
        type: "symbol",
        source: sourceId,
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

// Setup toggle for diamond rendering modes
function setupDiamondModeToggle(map) {
    const modeSwitch = document.getElementById("diamond-mode-switch");

    if (!modeSwitch) return;

    modeSwitch.addEventListener("change", (e) => {
        const lineLayerIds = ["brazil-line", "canada-line"];
        const symbolLayerIds = ["brazil-symbols", "canada-symbols"];

        if (e.target.checked) {
            // Checked = Symbol mode
            lineLayerIds.forEach((id) => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, "visibility", "none");
                }
            });
            symbolLayerIds.forEach((id) => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, "visibility", "visible");
                }
            });
        } else {
            // Unchecked = Line mode
            lineLayerIds.forEach((id) => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, "visibility", "visible");
                }
            });
            symbolLayerIds.forEach((id) => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, "visibility", "none");
                }
            });
        }
    });

    // Initialize with line mode visible (unchecked)
    modeSwitch.checked = false;
    const lineLayerIds = ["brazil-line", "canada-line"];
    const symbolLayerIds = ["brazil-symbols", "canada-symbols"];
    lineLayerIds.forEach((id) => {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", "visible");
        }
    });
    symbolLayerIds.forEach((id) => {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", "none");
        }
    });
}

// Setup location click handlers for zooming to regions
function setupLocationClickHandlers(map) {
    const locationClicks = {
        brazil: { center: [-47.937845, -15.778195], zoom: 18 },
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
