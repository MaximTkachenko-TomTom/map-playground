// Image Loader Utility
// Handles loading and converting images for use in MapLibre GL JS

// Embedded diamond image as data URL (80x120 PNG with white outline, thicker stroke)
const DIAMOND_IMAGE_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB4CAYAAABl7nX2AAACnUlEQVR4nO2dy3LDMAwDTf7/P7PTayZpY4sPQMKeOxMbXYSJItvXJYQQQgghhBDihYiICxi/CMIL4BChA2QANsB4sQ7VQtgAWYAMMD7YhmghXIDxT0hoIcIFyAZUgPHGLjOzb/5uCqgAGXEG+wzYQogA42EYCCFCBPiOV+veWYiAswwO1CqPB8iOs9iHauFYgJF80lMhQlXYvhwUSAPFWaqLWmUoAxlxRvuQLGwNMJpOrjPE8Qrb4kCYHijOWF2kKo8byI6z2zdtYXmAMfxlv/r1RypsRW/8EwPF2as7XWUNEdQAY8C+CQt9x8HReVxtFbbmN/iu1/OdqjtRZQ0RpAADyL4uC333wVF9vKUVNpDfLiqPw3etbleVNUSmAwwC+yot9JMGR8V5pFfYQO2rOj4/obqVVdYQWcRPsy/bQj91cGSdX0qFjcy+zOP206qbXWUNkUX8ZPsyLHSmrWRVrMihCi9yK8AdLYzFt6ay9UAGRtYDdxkcWef3yMAdqhxJnyo0RBZ5HCCzhZH4mbZlZwISUDsTbJOBsnIeywYaUZUrvo5qiCxSth4YYBZWLYa075GegGKPtJENlKzjTTXQAKtcvY6pIbJIy86EGLKwYxV99GrNSqiv1jTQgVJxXGUG2mCVO38A0xBh2yMdxRZ2//wKc9+YDLa8b4wBXidCZ6A1VHlq54SGCPPVmpFk4eS+nXEDYzHE6cWK1gBt8Ir1bQy0xCojbLkbrzA7MPeNiZsWItgHZ2B8GeL04IAI0BrunbW9gfagyijVhawwI+MB2g0L0eyDCPATeqrXDTLv4nusgfZHlRGrCxcgKxD/xbsfklHs+0UG7hagPXieyCRwAd59JNA0kAEyARug6aleAoIAWvsTQgghhBBCXDn8AAsAxMFQmv3SAAAAAElFTkSuQmCC";

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
