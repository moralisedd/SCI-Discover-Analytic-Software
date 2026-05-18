const mapOptions = {
    center: [53.383331, -1.466667],
    zoom: 6,
};

const map = new L.map('map-container', mapOptions);
const tileLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(tileLayer);

// Placeholder mission records used to populate the timeline and coverage histogram.
// These are replaced by live API data once missions are fetched.
const missionRecords = {
    '2020-0':  { missions: 2,  coverage: 50  },
    '2020-1':  { missions: 3,  coverage: 70  },
    '2020-2':  { missions: 1,  coverage: 30  },
    '2021-0':  { missions: 4,  coverage: 100 },
    '2021-5':  { missions: 5,  coverage: 120 },
    '2022-3':  { missions: 6,  coverage: 150 },
    '2023-7':  { missions: 8,  coverage: 200 },
    '2024-11': { missions: 10, coverage: 300 },
    '2025-0':  { missions: 5,  coverage: 120 },
    '2025-1':  { missions: 3,  coverage: 90  },
    '2025-2':  { missions: 7,  coverage: 150 },
    '2025-3':  { missions: 9,  coverage: 180 },
    '2025-4':  { missions: 6,  coverage: 140 },
    '2025-5':  { missions: 4,  coverage: 100 },
    '2025-6':  { missions: 8,  coverage: 200 },
    '2025-7':  { missions: 2,  coverage: 50  },
    '2025-8':  { missions: 3,  coverage: 70  },
    '2025-9':  { missions: 5,  coverage: 120 },
    '2025-10': { missions: 7,  coverage: 150 },
    '2025-11': { missions: 10, coverage: 300 },
};

// Tracks whether each product's footprint polygon is currently visible.
const footprintVisibility = {};


// Timeline chart

function initializeTimeChart() {
    // Append to the map column so absolute positioning is scoped to that box
    const mapItem = document.querySelector('.map.item-2');

    const timeChartContainer = document.createElement('div');
    timeChartContainer.id = 'time-chart-container';
    mapItem.appendChild(timeChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'time-chart';
    canvas.style.width = '400rem';
    canvas.style.height = '100%';
    timeChartContainer.appendChild(canvas);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'time-chart-toggle';
    toggleBtn.innerHTML = '&#9660; Timeline';
    mapItem.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', toggleTimeChart);

    updateTimeChart();
}

function toggleTimeChart() {
    const container = document.getElementById('time-chart-container');
    const toggleBtn = document.querySelector('.time-chart-toggle');
    const isCollapsed = container.classList.toggle('collapsed');

    if (isCollapsed) {
        toggleBtn.innerHTML = '&#9650; Timeline';
        container.style.height = '0';
        container.style.padding = '0';
    } else {
        toggleBtn.innerHTML = '&#9660; Timeline';
        container.style.height = '7rem';
        container.style.padding = '20px 15px';
        // Chart.js needs a small delay before updating after the container is visible again
        setTimeout(() => window.missionChart?.update(), 300);
    }
}

function updateTimeChart() {
    const years  = [2020, 2021, 2022, 2023, 2024, 2025];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const labels = [];
    const data   = [];

    years.forEach(year => {
        months.forEach((month, i) => {
            labels.push(`${month} ${year}`);
            data.push(missionRecords[`${year}-${i}`]?.missions || 0);
        });
    });

    const canvas = document.getElementById('time-chart');
    if (!canvas) return;

    window.missionChart?.destroy();

    window.missionChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Missions',
                data,
                backgroundColor: '#F6A066',
                borderWidth: 0,
                barThickness: 35,
                borderRadius: 5,
            }],
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: { display: false, beginAtZero: true, min: 0 },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#B5C9D2',
                        font: { size: 14, weight: 'bold' },
                        maxRotation: 0,
                        minRotation: 0,
                    },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx  => ctx[0].label,
                        label: ctx  => `Missions: ${ctx.raw}`,
                    },
                    bodyFont: { size: 14 },
                },
            },
        },
    });

    // Scroll to the most recent data on first render
    setTimeout(() => {
        const container = document.getElementById('time-chart-container');
        const recentIndex = labels.findIndex(l => l.includes('2025') || l.includes('2024'));
        if (container && recentIndex >= 0) {
            container.scrollLeft = (recentIndex / labels.length) * container.scrollWidth;
        }
    }, 100);
}


