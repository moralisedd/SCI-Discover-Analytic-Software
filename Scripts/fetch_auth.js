// NOTE: The SCi-Discover API credentials have expired.
// The app runs in demo mode using static data defined below.
// All rendering, map interaction, and navigation logic is unchanged.

const dataCache = {
    missionFootprints: {},
    scenes:            {},
    products:          {},
    missionInfo:       {},
};

const drawnFootprints = new Map();


// Static demo data

const DEMO_MISSIONS = [
    { id: 'm1', name: 'Mission Alpha',   aircraftTakeOffTime: '2025-03-15T09:00:00Z' },
    { id: 'm2', name: 'Mission Bravo',   aircraftTakeOffTime: '2025-04-10T11:30:00Z' },
    { id: 'm3', name: 'Mission Charlie', aircraftTakeOffTime: '2025-05-01T08:00:00Z' },
    { id: 'm4', name: 'Mission Delta',   aircraftTakeOffTime: '2024-12-20T14:00:00Z' },
    { id: 'm5', name: 'Mission Echo',    aircraftTakeOffTime: '2025-01-08T10:00:00Z' },
];

// GeoJSON coordinate format [lng, lat]
const DEMO_FOOTPRINTS = {
    'm1': [{ coordinates: [[[-1.0, 51.2], [0.3, 51.2], [0.3, 51.9], [-1.0, 51.9], [-1.0, 51.2]]] }],
    'm2': [{ coordinates: [[[-2.4, 52.2], [-1.6, 52.2], [-1.6, 52.8], [-2.4, 52.8], [-2.4, 52.2]]] }],
    'm3': [{ coordinates: [[[-2.7, 53.2], [-2.0, 53.2], [-2.0, 53.7], [-2.7, 53.7], [-2.7, 53.2]]] }],
    'm4': [{ coordinates: [[[-3.4, 55.7], [-2.8, 55.7], [-2.8, 56.1], [-3.4, 56.1], [-3.4, 55.7]]] }],
    'm5': [{ coordinates: [[[-3.3, 51.3], [-2.9, 51.3], [-2.9, 51.7], [-3.3, 51.7], [-3.3, 51.3]]] }],
};

const DEMO_SCENES = {
    'm1': [
        { missionId: 'm1', sceneName: 'Scene Alpha-1', sceneId: 's1a', firstFrameTime: '2025-03-15T09:05:00Z', bandCount: 4 },
        { missionId: 'm1', sceneName: 'Scene Alpha-2', sceneId: 's1b', firstFrameTime: '2025-03-15T09:12:00Z', bandCount: 6 },
    ],
    'm2': [
        { missionId: 'm2', sceneName: 'Scene Bravo-1', sceneId: 's2a', firstFrameTime: '2025-04-10T11:35:00Z', bandCount: 3 },
        { missionId: 'm2', sceneName: 'Scene Bravo-2', sceneId: 's2b', firstFrameTime: '2025-04-10T11:42:00Z', bandCount: 5 },
        { missionId: 'm2', sceneName: 'Scene Bravo-3', sceneId: 's2c', firstFrameTime: '2025-04-10T11:50:00Z', bandCount: 2 },
    ],
    'm3': [
        { missionId: 'm3', sceneName: 'Scene Charlie-1', sceneId: 's3a', firstFrameTime: '2025-05-01T08:08:00Z', bandCount: 7 },
    ],
    'm4': [
        { missionId: 'm4', sceneName: 'Scene Delta-1', sceneId: 's4a', firstFrameTime: '2024-12-20T14:05:00Z', bandCount: 4 },
        { missionId: 'm4', sceneName: 'Scene Delta-2', sceneId: 's4b', firstFrameTime: '2024-12-20T14:15:00Z', bandCount: 8 },
    ],
    'm5': [
        { missionId: 'm5', sceneName: 'Scene Echo-1', sceneId: 's5a', firstFrameTime: '2025-01-08T10:10:00Z', bandCount: 5 },
        { missionId: 'm5', sceneName: 'Scene Echo-2', sceneId: 's5b', firstFrameTime: '2025-01-08T10:20:00Z', bandCount: 3 },
    ],
};

