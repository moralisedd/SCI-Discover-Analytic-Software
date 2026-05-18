// missionMap depends on mapOptions and brandLogoIcon defined in map.js (loaded first via defer)
const missionMap     = new L.map('mission-map-container', mapOptions);
const missionMapTile = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
missionMap.addLayer(missionMapTile);

L.marker(londonCoords, { icon: brandLogoIcon })
    .addTo(missionMap)
    .bindPopup('Mission Map!')
    .openPopup();


// Collapsible side panels

// Toggles a panel — used by the panel's own toggle button
function togglePanel(panelId) {
    const panel    = document.querySelector(`.${panelId}`);
    const btn      = panel.querySelector('.toggle-btn');
    const mapEl    = document.querySelector('.map');

    panel.classList.toggle('collapsed');
    btn.classList.toggle('active');

    if (panelId === 'item-1') mapEl.classList.toggle('expanded-left');
    if (panelId === 'item-3') mapEl.classList.toggle('expanded-right');

    resizeMap();
}

// Sets a panel to a specific state — used by tab switching so clicking the
// same tab twice doesn't accidentally collapse the panel it just opened.
function setPanelState(panelId, shouldCollapse) {
    const panel = document.querySelector(`.${panelId}`);
    const isCollapsed = panel.classList.contains('collapsed');
    if (isCollapsed === shouldCollapse) return;
    togglePanel(panelId);
}

// Leaflet needs invalidateSize after its container resizes to re-render tiles
function resizeMap() {
    setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(map.getBounds());
    }, 300);
}


// Tab switching

let currentSelection = null;

const mapContainer        = document.getElementById('map-container');
const missionMapContainer = document.getElementById('mission-map-container');
const framesContainer     = document.getElementById('frames-container');

function selectTab(tabNumber) {
    if (currentSelection) {
        currentSelection.classList.remove('selected');
        currentSelection.style.pointerEvents = 'auto';
    }

    const tabs = document.querySelectorAll('.clickable');
    const tab  = tabs[tabNumber - 1];
    tab.classList.add('selected');
    tab.style.pointerEvents = 'none';
    currentSelection = tab;

    const cardContainers = document.querySelectorAll('.card-container');
    const panelElements  = document.querySelectorAll('.more-stuff-box, .missions-stuff-box');

    if (tabNumber === 1) {
        setPanelState('item-3', true);   // collapse missions panel
        setPanelState('item-1', false);  // ensure polygon panel is open

        missionMapContainer.style.display = 'none';
        framesContainer.style.display     = 'none';
        mapContainer.style.display        = 'block';

        map.setView([51.505, -0.09], 6);

        cardContainers.forEach(c  => c.classList.remove('shorten-container'));
        panelElements.forEach(el => el.classList.remove('shorten-for-frames'));
    } else if (tabNumber === 2) {
        setPanelState('item-1', true);   // collapse polygon panel
        setPanelState('item-3', false);  // ensure missions panel is open

        mapContainer.style.display        = 'none';
        missionMapContainer.style.display = 'block';

        // invalidateSize after display:block — Leaflet renders blank if sized while hidden
        setTimeout(() => {
            missionMap.invalidateSize();
            missionMap.setView([51.505, -0.09], 6);
        }, 300);
    }
}

// Start on Product View with the missions panel collapsed
currentSelection = document.querySelectorAll('.clickable')[0];
currentSelection.classList.add('selected');
currentSelection.style.pointerEvents = 'none';
togglePanel('item-3');