// Coverage histogram

function updateCoverageHistogram() {
    const years  = [2020, 2021, 2022, 2023, 2024, 2025];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const labels = [];
    const data   = [];

    years.forEach(year => {
        months.forEach((month, i) => {
            labels.push(`${month} ${year}`);
            data.push(missionRecords[`${year}-${i}`]?.coverage || 0);
        });
    });

    const canvas = document.getElementById('coverage-histogram');
    if (!canvas) return;

    window.coverageChart?.destroy();

    window.coverageChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Coverage (km2)',
                data,
                backgroundColor: '#42A5F5',
                borderColor: '#FFFFFF',
                borderWidth: 1,
                barThickness: 15,
                borderRadius: 5,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Coverage (km2)',
                        color: '#B5C9D2',
                        font: { size: 14 },
                    },
                },
                x: {
                    ticks: { color: '#B5C9D2', font: { size: 12 } },
                    grid: { display: false },
                    barPercentage: 0.8,
                    categoryPercentage: 3,
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => ctx[0].label,
                        label: ctx => `Coverage: ${ctx.raw.toFixed(2)} km2`,
                    },
                },
            },
        },
    });
}

initializeTimeChart();
updateCoverageHistogram();


// Drawing tools

const drawnPolygons = [];
const drawnItems    = new L.FeatureGroup();
map.addLayer(drawnItems);

const activePolygons    = [];
const polygonLayerGroup = L.layerGroup().addTo(map);
let regionLayer;

const drawControl = new L.Control.Draw({
    draw: {
        polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: 'blue' },
        },
        polyline:     { shapeOptions: { color: 'red' } },
        rectangle:    { shapeOptions: { color: 'green' } },
        circle:       { shapeOptions: { color: 'purple' } },
        marker:       true,
        circlemarker: true,
    },
    edit: {
        featureGroup: drawnItems,
        edit: true,
        remove: true,
    },
});
map.addControl(drawControl);

// Returns a colour based on how many drawn polygons intersect a given region.
function getColorByCount(count) {
    if (count >= 10) return '#ff0000';
    if (count >= 5)  return '#ffa500';
    if (count >= 2)  return '#ffff00';
    if (count >= 1)  return '#90ee90';
    return '#d3d3d3';
}

// Redraws the UK regions GeoJSON layer, colouring each region by intersection count.
// Called whenever polygons are added or removed.
function renderRegionCoverage() {
    if (regionLayer) map.removeLayer(regionLayer);

    fetch('/data/regions.geojson')
        .then(res => res.json())
        .then(geojsonData => {
            regionLayer = L.geoJSON(geojsonData, {
                style: feature => {
                    const region = feature.geometry;
                    let count = 0;

                    for (const poly of activePolygons) {
                        if (turf.intersect(region, poly.toGeoJSON().geometry)) count++;
                    }

                    return {
                        color: 'black',
                        weight: 1,
                        fillColor: getColorByCount(count),
                        fillOpacity: 0.6,
                    };
                },
            }).addTo(map);
        })
        .catch(err => console.error('Error rendering regions:', err));
}

map.on('draw:created', e => {
    const layer = e.layer;
    const type  = e.layerType;
    drawnItems.addLayer(layer);

    const geojsonShape = layer.toGeoJSON();
    let shapeArea = 0;

    if (type === 'circle') {
        const radius = layer.getRadius();
        shapeArea = Math.PI * radius * radius;
    } else if (type === 'polyline') {
        // Polylines have no area -- record distance instead
        const totalDistance = calculateDistances(layer.getLatLngs()).total;
        drawnPolygons.push({
            id:       drawnPolygons.length + 1,
            type,
            area:     'N/A',
            coverage: 'N/A',
            length:   (totalDistance / 1000).toFixed(2) + ' km',
        });
        updatePolygonTable();
        return;
    } else {
        try {
            shapeArea = turf.area(geojsonShape);
        } catch (err) {
            console.warn('Area calculation failed:', err);
        }
    }

    let totalCoverage = 0;

    for (const poly of activePolygons) {
        try {
            const intersection = turf.intersect(geojsonShape, poly.toGeoJSON());
            if (intersection) {
                totalCoverage += (turf.area(intersection) / shapeArea) * 100;
            }
        } catch (err) {
            console.warn('Intersection error:', err);
        }
    }

    drawnPolygons.push({
        id:       drawnPolygons.length + 1,
        type,
        area:     shapeArea ? (shapeArea / 1e6).toFixed(2) : 'N/A',
        coverage: totalCoverage.toFixed(2),
    });

    updatePolygonTable();
});