// Leaflet coordinate format [lat, lng]
const DEMO_MARKERS = [
    {
        lat: 51.505, lng: -0.09, productId: 'PROD-001',
        coordinates: [[51.2, -1.0], [51.2, 0.3], [51.9, 0.3], [51.9, -1.0]],
    },
    {
        lat: 52.48, lng: -1.90, productId: 'PROD-002',
        coordinates: [[52.2, -2.4], [52.2, -1.6], [52.8, -1.6], [52.8, -2.4]],
    },
    {
        lat: 53.48, lng: -2.24, productId: 'PROD-003',
        coordinates: [[53.2, -2.7], [53.2, -2.0], [53.7, -2.0], [53.7, -2.7]],
    },
    {
        lat: 55.95, lng: -3.19, productId: 'PROD-004',
        coordinates: [[55.7, -3.4], [55.7, -2.8], [56.1, -2.8], [56.1, -3.4]],
    },
    {
        lat: 51.48, lng: -3.18, productId: 'PROD-005',
        coordinates: [[51.3, -3.3], [51.3, -2.9], [51.7, -2.9], [51.7, -3.3]],
    },
];


// Footprint rendering

function addMissionFootprint(footprintData, missionId) {
    if (!footprintData || !Array.isArray(footprintData) || !missionId) return;

    if (drawnFootprints.has(missionId) && drawnFootprints.get(missionId).length > 0) return;

    drawnFootprints.set(missionId, []);

    footprintData.forEach(({ coordinates }) => {
        if (!coordinates) return;

        const geoJsonLayer = L.geoJSON({
            type: 'Feature',
            geometry: {
                type:        coordinates.length > 1 ? 'MultiPolygon' : 'Polygon',
                coordinates,
            },
        }, {
            style: {
                color:       'black',
                weight:      0.5,
                fillColor:   'black',
                fillOpacity: 0.6,
            },
        });

        geoJsonLayer.on('click', () => {
            highlightMissionPolygons(missionId);
            triggerMissionCardClick(missionId);
        });

        geoJsonLayer.addTo(missionMap);
        drawnFootprints.get(missionId).push(geoJsonLayer);
    });
}

