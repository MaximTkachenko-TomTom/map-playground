# GitHub Copilot Instructions

## Project Overview

This is an interactive map playground project using MapLibre GL JS with TomTom Maps API. The project is designed for experimenting with map visualizations, GeoJSON routes, and interactive mapping features.

## Technology Stack

- **MapLibre GL JS** (v5.16.0) - Open-source mapping library
- **TomTom Maps API** - Map tiles and styling
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5/CSS3** - Modern web standards

## Project Structure

```
map-playground/
├── map.html           # Main map application
├── config.js          # API keys (gitignored, not committed)
├── config.example.js  # Template for API configuration
├── .zed/              # Zed editor tasks
│   └── tasks.json     # Task definitions for opening map
└── .github/           # GitHub configuration
    └── copilot-instructions.md
```

## Code Style & Conventions

- Use modern ES6+ JavaScript features (const, let, template literals, arrow functions)
- Prefer `const` over `let` when variables don't change
- Use descriptive variable names (e.g., `mapInstance`, `routeData`, not `m`, `r`)
- Keep functions small and focused on a single responsibility
- Add comments for complex logic or non-obvious implementations
- Use consistent indentation (4 spaces)

## API Key Management

- **NEVER hardcode API keys** in `map.html` or any committed files
- Always use `CONFIG.TOMTOM_API_KEY` from `config.js`
- `config.js` is gitignored and contains sensitive keys
- `config.example.js` provides a template for other developers

## MapLibre GL JS Patterns

- Initialize map with `new maplibregl.Map()`
- Wait for `map.on('load')` before adding sources/layers
- Use GeoJSON format for geographic data
- Style layers with `addLayer()` using `paint` and `layout` properties
- Common layer types: `line`, `fill`, `circle`, `symbol`

## Development Workflow

- Use **Ctrl+R** shortcut to open map in browser (Zed task)
- Test changes by refreshing the browser
- Map is centered on San Francisco by default: `[-122.486052, 37.830348]`

## Current Features

1. Interactive map with pan/zoom
2. GeoJSON route visualization (red line)
3. TomTom Maps basic street light style
4. Full-screen map layout

## Common Tasks & Examples

### Adding a New Route Layer

```javascript
map.addSource('my-route', {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [/* array of [lng, lat] pairs */]
        }
    }
});

map.addLayer({
    id: 'my-route-layer',
    type: 'line',
    source: 'my-route',
    paint: {
        'line-color': '#ff0000',
        'line-width': 3
    }
});
```

### Adding Markers

```javascript
const marker = new maplibregl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
```

### Adding Popups

```javascript
const popup = new maplibregl.Popup()
    .setLngLat([longitude, latitude])
    .setHTML('<h3>Title</h3><p>Description</p>')
    .addTo(map);
```

## Guidelines for Copilot

When suggesting code:
- Ensure API key is referenced from `CONFIG.TOMTOM_API_KEY`
- All map operations that add sources/layers should be inside `map.on('load')` callback
- Use template literals for dynamic strings
- Prefer declarative GeoJSON structures over imperative drawing
- Include error handling for map load failures
- Consider mobile responsiveness (viewport meta tag already set)
- Follow MapLibre GL JS best practices and documentation

## Goals & Use Cases

This project is for:
- Learning map visualization techniques
- Prototyping route displays
- Experimenting with GeoJSON data
- Testing map interactions and controls
- Exploring different map styles and layers

## Notes

- Map requires internet connection (loads tiles from TomTom API)
- TomTom API key needed for map to render
- Project uses CDN-hosted libraries (no build step required)