map.on('draw:deleted', () => {
    drawnPolygons.length = 0;
    updatePolygonTable();
});

const updatePolygonTable = () => {
    const tbody = document.querySelector('#polygon-table tbody');
    tbody.innerHTML = drawnPolygons.map(p =>
        `<tr>
            <td>${p.id}</td>
            <td>${p.type}</td>
            <td>${p.area || 'N/A'} ${p.length ? `(${p.length})` : 'km2'}</td>
            <td>${p.coverage || 'N/A'}%</td>
        </tr>`
    ).join('');
};


// Marker cluster

const markersCluster = L.markerClusterGroup({
    disableClusteringAtZoom: 10,
    chunkedLoading:          false, // sync add — avoids deferred render on initial load
    maxClusterRadius:        50,
    iconCreateFunction: cluster => new L.DivIcon({
        html:      `<div class="custom-cluster-icon">${cluster.getChildCount()}</div>`,
        className: 'custom-cluster-icon',
        iconSize:  new L.Point(40, 40),
    }),
});
map.addLayer(markersCluster);


// Footprint controls

function toggleFootprint(productId) {
    const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
    if (!marker?.footprint) return;

    const isVisible = marker.footprint.options.opacity;
    marker.footprint.setStyle({
        opacity:     isVisible ? 0 : 1,
        fillOpacity: isVisible ? 0 : 0.2,
    });
    footprintVisibility[productId] = !isVisible;

    if (marker.isPopupOpen()) {
        marker.setPopupContent(generatePopupContent(productId, !isVisible));
    }
}

function zoomToFootprint(productId) {
    const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
    if (!marker?.footprint) return;

    map.fitBounds(marker.footprint.getBounds(), { padding: [50, 50], maxZoom: 12 });
    highlightFootprint(productId);
}

function highlightFootprint(productId, duration = 3000) {
    const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
    if (!marker?.footprint) return;

    marker.footprint.setStyle({ fillOpacity: 0.4, className: 'footprint-highlight' });

    if (duration) {
        setTimeout(() => {
            marker.footprint.setStyle({
                fillOpacity: footprintVisibility[productId] ? 0.2 : 0,
                className:   '',
            });
        }, duration);
    }
}

function generatePopupContent(productId, isVisible) {
    const div = document.createElement('div');
    div.className = 'popup-content';
    div.innerHTML = `
        <h4>Scene Details</h4>
        <p><strong>Product ID:</strong> ${productId}</p>
        <div class="popup-controls">
            <button onclick="toggleFootprint('${productId}')">
                ${isVisible ? 'Hide' : 'Show'} Footprint
            </button>
            <button onclick="zoomToFootprint('${productId}')">
                Zoom to Footprint
            </button>
        </div>
    `;
    return div;
}

const addMarkersToMap = markerData => {
    markersCluster.clearLayers();
    polygonLayerGroup.clearLayers();
    activePolygons.length = 0;

    const markerObjects = markerData.map(({ lat, lng, productId, coordinates }) => {
        const footprintPolygon = L.polygon(coordinates, {
            color:       '#3388ff',
            weight:      2,
            fillColor:   '#3388ff',
            fillOpacity: 0,
            opacity:     0,
        }).addTo(map);

        const marker = L.marker([lat, lng], { productId, autoPanOnFocus: false });
        marker.footprint = footprintPolygon;
        marker.bindPopup(generatePopupContent(productId, false));

        marker.on('click', function () {
            const nowVisible = !this.footprint.options.opacity;
            this.footprint.setStyle({
                opacity:     nowVisible ? 1 : 0,
                fillOpacity: nowVisible ? 0.2 : 0,
            });
            footprintVisibility[productId] = nowVisible;
            this.setPopupContent(generatePopupContent(productId, nowVisible));
        });

        if (coordinates?.length) {
            const polygon = L.polygon(coordinates, { color: 'blue' });
            const area    = turf.area(polygon.toGeoJSON());

            // Only show polygons smaller than 1,000,000 km2 to filter out bad data
            if (area < 1e9) {
                polygonLayerGroup.addLayer(polygon);
                activePolygons.push(polygon);
            }
        }

        return marker;
    });

    markersCluster.addLayers(markerObjects);
    map.invalidateSize();
    renderRegionCoverage();
    handlePolygonVisibility();
};