function triggerMissionCardClick(missionId) {
    const card = document.querySelector(`.mission-card[data-id="${missionId}"]`);
    if (card) {
        card.click();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightMissionPolygons(missionId) {
    const defaultStyle = {
        color: 'black', weight: 0.5, fillColor: 'black', fillOpacity: 0.6,
    };
    const activeStyle = {
        color: 'red', weight: 1, fillColor: 'purple', fillOpacity: 0.6,
    };

    drawnFootprints.forEach(layers => layers.forEach(l => l.setStyle(defaultStyle)));

    if (!drawnFootprints.has(missionId)) {
        console.warn(`No footprints found for mission: ${missionId}`);
        return;
    }

    drawnFootprints.get(missionId).forEach(l => l.setStyle(activeStyle));
}


// Data loading — static, no API calls

async function fetchFootprintInfo(accessToken, missionIds) {
    for (const missionId of missionIds) {
        const data = DEMO_FOOTPRINTS[missionId];
        if (!data) continue;
        dataCache.missionFootprints[missionId] = data;
        addMissionFootprint(data, missionId);
    }
}

async function fetchProducts() {
    addMarkersToMap(DEMO_MARKERS);
}

async function fetchScenes(accessToken, missionIds) {
    const missionId = missionIds[0];
    const data = DEMO_SCENES[missionId] || [];
    dataCache.scenes[missionId] = data;
    addSceneData(data, accessToken);
}


// Scene rendering

function addSceneData(sceneData, accessToken) {
    const container = document.getElementById('scene-list');

    if (!sceneData || !Array.isArray(sceneData)) {
        console.error('Invalid scene data.');
        return;
    }

    container.innerHTML = '';

    sceneData
        .sort((a, b) => new Date(a.firstFrameTime) - new Date(b.firstFrameTime))
        .forEach(scene => {
            const card = document.createElement('div');
            card.className  = 'scene-card';
            card.id         = scene.sceneId;
            card.dataset.bands = scene.bandCount;
            card.innerHTML = `
                <h3>Scene: ${scene.sceneName}</h3>
                <p>First Frame: ${new Date(scene.firstFrameTime).toLocaleString()}</p>
                <p>Frames: ${scene.bandCount}</p>
            `;
            container.appendChild(card);
        });

    const framesContainer = document.getElementById('frames-container');
    if (!framesContainer) {
        console.error('Frames container not found.');
        return;
    }

    const cardContainers = document.querySelectorAll('.card-container');
    const panelElements  = document.querySelectorAll('.more-stuff-box, .missions-stuff-box');

    // All styling lives in CSS — just make it visible
    framesContainer.style.display = 'flex';

    document.querySelectorAll('.scene-card').forEach(card => {
        card.addEventListener('click', function () {
            framesContainer.style.display = 'flex';

            document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            cardContainers.forEach(c => c.classList.add('shorten-container'));
            panelElements.forEach(el => el.classList.add('shorten-for-frames'));

            framesContainer.innerHTML = '';

            const bandCount = parseInt(this.dataset.bands, 10);
            if (!bandCount) return;

            for (let i = 0; i < bandCount; i++) {
                const frame = document.createElement('div');
                frame.className    = 'frame';
                frame.textContent  = `No Preview (Frame ${i + 1})`;
                frame.style.width  = '150px';
                frame.style.flexShrink = '0';
                framesContainer.appendChild(frame);
            }
        });
    });
}


// Mission rendering

async function fetchMissionInfo(accessToken) {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) loadingMsg.style.display = 'none';

    renderMissionCards(accessToken, DEMO_MISSIONS);
}

let allMissionIds = [];

const renderMissionCards = (accessToken, missions) => {
    const container = document.getElementById('mission-list');
    const heading   = document.querySelector('.missions-box h1');

    if (!container || !heading || !Array.isArray(missions)) return;

    container.innerHTML = '';

    allMissionIds = missions.map(m => m.id);
    fetchFootprintInfo(accessToken, allMissionIds);

    missions.forEach(m => {
        const takeOffTime = new Date(m.aircraftTakeOffTime).toLocaleString();
        const card = document.createElement('div');
        card.className = 'mission-card';
        card.dataset.id = m.id;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <h3>${m.name}</h3>
            <p>Aircraft Take Off: ${takeOffTime}</p>
        `;
        container.appendChild(card);
    });

    const missionCards = container.querySelectorAll('.mission-card');

    missionCards.forEach(card => {
        card.addEventListener('click', function () {
            const missionId = this.dataset.id;
            missionCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            highlightMissionPolygons(missionId);
        });

        card.addEventListener('dblclick', async function () {
            const missionId   = this.dataset.id;
            const missionName = this.querySelector('h3').textContent;

            container.innerHTML = '';

            await fetchScenes(accessToken, [missionId]);

            heading.innerHTML = `Scenes for Mission: <span style="color: orange;">${missionName}</span>`;
            showSceneContainer();

            history.pushState(
                { view: 'scenes', missionId, missionName, accessToken },
                'Scene View',
                window.location.href
            );
        });
    });

    window.onpopstate = event => {
        const cardContainers    = document.querySelectorAll('.card-container');
        const panelElements     = document.querySelectorAll('.more-stuff-box, .missions-stuff-box');
        const framesContainer   = document.getElementById('frames-container');

        if (event.state?.view === 'scenes') {
            showSceneContainer();
            heading.innerHTML = `Scenes for Mission: <span style="color: orange;">${event.state.missionName}</span>`;
            fetchScenes(event.state.accessToken, [event.state.missionId]);
        } else {
            showMissionContainer();
            heading.innerHTML = 'Missions';
            if (framesContainer) framesContainer.style.display = 'none';
            cardContainers.forEach(c => c.classList.remove('shorten-container'));
            panelElements.forEach(el => el.classList.remove('shorten-for-frames'));
            fetchMissionInfo(accessToken);
        }
    };
};

function showSceneContainer() {
    document.getElementById('mission-list').style.display = 'none';
    document.getElementById('scene-list').style.display   = 'block';
}

function showMissionContainer() {
    document.getElementById('mission-list').style.display = 'block';
    document.getElementById('scene-list').style.display   = 'none';
}


// Initialise — load static demo data on page load.
// The leading await yields to the event loop so Script.js finishes first
// and missionMap is defined before addMissionFootprint tries to use it.

async function init() {
    await Promise.resolve();
    await Promise.all([
        fetchProducts(),
        fetchMissionInfo(null),
    ]);
}

init();
