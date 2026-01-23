# Task 01: Restriction Markers - Architectural Analysis

## Problem Statement

We need to display diamond-shaped restriction markers at exactly 50-meter intervals along restricted road LineStrings. The key question is: **Where should the geometric calculation happen?**

## System Architecture Context

**Technology Stack:**
- **Tile Generation:** C++ map-tile-generator component (produces vector tiles)
- **Style Generation:** Pre-generated style JSON served by server
- **Style Management:** Kotlin SDK (can add/remove layers/features to style when needed)
- **Map Rendering:** Unity map renderer component (consumes MapLibre style JSON)
- **Data Format:** Vector tiles served by tile server
- **Architecture:** map-tile-generator → Tiles + Style (served by server) → Kotlin SDK (optional modifications) → Unity map renderer

---

## Core Constraint

**MapLibre styles cannot generate new geometry from existing geometry.**

- ✅ Styles can **render** existing features (LineStrings, Points, Polygons)
- ✅ Styles can **filter** features based on properties
- ✅ Styles can **apply visual properties** (color, size, rotation)
- ❌ Styles **cannot calculate** points along a LineString
- ❌ Styles **cannot create** new features that don't exist in the source
- ❌ Styles **cannot perform** distance calculations (50m intervals)

This is a fundamental architectural boundary in MapLibre GL.

---

## Available Options

### Option A: Pre-calculate Points in Vector Tiles (Preprocessing in map-tile-generator)

**Description:** During vector tile generation in the C++ map-tile-generator component, calculate point features at 50m intervals from LineStrings and include them as a separate layer in the tiles.

**Implementation:**

**C++ map-tile-generator - Tile Generation:**
```cpp
// In map-tile-generator component
std::vector<Point> generateRestrictionMarkers(const LineString& lineString) {
    double length = calculateLength(lineString);  // in meters
    std::vector<Point> markers;
    
    double distance = 25.0;  // Start at 25m for better centering
    while (distance < length) {
        Point point = pointAlong(lineString, distance);
        double bearing = calculateBearing(lineString, distance);
        
        point.properties["bearing"] = bearing;
        markers.push_back(point);
        
        distance += 50.0;
    }
    return markers;
}
// Include these points in "restriction-points" layer when generating tiles
```

**Kotlin SDK - Style Modification (if needed):**
```kotlin
// Kotlin SDK can add layer to existing style if not already present
fun addRestrictionMarkersLayer(style: StyleDefinition) {
    // Modify the pre-generated style served by server
    style.addLayer(SymbolLayer(
        id = "restriction-markers",
        source = "vector-tiles",
        sourceLayer = "restriction-points"
    ).apply {
        iconImage = "diamond-icon"
        iconRotate = Expression.get("bearing")
        iconRotationAlignment = "map"
    })
}
```

**MapLibre Style JSON (served by server, optionally modified by Kotlin SDK, consumed by Unity renderer):**
```json
{
  "id": "restriction-markers",
  "type": "symbol",
  "source": "vector-tiles",
  "source-layer": "restriction-points",
  "layout": {
    "icon-image": "diamond-icon",
    "icon-rotate": ["get", "bearing"],
    "icon-rotation-alignment": "map"
  }
}
```

**Pros:**
- ✅ Exact 50m spacing guaranteed
- ✅ Pure style-based rendering (no calculation in Unity renderer)
- ✅ Calculation happens once in map-tile-generator, served to all clients
- ✅ Efficient - leverages vector tile caching
- ✅ Works with Unity map renderer and other MapLibre-compatible clients
- ✅ Better performance - Unity renderer only renders, doesn't calculate
- ✅ Lower battery consumption
- ✅ Works offline with cached tiles
- ✅ Matches industry best practices (Google Maps, Mapbox, HERE)
- ✅ Kotlin SDK only modifies style when needed, no complex calculations

