# Map Playground

An interactive map visualization project using MapLibre GL JS with TomTom Maps API for experimenting with routes, markers, and GeoJSON data.

## Features

- 🗺️ Interactive map with pan and zoom controls
- 🛣️ GeoJSON route visualization
- 📍 TomTom Maps integration
- ⚡ Fast development with Zed editor tasks
- 🔒 Secure API key management

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- TomTom Maps API key ([Get one here](https://developer.tomtom.com/))
- Optional: Python 3 for local server

### Setup

1. Clone or download this repository

2. Create your config file:
   ```bash
   cp config.example.js config.js
   ```

3. Edit `config.js` and add your TomTom API key:
   ```javascript
   const CONFIG = {
       TOMTOM_API_KEY: 'your-actual-api-key-here'
   };
   ```

4. Open `map.html` in your browser:
   - **Direct**: Double-click `map.html`
   - **Local Server**: Run `python3 -m http.server 8000` and visit `http://localhost:8000/map.html`
   - **Zed Editor**: Press `Ctrl+R` (if configured)

## Technology Stack

- [MapLibre GL JS](https://maplibre.org/) - Open-source mapping library
- [TomTom Maps API](https://developer.tomtom.com/) - Map tiles and styling
- Vanilla JavaScript - No frameworks or build tools required

## Project Structure

```
map-playground/
├── map.html              # Main map application
├── config.js             # Your API keys (gitignored)
├── config.example.js     # Config template
├── .gitignore           # Git ignore rules
├── .zed/                # Zed editor configuration
│   └── tasks.json       # Editor tasks
└── .github/             # GitHub configuration
    └── copilot-instructions.md
```

## Development

### Zed Editor Integration

If you're using Zed editor, this project includes pre-configured tasks:

- **Ctrl+R** - Open map in browser
- Run "Start Local Server" task - Start Python HTTP server on port 8000

### Making Changes

1. Edit `map.html`
2. Refresh your browser to see changes
3. Use browser DevTools (F12) to debug

### Common Modifications

**Change Map Center:**
```javascript
center: [-122.486052, 37.830348], // [longitude, latitude]
zoom: 15,
```

**Change Map Style:**
Replace the style URL in the map initialization. Available TomTom styles:
- `basic_street-light-driving`
- `basic_street-dark-driving`
- `basic_street-light`
- `basic_street-dark`

**Add a Marker:**
```javascript
new maplibregl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
```

**Add a Custom Route:**
```javascript
map.addSource('custom-route', {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [
                [lng1, lat1],
                [lng2, lat2],
                // ... more coordinates
            ]
        }
    }
});

map.addLayer({
    id: 'custom-route',
    type: 'line',
    source: 'custom-route',
    paint: {
        'line-color': '#0000ff',
        'line-width': 4
    }
});
```

## Security

⚠️ **Important**: Never commit your `config.js` file with real API keys!

- `config.js` is in `.gitignore` and won't be committed
- Use `config.example.js` as a template
- Keep your API keys private

## Resources

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)
- [TomTom Maps API Documentation](https://developer.tomtom.com/maps-api/documentation)
- [GeoJSON Specification](https://geojson.org/)
- [GeoJSON.io](https://geojson.io/) - Draw and test GeoJSON

## License

This is a personal playground project. Feel free to use and modify as needed.

## Contributing

This is a learning/experimental project. Feel free to fork and experiment!

## Troubleshooting

**Blank page?**
- Check browser console (F12) for errors
- Verify your API key is correct in `config.js`
- Ensure `config.js` is loaded before the map initialization

**Map not loading?**
- Check internet connection (map tiles load from TomTom servers)
- Verify API key is valid and not expired
- Check TomTom API usage limits

**Route not showing?**
- Ensure coordinates are in `[longitude, latitude]` format (not lat, lng)
- Verify GeoJSON structure is valid
- Check that `addSource` and `addLayer` are called inside `map.on('load')` callback