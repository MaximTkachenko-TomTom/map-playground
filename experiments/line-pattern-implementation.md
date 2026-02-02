# Line-Pattern Implementation for Diamonds

## Overview
Added a third rendering mode for diamonds using MapLibre's `line-pattern` paint property. This creates a repeating pattern of diamonds along the LineString geometry.

## Implementation Details

### 1. Pattern Image Generation
**Function:** `createDiamondPatternImage(color, outlineColor)`

Creates a canvas-based pattern image with repeating diamonds:
- **Canvas size:** 600px wide × 120px tall
- **Diamond size:** 50px (rotated 45 degrees)
- **Spacing:** 120px between diamond centers
- **Features:**
  - Transparent background (only diamonds visible)
  - Configurable fill color and outline color
  - Smooth rendering enabled

```javascript
const canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 120;
// Draws repeating diamonds at 120px intervals
```

### 2. Diamond Shape Rendering
**Function:** `drawDiamondShape(ctx, cx, cy, size, fillColor, strokeColor)`

Draws individual diamond shapes on the canvas:
- Creates a diamond by rotating a square 45 degrees
- Fills with specified color
- Strokes with outline color
- Used by the pattern generation function

### 3. Pattern Layer Creation
**Function:** `addDiamondPatternLayer(map, sourceId, layerId, patternImageName)`

Creates a line layer with the pattern applied:
- Uses the same LineString source as the "line" mode
- Applies the diamond pattern via `line-pattern` paint property
- Line width (120px) controls pattern height
- Transparent line color ensures only pattern is visible

```javascript
paint: {
    'line-color': 'rgba(0,0,0,0)',  // Transparent
    'line-width': 120,               // Pattern height
    'line-pattern': patternImageName,
}
```

### 4. Integration in Initialization
**In `initializeDiamonds()`:**

- Creates pattern images for Brazil and Canada regions
- Converts canvas to ImageData format
- Registers patterns with MapLibre using `map.addImage()`
- Calls `addDiamondPatternLayer()` for each region

```javascript
const brazilPatternCanvas = createDiamondPatternImage(regions[0].color, regions[0].outlineColor);
map.addImage('diamond-pattern-brazil', brazilPatternImageData);
addDiamondPatternLayer(map, 'brazil-line', 'brazil-pattern', 'diamond-pattern-brazil');
```

## Layer IDs and Sources

| Mode | Line Layer | Symbol Layer | Pattern Layer | Source |
|------|-----------|-------------|---------------|---------|
| Brazil | brazil-line | brazil-symbols | brazil-pattern | brazil-line (LineString) |
| Canada | canada-line | canada-symbols | canada-pattern | canada-line (LineString) |

All three modes share the same LineString sources (`brazil-line`, `canada-line`).

## Mode Toggle Integration

The existing `applyDiamondMode()` function handles visibility:
- `mode: "line"` → Shows line-placement symbol layers
- `mode: "symbol"` → Shows point-based symbol layers  
- `mode: "line-pattern"` → Shows line-pattern layers

```javascript
case "line-pattern":
    patternLayerIds.forEach((id) => {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", "visible");
        }
    });
    break;
```

## Visual Characteristics

### Advantages
- ✅ Smooth, continuous visual pattern
- ✅ Single layer per region (efficient)
- ✅ Automatically tiles along entire line length
- ✅ Region-specific colors via pattern generation

### Limitations
- ❌ Diamonds don't rotate with line direction (always horizontal)
- ❌ Pattern frequency increases with zoom (appears denser at higher zoom)
- ❌ Less precise spacing control compared to symbol-placement
- ❌ No per-feature customization (all diamonds identical)

## File Changes

**map-diamonds.js additions:**
- `createDiamondPatternImage()` - 31 lines
- `drawDiamondShape()` - 27 lines
- `addDiamondPatternLayer()` - 16 lines
- Updated `initializeDiamonds()` - Added pattern creation and registration

**Total new code:** ~74 lines

## Testing

To test the line-pattern mode:
1. Open map in browser
2. Select "Line Pattern" from the Diamond Mode dropdown
3. Zoom to Brazil (≥17) or Canada (≥17)
4. Observe repeating diamond patterns along the routes

The pattern works alongside existing modes without conflicts - all three can be toggled independently.