**Cons:**
- ❌ Larger tile size (~20-50% increase depending on road density)
- ❌ More complex tile generation pipeline in map-tile-generator (C++)
- ❌ Data duplication (LineString + Points both in tiles)
- ❌ Requires tile regeneration when spacing parameter changes
- ❌ Slower iteration during development
- ❌ Requires C++ development expertise

**Best For:**
- Production environments
- Unity-based applications
- High-scale deployments (thousands of roads)
- When restriction data changes infrequently (daily/weekly)
- **When you control the map-tile-generator component** ✅

---

### Option B: Calculate Points at Runtime (Client-Side)

**Description:** Client-side code calculates point positions when the map loads, using geometric libraries.

**Implementation (Web Prototype Example - Not for Unity):**
```javascript
// On map load (web development only):
const lineString = turf.lineString(coordinates);
const length = turf.length(lineString, { units: "meters" });
const markers = [];

for (let distance = 25; distance < length; distance += 50) {
    const point = turf.along(lineString, distance, { units: "meters" });
    const bearing = calculateBearing(lineString, distance);
    markers.push({ geometry: point.geometry, properties: { bearing } });
}

map.addSource('restriction-markers', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: markers }
});
```

**Pros:**
- ✅ Exact 50m spacing guaranteed
- ✅ Smaller tile size (only LineStrings)
- ✅ Fast iteration during development
- ✅ Easy to adjust spacing and experiment
- ✅ No tile regeneration needed for style changes
- ✅ Simple to understand and debug

**Cons:**
- ❌ Calculation on every map load/refresh
- ❌ Requires platform-specific implementation (JavaScript for web, not applicable to Unity)
- ❌ **Not compatible with Unity renderer** - Unity consumes style JSON only, cannot run calculation code
- ❌ Poor scalability - performance degrades with many roads
- ❌ Higher memory usage (calculation objects in memory)
- ❌ Battery drain on mobile devices
- ❌ Doesn't work offline without custom caching
- ❌ Every client must include and maintain calculation logic
- ❌ Duplicates work that map-tile-generator could do once

**Performance at Scale:**
- 100 roads × 20 markers = 2,000 points → Acceptable
- 1,000 roads × 20 markers = 20,000 points → Noticeable lag
- 10,000 roads × 20 markers = 200,000 points → Browser/app struggles

**Best For:**
- Development and prototyping (web only)
- Low-scale deployments (dozens to hundreds of roads)
- Web-only applications (NOT for Unity renderer)
- Rapid iteration and experimentation
- When map-tile-generator modifications are not feasible yet

**Unity Compatibility:** ❌ **NOT COMPATIBLE** - Unity renderer cannot execute calculation code

---

### Option C: Use Built-in `symbol-placement: "line"`

**Description:** Use MapLibre's built-in symbol placement along lines with `symbol-spacing` parameter.

**Implementation:**
```json
{
  "id": "restriction-markers",
  "type": "symbol",
  "source": "vector-tiles",
  "source-layer": "restricted-roads",
  "layout": {
    "symbol-placement": "line",
    "symbol-spacing": 250,
    "icon-image": "diamond-icon",
    "icon-rotation-alignment": "map"
  }
}
```

**Pros:**
- ✅ Pure style solution - works with vector tiles
- ✅ Automatic rotation along the line
- ✅ No preprocessing needed in Kotlin SDK
- ✅ No client-side calculation needed
- ✅ Efficient rendering by MapLibre engine

**Cons:**
- ❌ `symbol-spacing` is in **screen pixels**, not meters
- ❌ Spacing changes with zoom level:
  - Zoom 15: 250 pixels ≈ 1,200 meters
  - Zoom 18: 250 pixels ≈ 150 meters
  - Zoom 20: 250 pixels ≈ 38 meters
- ❌ Cannot achieve exact 50m spacing requirement
- ❌ Inconsistent visual appearance across zoom levels

**Best For:**
- When approximate spacing is acceptable
- When primary use case is at a specific zoom level
- Quick prototypes without exact requirements
- When neither map-tile-generator modification nor runtime calculation is desired

**Conclusion:** Does not meet the "exact 50m spacing" requirement.

---

## Detailed Analysis

