# Map Playground - Diamond Scaling Visualization

An interactive map visualization project demonstrating how diamond symbols scale correctly across different latitudes using MapLibre GL JS and TomTom Maps API. This project explores Mercator projection distortions and symbol rendering techniques.

## 🎯 Project Overview

This project is a proof-of-concept for rendering diamond-shaped symbols along geographic routes at different latitudes (Brazil, Mexico, Canada) while maintaining consistent real-world sizes despite Mercator projection distortions. It demonstrates three different rendering approaches:

1. **Symbol along line** - Symbols placed automatically along a LineString
2. **Symbol** - Individual symbols at each point with calculated bearings
3. **Line Pattern** - Line with repeating diamond pattern texture

## ✨ Current Features

### 🗺️ Interactive Map
- Full-screen interactive map with pan/zoom controls
- TomTom Maps premium rendering with hillshade and navigation layers
- Default view centered on the Americas (center: [-60, 10], zoom: 4)
- Real-time zoom level and position display

### 💎 Diamond Visualization
- **Three geographic regions**:
  - 🇧🇷 **Brazil** (Brasília) - ~10 diamond points at -15.778° latitude
  - 🇨🇦 **Canada** (Edmonton) - ~25 diamond points at 53.648° latitude
  - 🇲🇽 **Mexico** (Mexico City) - Placeholder for future implementation

- **Mercator Scale Compensation**: Diamonds automatically scale to maintain consistent real-world size across latitudes using the formula:
  ```
  scale_factor = 512 / (40075016.686 * cos(latitude))
  ```

- **Three Rendering Modes**:
  - **Symbol along line**: MapLibre automatically places symbols along route with 150px spacing
  - **Symbol**: Individual point symbols with calculated bearing angles
  - **Line Pattern**: Tiled diamond texture applied as line pattern (120px width)

- **Interactive Toggle**: Switch between rendering modes via dropdown selector
- **Click-to-zoom**: Click region flags to fly to that location

### 📏 Distance Measurement Tool
- **Activation**: Click 📏 button or press **M** key
- **Usage**: Click two points to measure distance
- **Display**: Shows distance in meters or kilometers with visual line
- **Interactive**: Click measurement lines/labels to remove them
- **Live preview**: See distance while hovering before second click
- **Persistent**: Measurements redraw on pan/zoom

### 🎛️ Interactive Controls
- **Zoom Control**: Click zoom display to manually enter zoom level (0-28)
- **Position Control**: Click position to manually enter coordinates (lng, lat)
- **Location Buttons**: Quick navigation to Brazil, Mexico, or Canada
- **Keyboard Shortcuts**:
  - **M** - Toggle measurement mode
  - **Enter** - Confirm zoom/position input
  - **Escape** - Cancel input

## 🏗️ Architecture

### File Structure
```
map-playground/
├── map.html                    # Main HTML page
├── map-style.css               # UI styling and layout
├── map-script.js               # Map initialization and orchestration
├── map-diamonds.js             # Diamond rendering logic
├── map-calculations.js         # Geographic calculations (Mercator, bearing)
├── map-measurements.js         # Distance measurement tool
├── map-image-loader.js         # Image loading utilities
├── diamond.png                 # Diamond icon asset
├── config.js                   # API keys (gitignored)
├── config.example.js           # Config template
├── tasks/                      # Project task documentation
├── experiments/                # Research and exploration notes
├── .zed/tasks.json            # Zed editor tasks
└── .github/copilot-instructions.md
```

### Module Design

**`map-script.js`** - Main orchestrator
- Initializes MapLibre map with TomTom style
- Coordinates all modules on map load
- Handles zoom/position input controls
- Updates real-time display of zoom and center coordinates

**`map-diamonds.js`** - Diamond visualization
- Defines region data (coordinates, colors, names)
- Creates GeoJSON data from coordinate arrays
- Manages three rendering modes (line, symbol, line-pattern)
- Handles mode switching and layer visibility
- Sets up location navigation click handlers

