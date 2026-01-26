// Image Loader Utility
// Handles loading and converting images for use in MapLibre GL JS

// Embedded diamond image as data URL (80x120 PNG with white outline)
const DIAMOND_IMAGE_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB4CAYAAABl7nX2AAACjklEQVR4nO2dWY7DMAxDI93/zhrMR4CgQNAm2iib7wKRCapMXC/HQQghhBBCCCHkAzOzAxg9BohnwCJCCzgBWAHtw3WoLoQV8ERE5AAGUkC7cRuiC+EEtItIp/uuLkQTEU7Au9ZFbWUoAe1HdyG5EErAb25DdCGMgPbQVSguVNTguAMtUCAEfNqiSK3cLqA5XdTtwnYB37oKxYWtAlqQezpdqBOCAzlQ2ltYnK3Y3cotAlqSWzpc2OpACXJPpwvLBbRkl1S7UKcFB1qgtLSwJLVcRyuXCWjFrVX1vHIHSrJLql1YIqA1veRWPFcnBwdCoJS1sBS3VtXzUgU0gAnP7DpKHChNXwoVz9XV3Zddj64SHF2BktrCAjJrnFmHrt662fXp6u7Lrkd3cl9GnbpicFQGSngLC6h4WfXpTq2bUbfu5L6MOnVX90XVr6sHR3aghLSwDBMvsm7dtXWjxqO7ui+q/lcCruY+z7h0p+DICJTXLbyKeN7xPBJw1db1jPOVA1dzn2dcPwu4i/uejld3d513vHyNqXyN2cWF8mCc/JSr/pRD2FoQjefjgK8xVa8xd9hwF7ZNqK4WKFLxKbeaC637TyUZHChRs0qcUJWGCdU7bIgL4ZZ2yNBAaf1TaaoLDXV5mwwIlIy/I7i0wwkXmTvh8jYn3GiDKKAABUr2/9hcZO6E212dcKONE275RxdQGgKlcgEUt7s64cE7Trjl3wkPH5skoCQGStfKWR6844RHgDrh4WPTjwA1HoPcFygIWy54BOj0Fj7hZQQv4THIgfBCloJAQQgOyN9A4WUEcfBatJfwQpZAeDVkYKCgBQdkiFzhtWiBdC8NGenAf3g1JMHAwFuYEEIIIYQQcjznDzEU1Ma07slKAAAAAElFTkSuQmCC";

/**
 * Load an image from a data URL and add it to the map
 * @param {string} imageDataUrl - Data URL of the image
 * @param {string} imageId - ID to register the image with the map
 * @param {maplibregl.Map} map - MapLibre GL JS map instance
 * @returns {Promise} - Resolves when image is loaded and added to map
 */
function loadImageToMap(imageDataUrl, imageId, map) {
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
            reject(new Error(`Failed to load image`));
        };

        img.src = imageDataUrl;
    });
}