// Expose footprint controls globally so popup button onclick handlers can reach them
window.toggleFootprint = toggleFootprint;
window.zoomToFootprint = zoomToFootprint;


// Polygon visibility by zoom

const POLYGON_ZOOM_THRESHOLD = 9;

function handlePolygonVisibility() {
    if (map.getZoom() >= POLYGON_ZOOM_THRESHOLD) {
        map.addLayer(polygonLayerGroup);
    } else {
        map.removeLayer(polygonLayerGroup);
    }
}

map.on('zoomend', handlePolygonVisibility);


// Manual mission drawing

let missionCoordinates  = [];
let missionPolyline     = null;
let missionDrawingActive = false;

const startMission = () => {
    missionCoordinates   = [];
    missionDrawingActive = true;
    alert('Mission drawing started. Click on the map to add points, and double-click to finish.');
    map.on('click',   onMapClick);
    map.on('dblclick', finishMission);
};

const onMapClick = e => {
    if (!missionDrawingActive) return;
    missionCoordinates.push(e.latlng);

    if (missionPolyline) {
        missionPolyline.setLatLngs(missionCoordinates);
    } else {
        missionPolyline = L.polyline(missionCoordinates, { color: 'red', weight: 4 }).addTo(map);
    }
};

const finishMission = () => {
    if (!missionDrawingActive) return;
    missionDrawingActive = false;
    map.off('click',   onMapClick);
    map.off('dblclick', finishMission);
    processMission();
};

const calculateDistances = coords => {
    if (coords.length < 2) return { direct: 0, total: 0 };

    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        total += coords[i].distanceTo(coords[i + 1]);
    }

    return {
        direct: coords[0].distanceTo(coords[coords.length - 1]),
        total,
    };
};

const processMission = () => {
    const distances   = calculateDistances(missionCoordinates);
    const directMiles = (distances.direct * 0.000621371).toFixed(2);
    const totalMiles  = (distances.total  * 0.000621371).toFixed(2);

    const productId = prompt('Enter a Product ID for this mission (required):');
    if (!productId) {
        alert('Product ID is required. Mission not saved.');
        if (missionPolyline) map.removeLayer(missionPolyline);
        return;
    }

    const now       = new Date();
    const key       = `${now.getFullYear()}-${now.getMonth()}`;
    missionRecords[key] = missionRecords[key] || { missions: 0, coverage: 0 };
    missionRecords[key].missions += 1;

    // Skip shapes with no area (polylines) to avoid NaN in the coverage total
    const coverage = drawnPolygons.reduce((total, p) => {
        const area = parseFloat(p.area);
        return total + (isNaN(area) ? 0 : area);
    }, 0);
    missionRecords[key].coverage += coverage;

    const missionList = document.getElementById('mission-list');
    if (missionList) {
        const card = document.createElement('div');
        card.className = 'polygon-card';
        card.innerHTML = `<h3>${productId}</h3><p>Direct: ${directMiles} mi</p><p>Total: ${totalMiles} mi</p>`;
        missionList.appendChild(card);
    }

    updateTimeChart();
    updateCoverageHistogram();
};


// Brand marker

const londonCoords  = [51.5074, -0.1278];
const brandLogoIcon = L.icon({
    iconUrl:    '/Assets/Images/Raytheon Logo.svg',
    iconSize:   [100, 100],
    iconAnchor: [25, 25],
    popupAnchor:[0, -25],
});

L.marker(londonCoords, { icon: brandLogoIcon })
    .addTo(map)
    .bindPopup('Our main base in London!')
    .openPopup();
