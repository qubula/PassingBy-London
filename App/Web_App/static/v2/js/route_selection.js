// v2 Choose Route: plans both routes, shows them on one map with the time
// difference and the landmarks the PassingBy route passes.
// Uses the existing /api/plan-route endpoint (shared with v1), called twice.

let selectedMode = 'scenic';
let routes = { fastest: null, scenic: null };
let mapsReady = false;
let mapDrawn = false;

const MAP_STYLE = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { elementType: 'geometry', stylers: [{ color: '#f2f2f0' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dfe4e8' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e8eee6' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
];

function getOrigin() {
    const savedStart = localStorage.getItem('pb_v2_start');
    if (!savedStart) return 'Charing Cross, London';
    const start = JSON.parse(savedStart);
    if (start.lat && start.lng) return `${start.lat},${start.lng}`;
    return start.address || start.name;
}

async function planRoute(origin, destination, mode) {
    const response = await fetch('/api/plan-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: origin, end: destination, mode: mode, tour_type: 'all' })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.status !== 'success') throw new Error(data.message || 'Route planning failed');
    return data.result;
}

function minutes(value) {
    return `${Math.max(1, Math.round(value))} min`;
}

function renderTimes() {
    const { fastest, scenic } = routes;
    if (fastest) document.getElementById('time-fastest').textContent = minutes(fastest.chosen_eta);
    if (scenic) {
        document.getElementById('time-scenic').textContent = minutes(scenic.chosen_eta);
        const diff = Math.round(scenic.difference);
        document.getElementById('time-diff').textContent = diff >= 1 ? `+${diff} min` : 'Same time';
    }
}

function renderLandmarks() {
    const scenic = routes.scenic;
    const countEl = document.getElementById('landmark-count');
    const listEl = document.getElementById('landmark-list');
    if (!scenic) return;

    const names = (scenic.landmarks || []).map(l => l.name).filter(Boolean);
    if (names.length === 0) {
        countEl.textContent = 'No landmarks found on this route';
        listEl.innerHTML = '';
        return;
    }
    countEl.textContent = `You'll pass ${names.length} landmark${names.length === 1 ? '' : 's'}`;
    const shown = names.slice(0, 3);
    listEl.innerHTML = shown.map(n => `<span class="v2-landmark"><i aria-hidden="true"></i>${escapeHtml(n)}</span>`).join('')
        + (names.length > shown.length ? `<span class="v2-landmark-more">+ ${names.length - shown.length} more</span>` : '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function drawMap() {
    if (mapDrawn || !mapsReady || !routes.fastest || !routes.scenic) return;
    mapDrawn = true;

    const container = document.getElementById('route-map');
    const map = new google.maps.Map(container, {
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
        clickableIcons: false,
        styles: MAP_STYLE
    });
    const bounds = new google.maps.LatLngBounds();
    const toPath = pts => pts.map(p => ({ lat: p[0], lng: p[1] }));

    const fastestPath = toPath(routes.fastest.route_points || []);
    const scenicPath = toPath(routes.scenic.route_points || []);
    fastestPath.concat(scenicPath).forEach(p => bounds.extend(p));

    // Fastest: dashed grey
    new google.maps.Polyline({
        map, path: fastestPath, strokeOpacity: 0,
        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#6b7280', scale: 3 }, offset: '0', repeat: '12px' }]
    });
    // PassingBy: solid black
    new google.maps.Polyline({ map, path: scenicPath, strokeColor: '#1a1a1a', strokeOpacity: 1, strokeWeight: 4 });

    (routes.scenic.landmarks || []).forEach(l => {
        if (!l.lat || !l.lng) return;
        new google.maps.Marker({
            map, position: { lat: l.lat, lng: l.lng }, title: l.name,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#1e3a8a', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 }
        });
    });
    if (scenicPath.length) {
        const dot = (pos, color) => new google.maps.Marker({ map, position: pos, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: color, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 } });
        dot(scenicPath[0], '#1a1a1a');
        dot(scenicPath[scenicPath.length - 1], '#ef4444');
    }
    map.fitBounds(bounds, 24);
    const loading = document.getElementById('map-loading');
    if (loading) loading.remove();
}

// Called by the Google Maps script when it has loaded
function initRouteMap() {
    mapsReady = true;
    drawMap();
}

function selectMode(mode) {
    selectedMode = mode;
    document.querySelectorAll('.v2-option').forEach(opt => {
        const on = opt.dataset.mode === mode;
        opt.classList.toggle('is-selected', on);
        opt.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function proceedToNext() {
    localStorage.setItem('pb_v2_route_mode', selectedMode);
    if (selectedMode === 'scenic') {
        window.location.href = '/v2/tour-type';
    } else {
        // Fastest mode doesn't need a theme
        localStorage.setItem('pb_v2_tour_type', 'all');
        window.location.href = '/v2/tour';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const savedDestination = localStorage.getItem('pb_v2_destination');
    if (!savedDestination) {
        window.location.href = '/v2';
        return;
    }

    document.querySelectorAll('.v2-option').forEach(opt => {
        opt.addEventListener('click', () => selectMode(opt.dataset.mode));
    });

    const dest = JSON.parse(savedDestination);
    const destination = dest.address || dest.name;
    const origin = getOrigin();
    prefetchThemeCounts(origin, destination);

    const [fastest, scenic] = await Promise.allSettled([
        planRoute(origin, destination, '1'),
        planRoute(origin, destination, '2')
    ]);
    routes.fastest = fastest.status === 'fulfilled' ? fastest.value : null;
    routes.scenic = scenic.status === 'fulfilled' ? scenic.value : null;

    if (!routes.fastest && !routes.scenic) {
        const loading = document.getElementById('map-loading');
        if (loading) loading.textContent = "Couldn't plan the routes. You can still choose one.";
        document.getElementById('landmark-count').textContent = 'Landmarks will appear once the ride starts';
        return;
    }
    renderTimes();
    renderLandmarks();
    drawMap();
});

// Start the theme check now, while the person is still choosing a route, so the
// Choose Theme screen can show its counts straight away. Result goes to sessionStorage.
function prefetchThemeCounts(origin, destination) {
    const key = `${origin}|${destination}`;
    try {
        const cached = JSON.parse(sessionStorage.getItem('pb_v2_theme_counts') || 'null');
        if (cached && cached.key === key) return;
    } catch (e) { /* ignore */ }
    fetch('/api/check-tour-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: origin, end: destination, mode: 'scenic' })
    })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && data.status === 'success') {
                sessionStorage.setItem('pb_v2_theme_counts', JSON.stringify({ key, counts: data.landmark_counts || {} }));
            }
        })
        .catch(() => { /* Choose Theme will ask again */ });
}
