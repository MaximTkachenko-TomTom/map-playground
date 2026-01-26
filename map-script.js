// Map initialization
const map = new maplibregl.Map({
    container: "map",
    style: `https://api.tomtom.com/maps/orbis/assets/styles/*/style.json?key=${CONFIG.TOMTOM_API_KEY}&map=basic_street-light-driving&apiVersion=1`,
    center: [-60, 10],
    zoom: 4,
});

map.on("load", () => {
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

    // Create diamond points for each region
    // 10 diamonds in a grid pattern for each location
    const allDiamonds = [];

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

    // Function to create 4 line segments that form a diamond outline
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

    console.log("Total diamonds created:", allDiamonds.length);
    console.log("Total diamond line segments:", diamondLines.length);
    console.log("Sample diamond points:", allDiamonds.slice(0, 3));

    // Add source for all diamonds
    map.addSource("diamonds", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: diamondLines,
        },
    });

    console.log("Diamond source added to map");

    // Add colored diamonds layer by region using data-driven styling
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

    console.log("Diamond center markers added");

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

    console.log("Map loaded with", diamondLines.length, "diamond line segments across 3 regions");
    console.log("Total diamonds:", allDiamonds.length);

    // Add click handlers for location info blocks
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
});

// Distance measurement tool
let isMeasuring = false;
let measurePoints = [];
const measureBtn = document.getElementById("measure-btn");
const measureInfo = document.getElementById("measure-info");
const clearBtn = document.getElementById("clear-measurements");
const mapCoordsDiv = document.getElementById("map-coords");

// Display current map coordinates in real-time
map.on("mousemove", (e) => {
    const { lng, lat } = e.lngLat;
    mapCoordsDiv.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} | Zoom: ${map.getZoom().toFixed(2)}`;
});

// Function to calculate distance between two points (in meters) using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to format distance
function formatDistance(meters) {
    if (meters >= 1000) {
        return (meters / 1000).toFixed(2) + " km";
    }
    return meters.toFixed(2) + " m";
}

// Toggle measurement mode
measureBtn.addEventListener("click", () => {
    isMeasuring = !isMeasuring;
    measureBtn.textContent = isMeasuring ? "Stop Measuring" : "Start Measuring";
    measureBtn.classList.toggle("active");

    if (!isMeasuring) {
        map.getCanvas().style.cursor = "default";
    } else {
        map.getCanvas().style.cursor = "crosshair";
        measurePoints = [];
        initMeasureLayers();
        updateMeasureInfo();
    }
});

// Clear measurements
clearBtn.addEventListener("click", () => {
    measurePoints = [];
    isMeasuring = false;
    measureBtn.textContent = "Start Measuring";
    measureBtn.classList.remove("active");
    map.getCanvas().style.cursor = "default";
    updateMeasureInfo();

    // Clear the data but keep the layers
    if (map.getSource("measure-points")) {
        map.getSource("measure-points").setData({
            type: "FeatureCollection",
            features: [],
        });
    }
    if (map.getSource("measure-lines")) {
        map.getSource("measure-lines").setData({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [],
            },
        });
    }
});

// Add points on map click
map.on("click", (e) => {
    if (!isMeasuring) return;

    const { lng, lat } = e.lngLat;
    const zoom = map.getZoom();
    console.log("Measurement point clicked:", { lat, lng, zoom });
    measurePoints.push({ lat, lng, zoom });

    // Update measure visualization
    updateMeasureVisualization();
    updateMeasureInfo();
});

// Update measure info display
function updateMeasureInfo() {
    let html = "";

    if (measurePoints.length === 0) {
        html = '<p style="margin: 0; color: #999;">Click on map to add points</p>';
    } else {
        html += `<div class="measure-point"><strong>Points: ${measurePoints.length}</strong></div>`;

        // Show all points
        measurePoints.forEach((point, index) => {
            html += `<div class="measure-point">
                <strong>P${index + 1}:</strong> ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)} (Z${point.zoom?.toFixed(1) || "?"})
            </div>`;
        });

        // Calculate distances between consecutive points
        if (measurePoints.length > 1) {
            html +=
                '<div style="margin-top: 8px; border-top: 1px solid #ddd; padding-top: 8px;"><strong>Distances:</strong></div>';
            let totalDistance = 0;

            for (let i = 0; i < measurePoints.length - 1; i++) {
                const p1 = measurePoints[i];
                const p2 = measurePoints[i + 1];
                const dist = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
                totalDistance += dist;

                html += `<div class="measure-point">
                    P${i + 1}-P${i + 2}: ${formatDistance(dist)}
                </div>`;
            }

            html += `<div style="margin-top: 8px; border-top: 1px solid #ddd; padding-top: 8px; font-weight: 600;">
                Total: ${formatDistance(totalDistance)}
            </div>`;
        }
    }

    measureInfo.innerHTML = html;
}

// Initialize measurement sources and layers
function initMeasureLayers() {
    // Remove old layers if they exist
    if (map.getLayer("measure-points")) {
        map.removeLayer("measure-points");
    }
    if (map.getLayer("measure-lines")) {
        map.removeLayer("measure-lines");
    }
    if (map.getSource("measure-points")) {
        map.removeSource("measure-points");
    }
    if (map.getSource("measure-lines")) {
        map.removeSource("measure-lines");
    }

    // Create points source
    map.addSource("measure-points", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [],
        },
    });

    map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measure-points",
        paint: {
            "circle-radius": 6,
            "circle-color": "#00FF00",
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 2,
        },
    });

    // Create lines source
    map.addSource("measure-lines", {
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [],
            },
        },
    });

    map.addLayer({
        id: "measure-lines",
        type: "line",
        source: "measure-lines",
        paint: {
            "line-color": "#00FF00",
            "line-width": 3,
            "line-dasharray": [5, 5],
        },
    });

    console.log("Measure layers initialized");
}

// Update measurement visualization on map
function updateMeasureVisualization() {
    // Create line between points (GeoJSON uses [lng, lat])
    const lineCoordinates = measurePoints.map((p) => [p.lng, p.lat]);

    console.log("Updating visualization with points:", measurePoints);
    console.log("Line coordinates:", lineCoordinates);

    // Update points data
    const pointFeatures = measurePoints.map((p, index) => ({
        type: "Feature",
        properties: { index: index + 1 },
        geometry: {
            type: "Point",
            coordinates: [p.lng, p.lat],
        },
    }));

    if (map.getSource("measure-points")) {
        map.getSource("measure-points").setData({
            type: "FeatureCollection",
            features: pointFeatures,
        });
    }

    // Update lines data
    if (map.getSource("measure-lines")) {
        if (lineCoordinates.length > 1) {
            map.getSource("measure-lines").setData({
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: lineCoordinates,
                },
            });
        } else {
            map.getSource("measure-lines").setData({
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [],
                },
            });
        }
    }
}
