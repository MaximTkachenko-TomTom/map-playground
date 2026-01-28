// Calculation Utilities
// Helper functions for geographic calculations used in map operations

// Constants for geographic calculations
const DEGREE_TO_RADIAN = Math.PI / 180;
const EARTH_EQUATOR_IN_METERS = 40075016.686;
const IDEAL_TILE_SIZE_IN_PIXELS = 512;

/**
 * Compute Mercator scale factor based on latitude
 * @param {number} latitude - Latitude in degrees
 * @returns {number} - Mercator scale factor
 */
function calculateMercatorScaleFactor(latitude) {
    const latitudeRadian = latitude * DEGREE_TO_RADIAN;
    let cosLatitude = Math.cos(latitudeRadian);

    // Avoid division by zero at poles
    if (Math.abs(cosLatitude) < 1e-10) {
        cosLatitude = 1e-10;
    }

    return IDEAL_TILE_SIZE_IN_PIXELS / (EARTH_EQUATOR_IN_METERS * cosLatitude);
}

/**
 * Calculate bearing (angle in degrees) between two points
 * @param {Object} point1 - First point with lat and lng properties
 * @param {Object} point2 - Second point with lat and lng properties
 * @returns {number} - Bearing in degrees (0-360)
 */
function calculateBearing(point1, point2) {
    const lat1 = point1.lat * DEGREE_TO_RADIAN;
    const lat2 = point2.lat * DEGREE_TO_RADIAN;
    const dLng = (point2.lng - point1.lng) * DEGREE_TO_RADIAN;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360;
}