### Performance Comparison

| Metric | Tiles (A) | Runtime Client (B) |
|--------|-----------|-------------------|
| Unity Compatibility | ✅ Full | ❌ None |
| Initial load time | Medium | N/A |
| Runtime calculation | None | N/A |
| Memory usage | Low | N/A |
| Network requests | 1 (tiles) | N/A |
| Unity performance | Excellent | N/A |
| Offline capability | Yes | N/A |
| Scalability | Excellent | N/A |
| Battery impact | Minimal | N/A |
| Component complexity | High (C++ tile gen) | N/A |
| Kotlin SDK role | Optional style modifications | None |

### Data Model Philosophy

**Key Question: What IS a restriction marker?**

**Interpretation 1: Derived Visual Representation**
- Markers are just "how we display" a restricted LineString
- The LineString is the single source of truth
- Markers are ephemeral, calculated for display
- **Supports:** Runtime calculation (Option B) or API (Option D)

**Interpretation 2: Geospatial Features**
- Markers represent real physical markers/signs on the road
- They exist at specific locations (every 50m)
- The LineString just connects them
- **Supports:** Pre-calculation in tiles (Option A)

**Industry Standard:** Major mapping platforms treat regularly-spaced markers as pre-calculated features in tiles.

**Architecture Pattern:** Heavy computation happens in map-tile-generator component. Style is pre-generated and served by server. Kotlin SDK can modify style when dynamic changes are needed. Unity renderer receives optimized, ready-to-render data via style JSON.

### Scalability Analysis

**Critical Question: How many restricted roads?**

| Scale | Roads | Markers | Recommended Option |
|-------|-------|---------|-------------------|
| Small | < 100 | < 2,000 | Option B acceptable for dev |
| Medium | 100-1,000 | 2K-20K | Option A recommended |
| Large | 1,000-10,000 | 20K-200K | Option A required |
| Very Large | > 10,000 | > 200K | Option A + tiling strategies |

**Performance Degradation (Option B):**
- At 1,000 roads: 200-500ms calculation time
- At 5,000 roads: 1-2 second calculation time (noticeable lag)
- At 10,000 roads: 3-5 second calculation time (poor UX)

### Flexibility & Maintenance

**Scenario: Change spacing from 50m to 30m**

| Option | Required Changes |
|--------|-----------------|
| A (Tiles) | Update map-tile-generator (C++), regenerate tiles once |
| B (Runtime) | Update client code, deploy to all platforms (NOT for Unity) |

**Scenario: Deploy to Unity**

| Option | Unity Support |
|--------|--------------|
| A (Tiles) | ✅ Works perfectly - Unity renderer consumes tiles and style |
| B (Runtime) | ❌ Impossible - Unity cannot run custom calculation code |

**Scenario: Add animation or interaction**

| Option | Complexity |
|--------|-----------|
| A (Tiles) | Style changes only - easy, Unity renders automatically |
| B (Runtime) | N/A - Not possible with Unity |

### Industry Best Practices

**How major map providers handle similar use cases:**

**Google Maps:**
- Traffic incidents, road closures → Pre-calculated Point features in tiles
- Road geometry → LineStrings in tiles
- Pattern: Fixed-position markers are pre-generated

**Mapbox:**
- POI markers, labels → Point features in tiles
- Road networks → LineStrings in tiles
- Pattern: Use vector tiles for all rendered geometry

**HERE Maps:**
- Safety cameras, signs → Point features in tiles
- Routes → LineStrings in tiles
- Pattern: Pre-calculate all feature positions

**Common Principle:** 
> "Vector tiles are the data API. Renderers (like Unity) render, they don't calculate geometry."

**Architecture Pattern:**
> "Heavy computation happens in specialized components (map-tile-generator, backend services). Style is pre-generated and served by server. Kotlin SDK can modify style when dynamic changes are needed. Unity renderer receives optimized, ready-to-render data via style JSON."

---

## Recommendation

### For Current Phase (Learning/Development)

**Use Option B (Runtime Calculation) for Web Prototype**

