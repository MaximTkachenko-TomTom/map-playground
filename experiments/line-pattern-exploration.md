# Line-Pattern Exploration for MapLibre GL JS

## Overview
In MapLibre GL JS, a "line-pattern" is a paint property for line layers that allows you to apply a repeating pattern along a line. However, it's important to understand what this does and doesn't do.

## Key Concepts

### What "line-pattern" Does
- **line-pattern** is a paint property that tiles an image along a line
- It repeats a small pattern image at regular intervals along the LineString
- The pattern is specified by providing the name of an image in the map's image set
- The image is repeated based on the line's pixel length and the pattern's dimensions

### What "line-pattern" Does NOT Do
- It does NOT automatically place individual symbols at specific points
- It does NOT calculate spacing based on geographic distance
- It does NOT allow per-feature rotation like symbol layers can

## Current Diamond Implementation

### Mode 1: "Along Line" (symbol-placement: line)
```javascript
map.addLayer({
    id: 'brazil-line',
    type: 'symbol',
    source: 'brazil-symbols',
    layout: {
        'symbol-placement': 'line',      // Key: places symbols along the line
        'icon-image': 'diamond-icon',
        'symbol-spacing': 150,           // 150 pixels between symbols
        'icon-rotate': 90,
        'icon-rotation-alignment': 'map',
    }
});
```
**Advantages:**
- Automatic spacing control via `symbol-spacing`
- Can rotate each symbol independently
- Respects line geometry naturally
- Already working perfectly in the project

### Mode 2: "Symbols" (point-based)
```javascript
map.addLayer({
    id: 'brazil-symbols',
    type: 'symbol',
    source: 'brazil-symbols',
    layout: {
        'icon-image': 'diamond-icon',
        'icon-rotate': ['get', 'bearing'],  // Use pre-calculated bearing
    }
});
```
**Advantages:**
- Places symbols at exact predefined points
- Can rotate based on bearing to next point
- Already working perfectly in the project

## Line-Pattern Option Analysis

### How Line-Pattern Works
```javascript
map.addLayer({
    id: 'brazil-pattern',
    type: 'line',
    source: 'brazil-line',  // Use the LineString source
    paint: {
        'line-color': '#transparent',     // Don't draw the line itself
        'line-width': 0,
        'line-pattern': 'diamond-pattern' // Name of image in map
    }
});
```

### Constraints with Line-Pattern
1. **Fixed pattern image size**: The image must be pre-sized; you can't use interpolation like with symbols
2. **No rotation**: The pattern follows the line but individual diamonds can't rotate to match bearing
3. **No dynamic spacing**: Pattern repeats based on pixel size, not geographic distance
4. **At high zoom levels**: Pattern frequency changes (more repetitions) as line becomes longer
5. **No per-feature properties**: Can't vary pattern or spacing by properties

### Trade-offs

**Advantages of line-pattern:**
- Simpler rendering (one texture tile vs. many symbols)
- Potentially better performance at very high density
- Creates a continuous visual flow

**Disadvantages of line-pattern:**
- Less precise control over spacing and placement
- Can't rotate individual diamonds to show direction
- Doesn't scale well with zoom (pattern gets more dense)
- Requires a pre-made pattern image (not just the diamond icon)

## Recommendation

The **"Along Line" mode (symbol-placement: line)** is superior for this use case because:

1. ✅ **Better control**: `symbol-spacing` gives precise pixel-based spacing
2. ✅ **Rotation support**: Each diamond can rotate to show bearing/direction
3. ✅ **Already working**: No need to create a new pattern image
4. ✅ **Zoom responsive**: Spacing adjusts naturally with zoom
5. ✅ **Better performance**: Modern browsers handle symbol rendering efficiently

## If You Still Want to Try Line-Pattern

To use line-pattern, you would need to:

1. **Create a pattern image**: 
   - Tile the diamond icon with proper spacing
   - Create a rectangular image that contains multiple diamonds
   - Register it as `diamond-pattern` in the map

2. **Create a line layer**:
   ```javascript
   map.addLayer({
       id: 'brazil-pattern',
       type: 'line',
       source: 'brazil-line',
       paint: {
           'line-color': 'transparent',
           'line-width': 20,  // Must accommodate pattern height
           'line-pattern': 'diamond-pattern'
       }
   });
   ```

3. **Handle zoom scaling**:
   - Pattern frequency increases with zoom (more diamonds visible)
   - Would need to potentially use different pattern images at different zoom levels
   - Or accept that the visual density changes

## Conclusion

For drawing diamonds along a LineString:
- **Mode 1 (Along Line)**: ⭐⭐⭐⭐⭐ Already perfect, keep using
- **Mode 2 (Symbols)**: ⭐⭐⭐⭐⭐ Already perfect, keep using  
- **Mode 3 (Line-Pattern)**: ⭐⭐⭐ Technically possible but inferior to Mode 1

The existing "Along Line" mode is the best solution for this use case.