**`map-calculations.js`** - Geographic utilities
- `calculateMercatorScaleFactor(latitude)` - Computes scale compensation
- `calculateBearing(point1, point2)` - Calculates bearing between points
- Constants for Earth circumference and tile sizing

**`map-measurements.js`** - Measurement tool
- Canvas-based SVG overlay for drawing lines
- Haversine formula for distance calculation
- Interactive line/label removal
- Persistent measurements across map movement

**`map-image-loader.js`** - Asset management
- Loads diamond PNG as data URL
- Converts images to ImageData for MapLibre
- Creates tiled patterns for line-pattern mode

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- TomTom Maps API key ([Get one here](https://developer.tomtom.com/))
- Optional: Python 3 for local server

### Setup

1. **Clone/download this repository**

2. **Create your config file:**
   ```bash
   cp config.example.js config.js
   ```

3. **Add your TomTom API key to `config.js`:**
   ```javascript
   const CONFIG = {
       TOMTOM_API_KEY: 'your-actual-api-key-here'
   };
   ```

4. **Open the map:**
   - **Direct**: Double-click `map.html`
   - **Local Server**: `python3 -m http.server 8000` → `http://localhost:8000/map.html`
   - **Zed Editor**: Press `Ctrl+R`

## 🎮 Usage Guide

### Viewing Diamond Visualizations

1. **Navigate to a region**: Click 🇧🇷 Brazil or 🇨🇦 Canada buttons
2. **Wait for zoom ≥17**: Diamonds only appear at high zoom levels
3. **Switch rendering modes**: Use dropdown to compare visualization methods
4. **Observe scaling**: Notice how diamonds appear same size despite latitude differences

### Measuring Distances

1. Click 📏 button or press **M** key
2. Click first point on map (crosshair cursor appears)
3. Move mouse to see live distance preview
4. Click second point to finalize measurement
5. Click measurement line/label to remove it
6. Press **M** or click button again to exit measurement mode

### Manual Navigation

1. **Zoom**: Click "Zoom: X.XX" → enter value → press Enter
2. **Position**: Click "Position: X.XX°, Y.XX°" → enter "lng, lat" → press Enter
3. Pan with mouse drag, zoom with scroll wheel

## 🔧 Technical Details

### Mercator Projection Compensation

At the equator, 1 meter ≈ 512 pixels at zoom level 20. As latitude increases, the Mercator projection distorts distances. The scale factor compensates:

```javascript
const EARTH_EQUATOR_IN_METERS = 40075016.686;
const IDEAL_TILE_SIZE_IN_PIXELS = 512;

function calculateMercatorScaleFactor(latitude) {
    const latitudeRadian = latitude * (Math.PI / 180);
    const cosLatitude = Math.cos(latitudeRadian);
    return IDEAL_TILE_SIZE_IN_PIXELS / (EARTH_EQUATOR_IN_METERS * cosLatitude);
}
```

This factor is used in `icon-size` expressions:
```javascript
'icon-size': [
    'interpolate', ['exponential', 2], ['zoom'],
    15, ['*', 32768, ['get', 'mercator_scale_factor'], 0.03],
    22, ['*', 4.1943e6, ['get', 'mercator_scale_factor'], 0.03]
]
```

### Bearing Calculation

Symbols are rotated to align with route direction:

```javascript
function calculateBearing(point1, point2) {
    const lat1 = point1.lat * (Math.PI / 180);
    const lat2 = point2.lat * (Math.PI / 180);
    const dLng = (point2.lng - point1.lng) * (Math.PI / 180);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360;
}
```

### Rendering Modes Comparison

| Mode | Pros | Cons | Use Case |
|------|------|------|----------|
| **Symbol along line** | Automatic spacing, clean | Limited control over placement | Dense routes |
| **Symbol** | Full control, precise angles | Manual point calculation | Sparse markers |
| **Line Pattern** | Continuous fill, decorative | Less precise, performance | Visual emphasis |

## 🛠️ Development

### Code Style
- ES6+ JavaScript (const, let, arrow functions, template literals)
- 4-space indentation
- Descriptive variable names (`mapInstance`, not `m`)
- Comments for complex logic
- Modular architecture (separate concerns)

### Git Workflow
⚠️ **IMPORTANT**: Never commit automatically! Always make code changes and wait for explicit "commit" instruction from the user.

### Adding a New Region

1. **Define diamond points** in `map-diamonds.js`:
```javascript
const mexicoDiamondPoints = [
    { lat: 19.432608, lng: -99.133209 },
    { lat: 19.432755, lng: -99.133088 },
    // ... more points
];
```

2. **Initialize in `initializeDiamonds()`**:
```javascript
const mexicoPointsLine = createDiamondLineData(mexicoDiamondPoints, "Mexico");
const mexicoPointsSymbols = createDiamondPointsData(mexicoDiamondPoints, "Mexico");
addDiamondSource(map, "mexico-line", mexicoPointsLine);
addDiamondSource(map, "mexico-symbols", mexicoPointsSymbols);
addDiamondLineLayer(map, "mexico-line");
addDiamondSymbolLayer(map, "mexico-symbols");
addDiamondPatternLayer(map, "mexico-line", "mexico-pattern");
```

3. **Update mode toggle arrays** in `applyDiamondMode()`:
```javascript
const lineLayerIds = ["brazil-line", "canada-line", "mexico-line"];
const symbolLayerIds = ["brazil-symbols", "canada-symbols", "mexico-symbols"];
const patternLayerIds = ["brazil-pattern", "canada-pattern", "mexico-pattern"];
```

4. **Update location click handler** in `setupLocationClickHandlers()`:
```javascript
const locationClicks = {
    brazil: { center: [-47.937845, -15.778195], zoom: 18 },
    mexico: { center: [-99.133209, 19.432608], zoom: 18 },
    canada: { center: [-113.489909, 53.647888], zoom: 18 }
};
```

## 📚 Resources

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)
- [TomTom Maps API Documentation](https://developer.tomtom.com/maps-api/documentation)
- [GeoJSON Specification](https://geojson.org/)
- [GeoJSON.io](https://geojson.io/) - Draw and test GeoJSON
- [Mercator Projection Explained](https://en.wikipedia.org/wiki/Mercator_projection)

## 🔒 Security

⚠️ **Never commit `config.js`** - it contains your API key and is in `.gitignore`

- Use `config.example.js` as template
- Keep API keys private
- Rotate keys if accidentally exposed

## 🐛 Troubleshooting

**Blank page?**
- Check browser console (F12) for errors
- Verify API key in `config.js` is correct
- Ensure `config.js` loads before map initialization

**Diamonds not appearing?**
- Zoom to level 17 or higher (minzoom: 17)
- Navigate to Brazil or Canada regions
- Check that diamond rendering mode is enabled

**Map not loading?**
- Check internet connection (tiles load from TomTom)
- Verify API key is valid and not expired
- Check TomTom API usage limits

**Measurements not working?**
- Click 📏 button or press M to activate
- Ensure you're clicking on the map (not UI elements)
- Try refreshing if SVG overlays get desynchronized

## 📝 Project Notes

### Completed
- ✅ Mercator scale factor calculation
- ✅ Three rendering modes (line, symbol, pattern)
- ✅ Interactive measurement tool
- ✅ Manual zoom/position controls
- ✅ Brazil and Canada diamond routes
- ✅ Modular architecture with separate concerns

## 📄 License

Personal learning/experimental project. Feel free to use and modify as needed.

## 🤝 Contributing

This is a playground project for learning map visualizations. Fork and experiment!

---

**Last Updated**: Project paused with full diamond visualization system, measurement tool, and interactive controls implemented.
