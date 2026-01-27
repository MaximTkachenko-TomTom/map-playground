// Map initialization and module orchestration
// Wait for all modules to load before initializing the map

function initializeMap() {
    const map = new maplibregl.Map({
        container: "map",
        // style: `https://api.tomtom.com/maps/orbis/assets/styles/*/style.json?key=${CONFIG.TOMTOM_API_KEY}&map=basic_street-light-driving&apiVersion=1`,
        style:
            `https://api.tomtom.com/maps/orbis/assets/styles/0.0.*/style?` +
            `key=${CONFIG.TOMTOM_API_KEY}&` +
            `map=basic_street-light-driving&` +
            // `trafficIncidents=incidents_light&` +
            // `trafficFlow=flow_relative-light&` +
            `hillshade=hillshade_light&` +
            `navigationAndRoute=navigation_and_route_light&` +
            `poi=poi_light&` +
            `range=range_light&` +
            `apiVersion=1&` +
            `renderer=premium`,
        center: [-60, 10],
        zoom: 4,
    });

    // Initialize map features when map is loaded
    map.on("load", () => {
        // Initialize diamond markers
        initializeDiamonds(map);

        // Initialize measurement tool
        initializeMeasurements(map);

        // Update zoom level display initially
        updateZoomDisplay(map);

        console.log("Map fully initialized with diamonds and measurement tools");
    });

    // Update zoom level in real-time
    map.on("zoom", () => {
        updateZoomDisplay(map);
    });
}

// Update the zoom level display
function updateZoomDisplay(map) {
    const zoomLevel = map.getZoom();
    const zoomDisplay = document.getElementById("zoom-level");
    if (zoomDisplay) {
        zoomDisplay.textContent = `Zoom: ${zoomLevel.toFixed(2)}`;
    }
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMap);
} else {
    initializeMap();
}