**Rationale:**
- Fast iteration and experimentation on web
- Easy to adjust spacing, styling, rotation
- Simple to understand and debug
- No map-tile-generator modifications needed yet
- Perfect for learning MapLibre concepts
- Current JavaScript implementation works for web-based exploration

**⚠️ IMPORTANT:** This is a **web prototype only** - not compatible with Unity renderer.

**Implementation:**
- Keep current Turf.js-based solution for web development only
- Document as "web prototype - NOT for Unity production"
- Use for prototyping and design validation
- **This code will not work in Unity renderer**

### For Production Deployment

**Use Option A (Pre-calculate Points in map-tile-generator → Vector Tiles)**

**Rationale:**
- **Required for Unity renderer compatibility**
- Better performance at any scale
- Cross-platform support (Unity, web, and other MapLibre clients)
- Lower renderer complexity - Unity just renders
- Industry-standard approach
- Future-proof architecture
- **Separates concerns: C++ tile generation, style served by server, optional Kotlin SDK modifications, Unity renders**
- Calculation happens once in map-tile-generator, served to all clients including Unity

**Migration Path:**
1. Design tile schema with separate "restriction-points" layer
2. Implement point calculation in **map-tile-generator (C++)** during tile generation
3. Use appropriate C++ geospatial library for geometric operations
4. Update pre-generated style to include "restriction-points" layer (or use Kotlin SDK to add it dynamically if needed)
5. Deploy tiles and updated style to server
6. Clients automatically render new data

### Hybrid Approach (Recommended)

**Development (Current - Web Prototype ONLY, not for Unity):**
```javascript
// Calculate points in JavaScript for fast iteration - WEB PROTOTYPE ONLY
// This approach will NOT work with Unity renderer
const markers = calculateRestrictionMarkers(lineString, 50);
map.addSource('restriction-markers', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: markers }
});
```

**Production (map-tile-generator → Tiles, Style served by server, Unity renderer):**

**C++ map-tile-generator - Tile Generation:**
```cpp
// In map-tile-generator component
std::vector<Feature> generateRestrictionMarkers(const LineString& lineString, double spacing = 50.0) {
    double length = calculateLength(lineString);  // in meters
    std::vector<Feature> markers;
    
    double distance = spacing / 2.0;  // Start at half spacing for centering
    while (distance < length) {
        Point point = pointAlong(lineString, distance);
        
        // Calculate bearing for proper rotation
        Point segmentStart = pointAlong(lineString, std::max(0.0, distance - 1.0));
        Point segmentEnd = pointAlong(lineString, std::min(length, distance + 1.0));
        double bearing = calculateBearing(segmentStart, segmentEnd);
        
        Feature feature;
        feature.geometry = point;
        feature.properties["bearing"] = bearing;
        markers.push_back(feature);
        
        distance += spacing;
    }
    return markers;
}
// Add to "restriction-points" layer in vector tiles
```

**Kotlin SDK - Style Modification (if layer not in pre-generated style):**
```kotlin
// Kotlin SDK can add layer to existing style if needed
fun addRestrictionMarkersLayer(style: StyleDefinition) {
    // Only needed if layer not included in pre-generated style
    style.addLayer(SymbolLayer(
        id = "restriction-markers",
        source = "vector-tiles",
        sourceLayer = "restriction-points"
    ).apply {
        iconImage = "diamond-icon"
        iconRotate = Expression.get("bearing")
        iconRotationAlignment = "map"
        iconAllowOverlap = true
        iconIgnorePlacement = true
        iconSize = Expression.interpolate(
            Expression.exponential(2.0),
            Expression.zoom(),
            Expression.stop(10, 0.1),
            Expression.stop(15, 0.5),
            Expression.stop(18, 1.5),
            Expression.stop(20, 3.0)
        )
    })
}
```

