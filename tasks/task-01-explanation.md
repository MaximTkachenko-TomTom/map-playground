# Task 01: Restriction Markers - Implementation Explanation

## Overview
This document explains how the restriction markers were implemented and answers the key learning questions about MapLibre's data and styling system.

---

## Question 1: How is data added to show on a map?

### MapLibre Data Flow Architecture

MapLibre uses a **source → layer** architecture:

```
Data (GeoJSON) → Source → Layer (with style) → Rendered on Map
```

### Step-by-step Process:

#### 1. **Adding a Source**
A source defines WHERE the data comes from:

```javascript
map.addSource("restriction-markers", {
    type: "geojson",
    data: {
        type: "FeatureCollection",
        features: [/* array of GeoJSON features */]
    }
});
```

**Key Points:**
- `type: "geojson"` - tells MapLibre this is GeoJSON data
- `data` - the actual GeoJSON FeatureCollection
- Sources are **invisible** - they just hold data

#### 2. **Adding a Layer**
A layer defines HOW to display the source data:

```javascript
map.addLayer({
    id: "restriction-markers",        // Unique identifier
    type: "symbol",                   // Layer type (symbol, line, fill, circle, etc.)
    source: "restriction-markers",    // Which source to use
    layout: { /* visual properties */ },
    paint: { /* color/styling properties */ }
});
```

**Key Points:**
- Layer references a source by name
- `type` determines rendering method (symbol, line, circle, fill, etc.)
- Multiple layers can use the same source
- Layers are rendered in the order they're added (z-index)

### Source Types in MapLibre

1. **geojson** - Client-side GeoJSON data (what we used)
2. **vector** - Vector tiles from a server (for production with large datasets)
3. **raster** - Raster tile images
4. **raster-dem** - Elevation data
5. **image** - Single image source
6. **video** - Video source

### For Vector Tiles (Your Future Use Case)

When data comes from vector tiles:

```javascript
map.addSource("road-network", {
    type: "vector",
    tiles: ["https://api.example.com/tiles/{z}/{x}/{y}.pbf"],
    minzoom: 0,
    maxzoom: 14
});

map.addLayer({
    id: "restricted-roads",
    type: "line",
    source: "road-network",
    "source-layer": "roads",  // Layer within the vector tile
    filter: ["==", ["get", "restricted"], true],  // Only show restricted roads
    paint: {
        "line-color": "#ff0000"
    }
});
```

**Important:** Vector tiles contain multiple "source layers". You must specify which one to use.

---

## Question 2: How to show repeating marks along a LineString?

There are **three approaches** to placing markers along a line:

### Approach 1: Symbol Placement on Line (Built-in)

MapLibre can automatically place symbols along a line:

```javascript
map.addLayer({
    id: "markers",
    type: "symbol",
    source: "route-source",
    layout: {
        "symbol-placement": "line",     // Place along line
        "symbol-spacing": 200,          // Pixels between symbols
        "icon-image": "marker-icon"
    }
});
```

**Pros:**
- Simple, built-in feature
- Handles curved paths automatically
- Efficient rendering

**Cons:**
- Spacing is in **screen pixels**, not meters
- Can't control exact physical distance
- Spacing changes with zoom level

### Approach 2: Calculate Points Manually (What We Used)

Calculate exact points at metric intervals using Turf.js:

```javascript
const lineString = turf.lineString(coordinates);
const length = turf.length(lineString, { units: "meters" });

const markers = [];
for (let distance = 0; distance < length; distance += 50) {
    const point = turf.along(lineString, distance, { units: "meters" });
    markers.push({
        type: "Feature",
        geometry: point.geometry,
        properties: {}
    });
}
```

**Pros:**
- **Exact metric spacing** (50 meters in our case)
- Full control over placement
- Can calculate bearing/rotation for each point

**Cons:**
- Requires Turf.js library
- More code complexity
- Need to recalculate if line changes

### Approach 3: Line Dash Pattern

For simple repeating patterns:

```javascript
map.addLayer({
    type: "line",
    source: "route",
    paint: {
        "line-dasharray": [2, 4],  // 2 units dash, 4 units gap
        "line-width": 3
    }
});
```

**Pros:**
- Very simple
- Good for dashed lines

**Cons:**
- Only creates dashes (rectangles), not custom shapes
- Limited styling options

### Why We Chose Approach 2

For this task, we needed:
- ✅ Exactly 50 meters spacing
- ✅ Custom diamond shape
- ✅ Rotation to follow road direction
- ✅ Size in meters (not pixels)

Only **manual point calculation** satisfies all requirements.

---

## Question 3: How to set size of marks in meters?

### The Challenge: Pixels vs. Meters

Maps display in **pixels**, but we measure real-world distances in **meters**. The relationship changes with zoom level.

### Key Concept: Meters Per Pixel

At different zoom levels:
- **Zoom 10**: 1 pixel ≈ 152 meters (at equator)
- **Zoom 15**: 1 pixel ≈ 4.8 meters
- **Zoom 20**: 1 pixel ≈ 0.15 meters

