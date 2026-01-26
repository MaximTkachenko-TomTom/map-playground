// Diamond Markers - Region definitions and rendering
// This module handles all diamond-related functionality

// Define three regions with their coordinates and colors
const regions = [
    {
        name: "Brazil",
        color: "#2e7d32",
        outlineColor: "#1b5e20",
        center: [-51.9253, -15.7975], // São Paulo area
        baseSize: 0.000015,
    },
    {
        name: "Mexico",
        color: "#f57c00",
        outlineColor: "#e65100",
        center: [-101.5037, 19.4326], // Mexico City area
        baseSize: 0.000015,
    },
    {
        name: "Canada",
        color: "#1565c0",
        outlineColor: "#0d47a1",
        center: [-106.3468, 56.1304], // Alberta area
        baseSize: 0.000015,
    },
];

// Define hardcoded diamond points for Canada
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
    // Create diamond points for each region
    const allDiamonds = [];

    regions.forEach((region) => {
        const diamondPoints = [];

        // Use hardcoded points for Canada, grid pattern for others
        if (region.name === "Canada") {
            canadaDiamondPoints.forEach((point) => {
                diamondPoints.push({
                    center: [point.lng, point.lat],
                    size: region.baseSize,
                    region: region.name,
                    color: region.color,
                    outlineColor: region.outlineColor,
                });
            });
        } else {
            // Grid pattern for Brazil and Mexico
            const spacing = 0.15;
            for (let row = 0; row < 2; row++) {
                for (let col = 0; col < 5; col++) {
                    const lng = region.center[0] + (col - 2) * spacing;
                    const lat = region.center[1] + (row - 0.5) * spacing;

                    diamondPoints.push({
                        center: [lng, lat],
                        size: region.baseSize,
                        region: region.name,
                        color: region.color,
                        outlineColor: region.outlineColor,
                    });
                }
            }
        }

        allDiamonds.push(...diamondPoints);
    });

    // Create diamond line segments
    const diamondLines = createDiamondLineSegments(allDiamonds);

    console.log("Total diamonds created:", allDiamonds.length);
    console.log("Total diamond line segments:", diamondLines.length);
    console.log("Sample diamond points:", allDiamonds.slice(0, 3));

    // Add diamond sources and layers to map
    addDiamondSources(map, diamondLines, allDiamonds);
    addDiamondLayers(map);

    // Setup location click handlers
    setupLocationClickHandlers(map);

    console.log("Map loaded with", diamondLines.length, "diamond line segments across 3 regions");
    console.log("Total diamonds:", allDiamonds.length);
}

// Create 4 line segments that form a diamond outline
function createDiamondLines(center, size) {
    const [lng, lat] = center;
    const top = [lng, lat + size];
    const right = [lng + size, lat];
    const bottom = [lng, lat - size];
    const left = [lng - size, lat];

    return [
        [top, right], // top-right edge
        [right, bottom], // right-bottom edge
        [bottom, left], // bottom-left edge
        [left, top], // left-top edge
    ];
}

// Create FeatureCollection with all diamond line segments
function createDiamondLineSegments(allDiamonds) {
    const diamondLines = [];

    allDiamonds.forEach((point, diamondIndex) => {
        const lines = createDiamondLines(point.center, point.size);
        lines.forEach((line, edgeIndex) => {
            diamondLines.push({
                type: "Feature",
                properties: {
                    diamondId: diamondIndex,
                    edgeId: edgeIndex,
                    region: point.region,
                    color: point.color,
                    outlineColor: point.outlineColor,
                },
                geometry: {
                    type: "LineString",
                    coordinates: line,
                },
            });
        });
    });

    return diamondLines;
}

// Add diamond sources to map
function addDiamondSources(map, diamondLines, allDiamonds) {
    // Add main diamonds source
    map.addSource("diamonds", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: diamondLines,
        },
    });

    console.log("Diamond source added to map");

    // Add circle markers at diamond centers for debugging
    const diamondCenters = allDiamonds.map((diamond) => ({
        type: "Feature",
        properties: {
            region: diamond.region,
        },
        geometry: {
            type: "Point",
            coordinates: diamond.center,
        },
    }));

    map.addSource("diamond-centers", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: diamondCenters,
        },
    });

    console.log("Diamond center markers added");
}

// Add diamond layers to map
function addDiamondLayers(map) {
    // Add colored diamonds layer
    map.addLayer({
        id: "diamonds",
        type: "line",
        source: "diamonds",
        paint: {
            "line-color": "#FF0000",
            "line-width": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                3,
                0.5,
                5,
                0.7,
                7,
                0.9,
                10,
                1,
                12,
                1.2,
                13,
                2,
                14,
                3,
                15,
                4,
                16,
                5,
                17,
                6,
                18,
                8,
                20,
                12,
            ],
        },
    });

    // Add circle markers layer
    map.addLayer({
        id: "diamond-centers",
        type: "circle",
        source: "diamond-centers",
        paint: {
            "circle-radius": 2,
            "circle-color": "#FF0000",
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 1,
        },
    });

    console.log("Diamond center layer added");

    // Add white outline layer for visibility
    map.addLayer({
        id: "diamonds-outline",
        type: "line",
        source: "diamonds",
        paint: {
            "line-color": "#FFFFFF",
            "line-width": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                3,
                0.25,
                5,
                0.35,
                7,
                0.45,
                10,
                0.5,
                12,
                0.6,
                13,
                1,
                14,
                1.5,
                15,
                2,
                16,
                2.5,
                17,
                3,
                18,
                4,
                20,
                6,
            ],
        },
    });

    console.log("Diamond outline layer added");
}

// Setup location click handlers for zooming to regions
function setupLocationClickHandlers(map) {
    const locationClicks = {
        brazil: { center: [-51.9253, -15.7975], zoom: 14 },
        mexico: { center: [-101.5037, 19.4326], zoom: 14 },
        canada: { center: [-113.481, 53.6467], zoom: 16 },
    };

    document.querySelectorAll(".location-info").forEach((element) => {
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
