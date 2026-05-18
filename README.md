# SCi-Discover Coverage Analyser

Analytics web app built for Raytheon UK as part of a 2nd-year university group project. Visualises satellite product geographic coverage data on an interactive Leaflet map.

> **Note:** The SCi-Discover API credentials have expired. The app runs in **demo mode** with static sample data — all map, chart, mission, and scene interactions are fully functional.

Demo: [youtu.be/8O_TkUh7Emc](https://youtu.be/8O_TkUh7Emc)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML / CSS / JS |
| Map | Leaflet 1.9.4 + leaflet.draw + leaflet.markercluster |
| Geospatial | Turf.js 6.5.0 |
| Charts | Chart.js |
| Backend | Node.js + Express (static file server only) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+

---

## Setup

```bash
cd Server
npm install
npm start
```

Then open: [http://localhost:5000/Pages/MainPage.html](http://localhost:5000/Pages/MainPage.html)

---

## Project Structure

```
Raytheon/
├── Assets/          # Fonts and SVG logos
├── CSS/             # Stylesheet
├── Pages/           # MainPage.html (single-page app)
├── Scripts/
│   ├── map.js       # Map init, drawing tools, coverage calc, charts
│   ├── fetch_auth.js# Demo data, mission/scene rendering
│   └── Script.js    # Tab switching, panel toggle
├── Server/          # Express static file server
└── data/            # UK regions GeoJSON
```

---

## Features

- Interactive Leaflet map with drawing tools (polygon, rectangle, circle, polyline, marker)
- Coverage % calculation using Turf.js intersection against UK regions GeoJSON
- Product marker cluster with per-product footprint overlay
- Mission list with click-to-highlight footprints on the mission map
- Double-click mission to drill into scene view with frame count
- Timeline bar chart and historical coverage histogram (Chart.js)
- Collapsible side panels

---
