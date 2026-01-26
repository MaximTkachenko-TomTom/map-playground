// Map initialization and module orchestration
// Wait for all modules to load before initializing the map

function initializeMap() {
    const map = new maplibregl.Map({
        container: "map",
        style: `https://api.tomtom.com/maps/orbis/assets/styles/*/style.json?key=${CONFIG.TOMTOM_API_KEY}&map=basic_street-light-driving&apiVersion=1`,
        center: [-60, 10],
        zoom: 4,
    });

    // Initialize map features when map is loaded
    map.on("load", () => {
        // Initialize diamond markers
        initializeDiamonds(map);

        // Initialize measurement tool
        initializeMeasurements(map);

        console.log("Map fully initialized with diamonds and measurement tools");
    });
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMap);
} else {
    initializeMap();
}
