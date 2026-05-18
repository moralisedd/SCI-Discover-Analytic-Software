// Static file server — the SCi-Discover API credentials have expired.
// This server exists solely to serve the app over HTTP (required for
// Leaflet tile loading and the /data/regions.geojson fetch).

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