**Style JSON (served by server, or modified by Kotlin SDK):**
```json
{
  "id": "restriction-markers",
  "type": "symbol",
  "source": "vector-tiles",
  "source-layer": "restriction-points",
  "layout": {
    "icon-image": "diamond-icon",
    "icon-rotate": ["get", "bearing"],
    "icon-rotation-alignment": "map",
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
    "icon-size": [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      10, 0.1,
      15, 0.5,
      18, 1.5,
      20, 3
    ]
  }
}
```

**Benefits:**
- ✅ Fast development cycle with web prototype
- ✅ Proper production architecture for Unity renderer
- ✅ Clear separation: map-tile-generator generates data, server serves style, Kotlin SDK modifies when needed, Unity renders
- ✅ Same visual result in web prototype and Unity production
- ✅ Each component handles its specific responsibility
- ✅ Unity renderer stays simple - just renders optimized data

---

## Decision Factors

Use this checklist to make the final decision:

### Choose Option A (Tiles via map-tile-generator) if:
- [x] **You have Unity renderer** ← **THIS APPLIES TO YOU**
- [x] You control the map-tile-generator component
- [ ] You have > 1,000 restricted roads
- [ ] You need Unity-based application
- [ ] Restriction data changes daily or less frequently
- [ ] Performance and battery life are critical
- [ ] You want industry-standard architecture

**Unity Renderer Decision:** ✅ **Option A is REQUIRED for Unity compatibility**

### Choose Option B (Runtime Calculation) if:
- [ ] ~~You have < 100 restricted roads~~ **NOT APPLICABLE with Unity**
- [ ] ~~Web-only application~~ **NOT APPLICABLE - You have Unity**
- [ ] ~~Restriction data changes hourly~~
- [x] **Web prototype phase only** ← Use for learning, not Unity production
- [ ] ~~You cannot modify map-tile-generator yet~~
- [ ] ~~Performance is not critical~~

**Unity Renderer Decision:** ❌ **Option B is IMPOSSIBLE for Unity renderer**

---

## Implementation Roadmap

### Phase 1: Web Prototype (Current)
- ✅ Use JavaScript calculation with Turf.js for web testing only
- ✅ Validate visual design and spacing
- ✅ Test different zoom levels and use cases
- ✅ Gather user feedback
- 🔴 **Remember: This code will NOT work in Unity renderer - prototype only**

### Phase 2: Tile Schema Design
- [ ] Define "restriction-points" layer schema
- [ ] Determine required properties (bearing, marker type, etc.)
- [ ] Plan tile generation modifications in map-tile-generator (C++)
- [ ] Update pre-generated style to include new layer (or plan Kotlin SDK modification if dynamic)
- [ ] Design version/migration strategy

### Phase 3: map-tile-generator - Point Calculation Implementation
- [ ] Add appropriate C++ geospatial library to map-tile-generator
- [ ] Implement point calculation at 50m intervals in C++
- [ ] Implement bearing calculation in C++
- [ ] Add unit tests for 50m accuracy
- [ ] Generate test tiles from map-tile-generator

### Phase 4: Style Configuration
- [ ] Update pre-generated style to include "restriction-points" layer
- [ ] Configure layer properties (icon, rotation, sizing)
- [ ] Ensure style JSON references correct source-layer
- [ ] Verify style is compatible with Unity renderer
- [ ] (Optional) Implement Kotlin SDK modification logic if dynamic changes needed
- [ ] Test style JSON with test tiles in Unity

### Phase 5: Unity Production Deployment
- [ ] Deploy new tiles from map-tile-generator to tile server
- [ ] Deploy updated pre-generated style to server
- [ ] Deploy Kotlin SDK updates if dynamic modifications are needed
- [ ] Deploy to Unity renderer
- [ ] Monitor Unity performance metrics
- [ ] Validate accuracy in Unity builds
- [ ] Archive web prototype code (for reference only)

---

## Component Integration Notes

### map-tile-generator (C++)
**Required Capabilities:**
- Geometric calculations (line length, point along line, bearing)
- Feature property management
- Vector tile encoding (MVT format)

