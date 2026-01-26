// Image Loader Utility
// Handles loading and converting images for use in MapLibre GL JS

// Embedded diamond image as data URL (80x120 PNG with white outline, very thick stroke)
const DIAMOND_IMAGE_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB4CAYAAABl7nX2AAACQklEQVR4nO2cQW7DMAwERf3/z1u4xwBBa1Mid+WdByTIYBjbSqQxjDHGGGOMMcZ8AACDmDkE5IFYIrVABWgF4qM61gppBapAKRBfamOskE4g/pDEJpFOoBpUAvHPupgqpBKoCI1A3KyKpUIKgXgog0EihUBl2gUiWVF3he0C1WkViEX1dFbYJhCLP3SXRI+wokBsqqWjQheoJhA3K4mI2Pn6UgLxUB6zRI+wikAkR5e1QheoIBCLLhyMFU61q26QSfQIMwvEpns+pgpdIKtAbH7iYKlwKspjkugRZhOIovpYKnSBTAJRXB9DhVNdXrdEjzCDQDTX11mhC+wWCJL6uiqcJ8nrkOgRTjJPq6+6QheYZJ5YX2WF81R5VRI9wknmyfVVVOgCk8zT69td4VRZ+c2yKwCPcJJbAlUrxMavHxeY5LZAtQqx+eL3qEAViSi4c/AIJ3kskL1CFN23usAkKYFBWmHlU1O6wCCTWP3I6RFOskRgkFTYseDhAlkERnOFXcttSwuMJomda5UeYTaBUVxh90q5C2QUGEUVdte3tcDYLJFB3oVHmFlgbKqQpb4LF8guMBZXyFRfWYGxSCKbvAuPsIrASFbIWN+FC1QSGA8rZK3v971GA9j4u0j13+o8wooCg2Sz4QpcoKrAaN5wfUSB0bTlfyUeYXWBUXzsyXEC1aEQGEVHPx0rsOLwseMFqkIlMDYdwPgagYrQCYzFh9C+TuDKY5BfK1AJWoGRPAp+vF2gWUT3ZkVjjDHGGGPMWM8Pn4KMwcO+evQAAAAASUVORK5CYII=";

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
