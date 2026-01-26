// Image Loader Utility
// Handles loading and converting images for use in MapLibre GL JS

/**
 * Load an image from a URL and add it to the map
 * @param {string} imagePath - Path or URL to the image
 * @param {string} imageId - ID to register the image with the map
 * @param {maplibregl.Map} map - MapLibre GL JS map instance
 * @returns {Promise} - Resolves when image is loaded and added to map
 */
function loadImageToMap(imagePath, imageId, map) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                // Create canvas to convert image to ImageData
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);

                // Add image to map
                map.addImage(imageId, imageData);
                resolve(imageData);
            } catch (error) {
                reject(new Error(`Failed to process image: ${error.message}`));
            }
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image from: ${imagePath}`));
        };

        // Construct absolute URL from current document location
        const absolutePath = new URL(imagePath, window.location.href).href;
        img.src = absolutePath;
    });
}
