// Distance Measurement Tool
// This module handles all measurement-related functionality

let isMeasuring = false;
let measurePoints = [];

// Get DOM elements
const measureBtn = document.getElementById("measure-btn");
const measureInfo = document.getElementById("measure-info");
const clearBtn = document.getElementById("clear-measurements");
const mapCoordsDiv = document.getElementById("map-coords");

// Initialize measurement tool
function initializeMeasurements(map) {
    // Display current map coordinates in real-time
    map.on("mousemove", (e) => {
        const { lng, lat } = e.lngLat;
        mapCoordsDiv.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} | Zoom: ${map.getZoom().toFixed(2)}`;
    });

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
            initMeasureLayers(map);
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
        updateMeasureVisualization(map);
        updateMeasureInfo();
    });
}

// Calculate distance between two points (in meters) using Haversine formula
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

// Format distance
function formatDistance(meters) {
    if (meters >= 1000) {
        return (meters / 1000).toFixed(2) + " km";
    }
    return meters.toFixed(2) + " m";
}

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
function initMeasureLayers(map) {
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
function updateMeasureVisualization(map) {
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
