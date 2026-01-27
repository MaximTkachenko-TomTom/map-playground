// Distance Measurement Tool - Canvas-based implementation
// Uses HTML overlays for drawing lines and text

let isMeasuring = false;
let firstPoint = null;
let measurements = [];
let measurementElements = [];
let temporaryLine = null;

// Get DOM elements
const measureBtn = document.getElementById("measure-btn");
const mapContainer = document.getElementById("map");

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
    return meters.toFixed(0) + " m";
}

// Convert lat/lng to screen coordinates
function lngLatToScreenCoords(map, lng, lat) {
    const canvas = map.getCanvas();
    const point = map.project([lng, lat]);
    return { x: point.x, y: point.y };
}

// Create SVG line element for measurement
function createMeasurementLine(map, point1, point2, distance, measurementId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.setAttribute("width", mapContainer.offsetWidth);
    svg.setAttribute("height", mapContainer.offsetHeight);

    const coords1 = lngLatToScreenCoords(map, point1.lng, point1.lat);
    const coords2 = lngLatToScreenCoords(map, point2.lng, point2.lat);

    // Draw line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", coords1.x);
    line.setAttribute("y1", coords1.y);
    line.setAttribute("x2", coords2.x);
    line.setAttribute("y2", coords2.y);
    line.setAttribute("stroke", "#000000");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-dasharray", "4,4");
    line.style.cursor = "pointer";
    line.dataset.measurementId = measurementId;
    svg.appendChild(line);

    // Draw endpoint circles
    const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle1.setAttribute("cx", coords1.x);
    circle1.setAttribute("cy", coords1.y);
    circle1.setAttribute("r", "5");
    circle1.setAttribute("fill", "#000000");
    circle1.setAttribute("stroke", "#FFFFFF");
    circle1.setAttribute("stroke-width", "2");
    svg.appendChild(circle1);

    const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle2.setAttribute("cx", coords2.x);
    circle2.setAttribute("cy", coords2.y);
    circle2.setAttribute("r", "5");
    circle2.setAttribute("fill", "#000000");
    circle2.setAttribute("stroke", "#FFFFFF");
    circle2.setAttribute("stroke-width", "2");
    svg.appendChild(circle2);

    // Draw distance text at midpoint
    const midX = (coords1.x + coords2.x) / 2;
    const midY = (coords1.y + coords2.y) / 2;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", midX);
    text.setAttribute("y", midY);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "18");
    text.setAttribute("fill", "#000000");
    text.setAttribute("stroke", "#FFFFFF");
    text.setAttribute("stroke-width", "3");
    text.setAttribute("paint-order", "stroke");
    text.style.cursor = "pointer";
    text.style.pointerEvents = "auto";
    text.dataset.measurementId = measurementId;
    text.textContent = formatDistance(distance);
    svg.appendChild(text);

    line.style.pointerEvents = "auto";

    // Add click handlers for removal
    const removeHandler = () => {
        removeMeasurement(map, measurementId);
    };
    line.addEventListener("click", removeHandler);
    text.addEventListener("click", removeHandler);

    mapContainer.appendChild(svg);
    return svg;
}

// Create temporary line while measuring
function createTemporaryLine(map, point1, point2, distance) {
    // Remove old temporary line if exists
    if (temporaryLine) {
        temporaryLine.remove();
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.setAttribute("width", mapContainer.offsetWidth);
    svg.setAttribute("height", mapContainer.offsetHeight);

    const coords1 = lngLatToScreenCoords(map, point1.lng, point1.lat);
    const coords2 = lngLatToScreenCoords(map, point2.lng, point2.lat);

    // Draw temporary line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", coords1.x);
    line.setAttribute("y1", coords1.y);
    line.setAttribute("x2", coords2.x);
    line.setAttribute("y2", coords2.y);
    line.setAttribute("stroke", "#000000");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-dasharray", "4,4");
    svg.appendChild(line);

    // Draw first point indicator
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", coords1.x);
    circle.setAttribute("cy", coords1.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", "#000000");
    circle.setAttribute("stroke", "#FFFFFF");
    circle.setAttribute("stroke-width", "2");
    svg.appendChild(circle);

    // Draw distance text at midpoint
    const midX = (coords1.x + coords2.x) / 2;
    const midY = (coords1.y + coords2.y) / 2;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", midX);
    text.setAttribute("y", midY);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "18");
    text.setAttribute("fill", "#000000");
    text.setAttribute("stroke", "#FFFFFF");
    text.setAttribute("stroke-width", "3");
    text.setAttribute("paint-order", "stroke");
    text.textContent = formatDistance(distance);
    svg.appendChild(text);

    mapContainer.appendChild(svg);
    temporaryLine = svg;
}

// Clear temporary line
function clearTemporaryLine() {
    if (temporaryLine) {
        temporaryLine.remove();
        temporaryLine = null;
    }
}

// Remove a measurement
function removeMeasurement(map, measurementId) {
    // Find and remove the SVG element
    const svgs = mapContainer.querySelectorAll("svg");
    svgs.forEach((svg) => {
        const hasMatch = svg.querySelector(`[data-measurement-id="${measurementId}"]`);
        if (hasMatch) {
            svg.remove();
        }
    });

    // Remove from measurements array
    measurements = measurements.filter((m) => m.id !== measurementId);
}

// Initialize measurement tool
function initializeMeasurements(map) {
    // Toggle measurement mode
    measureBtn.addEventListener("click", () => {
        isMeasuring = !isMeasuring;
        measureBtn.classList.toggle("active");

        if (isMeasuring) {
            map.getCanvas().style.cursor = "crosshair";
            firstPoint = null;
        } else {
            map.getCanvas().style.cursor = "default";
            clearTemporaryLine();
        }
    });

    // Track mouse movement to show live distance
    map.on("mousemove", (e) => {
        if (!isMeasuring || !firstPoint) return;

        const { lng, lat } = e.lngLat;
        const distance = calculateDistance(firstPoint.lat, firstPoint.lng, lat, lng);
        createTemporaryLine(map, firstPoint, { lat, lng }, distance);
    });

    // Add points on map click
    map.on("click", (e) => {
        if (!isMeasuring) return;

        const { lng, lat } = e.lngLat;

        if (!firstPoint) {
            // First point placed
            firstPoint = { lat, lng };
        } else {
            // Second point placed - finalize measurement
            const secondPoint = { lat, lng };
            const distance = calculateDistance(firstPoint.lat, firstPoint.lng, secondPoint.lat, secondPoint.lng);

            // Create permanent measurement
            const measurement = {
                id: String(Date.now()),
                point1: firstPoint,
                point2: secondPoint,
                distance: distance,
            };
            measurements.push(measurement);

            // Draw the permanent line
            createMeasurementLine(map, firstPoint, secondPoint, distance, measurement.id);

            // Clear temporary line
            clearTemporaryLine();

            // Reset for next measurement
            firstPoint = null;
        }
    });

    // Redraw measurements on map move/zoom
    map.on("move", () => {
        // Remove all SVGs and redraw them
        const svgs = Array.from(mapContainer.querySelectorAll("svg"));
        svgs.forEach((svg) => svg.remove());

        // Redraw temporary line if active
        if (isMeasuring && firstPoint) {
            // This will be redrawn on next mousemove
        }

        // Redraw all measurements
        measurements.forEach((measurement) => {
            createMeasurementLine(map, measurement.point1, measurement.point2, measurement.distance, measurement.id);
        });
    });
}
