// Map initialization and module orchestration
// Wait for all modules to load before initializing the map

function initializeMap() {
    const map = new maplibregl.Map({
        container: "map",
        style:
            `https://api.tomtom.com/maps/orbis/assets/styles/0.0.*/style?` +
            `key=${CONFIG.TOMTOM_API_KEY}&` +
            `map=basic_street-light-driving&` +
            `hillshade=hillshade_light&` +
            `navigationAndRoute=navigation_and_route_light&` +
            `poi=poi_light&` +
            `range=range_light&` +
            `apiVersion=1&` +
            `renderer=premium`,
        center: [-60, 10],
        zoom: 4,
    });

    map.on("error", (e) => {
        console.error("Map error:", e.error);
    });

    // Initialize map features when map is loaded
    map.on("load", () => {
        // Initialize diamond markers
        initializeDiamonds(map);

        // Initialize measurement tool
        initializeMeasurements(map);

        // Setup zoom and position input controls
        setupZoomInput(map);
        setupPositionInput(map);

        // Update zoom level display initially
        updateZoomDisplay(map);
    });

    // Update zoom level and position in real-time
    map.on("zoom", () => {
        updateZoomDisplay(map);
    });

    // Update position when map is panned
    map.on("move", () => {
        updateZoomDisplay(map);
    });
}

// Update the zoom level and position display
function updateZoomDisplay(map) {
    const zoomLevel = map.getZoom();
    const zoomDisplay = document.getElementById("zoom-level");
    if (zoomDisplay) {
        zoomDisplay.textContent = `Zoom: ${zoomLevel.toFixed(2)}`;
    }

    const center = map.getCenter();
    const positionDisplay = document.getElementById("position-display");
    if (positionDisplay) {
        positionDisplay.textContent = `Position: ${center.lng.toFixed(4)}°, ${center.lat.toFixed(4)}°`;
    }
}

// Setup zoom input control to change zoom level
function setupZoomInput(map) {
    const zoomLevel = document.getElementById("zoom-level");
    const zoomInput = document.getElementById("zoom-input");

    if (!zoomLevel || !zoomInput) return;

    // Click on zoom level to enter edit mode
    zoomLevel.addEventListener("click", () => {
        zoomInput.value = map.getZoom().toFixed(2);
        zoomLevel.style.display = "none";
        zoomInput.style.display = "block";
        zoomInput.focus();
        zoomInput.select();
    });

    // Handle Enter key to apply zoom and exit edit mode
    zoomInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            applyZoom();
        }
    });

    // Handle blur to exit edit mode without applying
    zoomInput.addEventListener("blur", () => {
        zoomInput.style.display = "none";
        zoomLevel.style.display = "block";
    });

    // Handle Escape key to cancel edit mode
    zoomInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            zoomInput.style.display = "none";
            zoomLevel.style.display = "block";
        }
    });

    // Parse and apply zoom level
    function applyZoom() {
        const zoom = parseFloat(zoomInput.value);

        if (isNaN(zoom) || zoom < 0 || zoom > 28) {
            alert("Please enter a valid zoom level between 0 and 28");
            return;
        }

        zoomInput.style.display = "none";
        zoomLevel.style.display = "block";

        map.setZoom(zoom);
    }
}

// Setup position input control to pan map to coordinates
function setupPositionInput(map) {
    const positionDisplay = document.getElementById("position-display");
    const positionInput = document.getElementById("position-input");

    if (!positionDisplay || !positionInput) return;

    // Click on position display to enter edit mode
    positionDisplay.addEventListener("click", () => {
        const center = map.getCenter();
        positionInput.value = `${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`;
        positionDisplay.style.display = "none";
        positionInput.style.display = "block";
        positionInput.focus();
        positionInput.select();
    });

    // Handle Enter key to apply coordinates and exit edit mode
    positionInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            applyCoordinates();
        }
    });

    // Handle blur to exit edit mode without applying
    positionInput.addEventListener("blur", () => {
        positionInput.style.display = "none";
        positionDisplay.style.display = "block";
    });

    // Handle Escape key to cancel edit mode
    positionInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            positionInput.style.display = "none";
            positionDisplay.style.display = "block";
        }
    });

    // Parse and apply coordinates
    function applyCoordinates() {
        const input = positionInput.value.trim();
        const coords = input.split(",").map((s) => parseFloat(s.trim()));

        if (coords.length !== 2 || coords.some(isNaN)) {
            alert("Please enter coordinates as: longitude, latitude");
            return;
        }

        const [lng, lat] = coords;

        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            alert("Invalid coordinates. Longitude must be -180 to 180, latitude must be -90 to 90");
            return;
        }

        positionInput.style.display = "none";
        positionDisplay.style.display = "block";

        map.flyTo({
            center: [lng, lat],
            duration: 800,
        });
    }
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMap);
} else {
    initializeMap();
}