**Suggested Libraries:**
- [Mapbox Geometry](https://github.com/mapbox/geometry.hpp) - Geometric primitives
- [Protozero](https://github.com/mapbox/protozero) - Protocol buffer encoding
- Custom geometric algorithms or third-party spatial libraries

### Kotlin SDK (Style Modifications)
**Responsibilities:**
- Can add/remove layers from pre-generated style when needed
- Can modify layer properties (icons, sizing, rotation) dynamically
- Can add/remove sources or features
- Works with style served by server

**Example Dependencies:**
```kotlin
// For style JSON manipulation
implementation("com.mapbox.mapboxsdk:mapbox-sdk-geojson:5.9.0")
```

### Performance Considerations
- **map-tile-generator:** Cache calculations, optimize C++ code, consider parallel processing
- **Style Server:** CDN caching for style delivery
- **Kotlin SDK:** Efficient style modifications when needed
- **Tile Server:** CDN caching for tile delivery
- **Unity Renderer:** Optimized rendering engine, no calculation overhead

---

## Conclusion

**The architectural decision path is clear:**

**For Development:** 
Runtime calculation (Option B) is acceptable for rapid prototyping and learning.

**For Production (Unity Renderer):** 
Pre-calculating points in map-tile-generator and serving via vector tiles (Option A) is the **REQUIRED** approach for:
- **Unity renderer compatibility** (only option that works)
- Better performance and scalability
- Cross-platform consistency
- Industry-standard architecture

**The Architecture Advantage:**
Having specialized components for different responsibilities makes Option A straightforward:
- Heavy geometric calculations happen once in map-tile-generator (C++)
- Optimized data structures generated and cached in tiles
- Style is pre-generated and served by server
- Kotlin SDK can modify style dynamically when needed
- Unity renderer receives ready-to-render features
- Clean separation of concerns: map-tile-generator computes geometry, server provides style, Kotlin SDK modifies when needed, Unity renders

**Key Insights:**

**For MapLibre/Unity:**
> MapLibre's architecture separates data generation from rendering. The map-tile-generator is the ideal place for geometry preprocessing (Option A). Style is pre-generated and served by server. Kotlin SDK can modify style when dynamic changes are needed. Unity renderer focuses on efficient rendering, not geometric calculations.

**For Unity Renderer Architecture:**
> Unity renderer is a rendering-only component. It consumes MapLibre style JSON and vector tiles, then renders efficiently. All logic (tile generation, style generation, data processing) happens in specialized components (map-tile-generator, style server, Kotlin SDK). Unity receives pre-computed data and styles, then renders. This clean separation enables high performance in Unity.

**Recommended Path:**
1. ✅ Continue with JavaScript calculation for web prototype learning only
2. ✅ Implement calculation logic in map-tile-generator (C++)
3. ✅ Update pre-generated style to include new layer (or use Kotlin SDK for dynamic additions)
4. ✅ Move to tile-based approach for Unity production
5. ✅ This gives you speed now (web prototype) and Unity compatibility later (production)

**Architecture Flow for Unity:**
```
map-tile-generator (C++) → Vector Tiles → Tile Server
                                              ↓
Style Server → Pre-generated Style JSON → Kotlin SDK (optional modifications)
                                              ↓
                                        Unity Renderer
                                              ↓
                                    Rendered Map Display
```

---

## Resources

- [MapLibre Style Specification - Symbol Layer](https://maplibre.org/maplibre-style-spec/layers/#symbol)
- [MapLibre Expressions](https://maplibre.org/maplibre-style-spec/expressions/)
- [Vector Tile Specification](https://github.com/mapbox/vector-tile-spec)
- [Turf.js Documentation](https://turfjs.org/) - For web prototype
- [Mapbox Geometry C++](https://github.com/mapbox/geometry.hpp) - For map-tile-generator

---

**Document Version:** 2.0  
**Last Updated:** 2024  
**Status:** Analysis Complete - **Unity Renderer Architecture Identified**  
**Decision:** **Option A (map-tile-generator → Tiles) REQUIRED** for Unity renderer compatibility, Option B acceptable for web prototype only