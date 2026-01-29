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

        // Setup latitude input control
        setupLatitudeInput(map);

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

// Setup latitude input control to pan map
function setupLatitudeInput(map) {
    const latitudeInput = document.getElementById("latitude-input");
    const goButton = document.getElementById("go-to-latitude-btn");

    if (!latitudeInput || !goButton) return;

    // Handle button click
    goButton.addEventListener("click", () => {
        const latitude = parseFloat(latitudeInput.value);
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            alert("Please enter a valid latitude between -90 and 90");
            return;
        }

        const center = map.getCenter();
        map.flyTo({
            center: [center.lng, latitude],
            duration: 800,
        });
    });

    // Handle Enter key in input
    latitudeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            goButton.click();
        }
    });
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMap);
} else {
    initializeMap();
}