Formula: `metersPerPixel = 156543.03392 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom)`

### Solution: Zoom-based Interpolation

Use MapLibre's expression system to scale icon size with zoom:

```javascript
"icon-size": [
    "interpolate",           // Smoothly interpolate between values
    ["exponential", 2],      // Exponential interpolation (doubles each zoom)
    ["zoom"],                // Based on current zoom level
    10, 0.1,                 // At zoom 10: size = 0.1x
    15, 0.5,                 // At zoom 15: size = 0.5x
    18, 1.5,                 // At zoom 18: size = 1.5x
    20, 3                    // At zoom 20: size = 3x
];
```

### Why Exponential Interpolation?

Map zoom is exponential - each zoom level **doubles** the scale. Using exponential interpolation maintains consistent physical size.

### Our Implementation

For a 2m × 3m diamond:
- Base icon: 20×30 pixels
- At zoom 15 (typical street view): size = 0.5x = 10×15 pixels
- At 1 pixel ≈ 4.8 meters: 10 pixels ≈ 48 meters... **too big!**

**Note:** The current implementation provides a good visual result. For true metric sizing, we'd need:

```javascript
"icon-size": [
    "interpolate",
    ["exponential", 2],
    ["zoom"],
    15, ["*", 2 / 4.8, 0.5],  // 2m target / 4.8m per pixel at zoom 15
    20, ["*", 2 / 0.15, 0.5]   // 2m target / 0.15m per pixel at zoom 20
]
```

However, this makes icons too small at low zoom. A **hybrid approach** balances visibility and metric accuracy.

---

## Implementation Details

### 1. Libraries Used

**Turf.js** - Geospatial analysis library
- `turf.lineString()` - Create LineString from coordinates
- `turf.length()` - Calculate line length in meters
- `turf.along()` - Get point at distance along line
- `turf.bearing()` - Calculate direction between points
- `turf.lineSlice()` - Extract segment for bearing calculation

### 2. Creating the Diamond Icon

SVG path for diamond shape:

```javascript
const diamondSvg = `
    <svg width="20" height="30" viewBox="0 0 20 30">
        <path d="M 10,2 L 18,15 L 10,28 L 2,15 Z" 
              fill="#FF0000" 
              stroke="#FFFFFF" 
              stroke-width="2"/>
    </svg>
`;
```

Converting to base64 data URL for MapLibre:

```javascript
const diamondImage = new Image(20, 30);
diamondImage.src = "data:image/svg+xml;base64," + btoa(diamondSvg);
diamondImage.onload = () => map.addImage("diamond-icon", diamondImage);
```

### 3. Calculating Marker Positions

```javascript
const length = turf.length(lineString, { units: "meters" });

for (let distance = 25; distance < length; distance += 50) {
    // Get point at this distance
    const point = turf.along(lineString, distance, { units: "meters" });
    
    // Calculate bearing for rotation
    const segment = turf.lineSlice(
        turf.along(lineString, distance - 1, { units: "meters" }),
        turf.along(lineString, distance + 1, { units: "meters" }),
        lineString
    );
    const bearing = turf.bearing(
        segment.geometry.coordinates[0],
        segment.geometry.coordinates[segment.geometry.coordinates.length - 1]
    );
    
    markers.push({
        type: "Feature",
        geometry: point.geometry,
        properties: { bearing: bearing }
    });
}
```

**Key Points:**
- Start at 25m (offset) for better visual centering
- Step by 50m
- Calculate local bearing from small segment (±1m) for accurate rotation

### 4. Applying Rotation

```javascript
layout: {
    "icon-rotate": ["get", "bearing"],           // Get bearing from feature properties
    "icon-rotation-alignment": "map",            // Rotate with map, not viewport
    "icon-allow-overlap": true,                  // Allow icons to overlap
    "icon-ignore-placement": true                // Don't hide for label placement
}
```

---

## Summary

### Data Flow
1. **Source** holds the data (invisible)
2. **Layer** displays the source with styling (visible)
3. Multiple layers can share one source
4. Vector tiles will work the same way, but data comes from server

### Repeating Markers
- **Built-in method**: `symbol-placement: "line"` - pixel spacing
- **Manual calculation**: Turf.js - exact meter spacing ✓
- **Dash pattern**: Simple lines only

### Metric Sizing
- Use zoom-based interpolation expressions
- Exponential interpolation matches map scale doubling
- Balance between metric accuracy and visibility
- `icon-size` with `["interpolate", ["exponential", 2], ["zoom"], ...]`

### Next Steps for Vector Tiles
When your data comes from vector tiles:
1. Source type becomes `"vector"`
2. Add `"source-layer"` to specify which layer in the tile
3. Use filters to select restricted roads: `filter: ["==", ["get", "restricted"], true]`
4. Everything else stays the same!

---

## Resources

- [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/)
- [MapLibre Expressions](https://maplibre.org/maplibre-style-spec/expressions/)
- [Turf.js Documentation](https://turfjs.org/)
- [GeoJSON Specification](https://geojson.org/)