// v2 ride: map first, landmark as a mini card, postcard deck on demand.
// Figma: "04d · In-ride map — Final direction, postcard version".
// Spec: docs/design/handoff-in-ride-map.md
//
// States: 1 minimised (map + mini card) -> 2 postcard front -> 3 postcard back.
//   Swipe up on the mini card, or tap a landmark pin: open the postcard.
//   Tap the postcard: flip it. Swipe sideways: previous / next landmark.
//   Swipe down on the postcard: back to the minimised map.
// GPS triggering, trigger radii and route drawing are unchanged from v1.

// ---------- State ----------
const ride = {
    destination: null,
    mode: null,
    tourType: 'all',
    landmarks: [],
    visited: [],
    distances: [],
    current: 0,          // landmark shown in the mini card / postcard
    deckOpen: false,
    flipped: false,
    etaMinutes: null,
    startedAt: null
};

let map;
let watchId;
let userMarker;
let pinMarkers = [];

const $ = id => document.getElementById(id);

// ---------- Helpers ----------
function toNum(v) {
    return v === null || v === undefined ? null : Number(v);
}

function distanceMeters(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(d) {
    if (d === undefined || d === Infinity || d === null || isNaN(d)) return '';
    if (d < 1000) return `${Math.round(d / 10) * 10} m`;
    return `${(d / 1000).toFixed(1)} km`;
}

function landmarkLatLng(lm) {
    return {
        lat: toNum(lm.lat ?? lm.latitude ?? lm.lat_dd),
        lng: toNum(lm.lng ?? lm.lon ?? lm.longitude ?? lm.lon_dd)
    };
}

function whereLine(idx, upper) {
    const lm = ride.landmarks[idx];
    if (!lm) return '';
    const side = lm.side ? `On your ${lm.side}` : (ride.visited[idx] ? 'Passing now' : 'Coming up');
    const dist = ride.visited[idx] ? '' : formatDistance(ride.distances[idx]);
    const text = dist ? `${side} · ${dist}` : side;
    return upper ? text.toUpperCase() : text;
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    try {
        ride.destination = JSON.parse(localStorage.getItem('pb_v2_destination'));
        ride.mode = localStorage.getItem('pb_v2_route_mode');
        ride.tourType = localStorage.getItem('pb_v2_tour_type') || 'all';
    } catch (e) {
        console.error('Error reading the saved trip', e);
    }

    if (!ride.destination) {
        if (!sessionStorage.getItem('pb_v2_tour_redirect_attempted')) {
            sessionStorage.setItem('pb_v2_tour_redirect_attempted', 'true');
            window.location.href = '/v2';
        }
        return;
    }
    sessionStorage.removeItem('pb_v2_tour_redirect_attempted');

    renderThemeBadge();
    initAudioToggle();
    initMiniCard();
    initPostcard();
    initGoogleMapsShortcut();
    $('end-tour').addEventListener('click', endTour);
    startGPS();
});

window.gm_authFailure = function () {
    $('next-stop-name').textContent = "The map couldn't load";
};

// ---------- Theme badge (the only theme styling during the ride) ----------
function renderThemeBadge() {
    const e = (window.EDITIONS || {})[ride.tourType] || (window.EDITIONS || {}).all;
    const badge = $('theme-badge');
    if (!e || !badge) return;
    badge.style.background = e.body;
    if (e.light) badge.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1)';
    badge.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${e.accent}">${e.glyph}</svg>`;
    badge.title = e.name;
}

// ---------- Map ----------
const DARK_MAP = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }, { weight: 0.8 }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#888888' }, { lightness: 25 }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#444444' }, { weight: 0.3 }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#252525' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#303030' }] }
];

function initMap() {
    const mapEl = $('tour-map');
    if (!mapEl) return;
    map = new google.maps.Map(mapEl, {
        center: { lat: 51.5074, lng: -0.1278 },
        zoom: 12,
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',   // one finger moves the map; the page itself never scrolls
        styles: DARK_MAP
    });
    calculateRoute();
}
window.initMap = initMap;

function startGPS() {
    if (!navigator.geolocation) return;
    watchId = navigator.geolocation.watchPosition(
        handlePosition,
        err => console.error('GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 }
    );
}

function updateUserMarker(pos) {
    if (!map) return;
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: pos, map, title: 'Your location', zIndex: 1000,
            icon: { url: '/static/v2/images/markers/user-location.svg?v=4', scaledSize: new google.maps.Size(12, 12), anchor: new google.maps.Point(6, 6) }
        });
    } else {
        userMarker.setPosition(pos);
    }
}

function getOrigin() {
    const savedStart = localStorage.getItem('pb_v2_start');
    if (!savedStart) return 'Charing Cross, London';
    const start = JSON.parse(savedStart);
    if (start.lat && start.lng) return `${start.lat},${start.lng}`;
    return start.address || start.name;
}

async function calculateRoute() {
    try {
        const response = await fetch('/api/plan-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start: getOrigin(),
                end: ride.destination.address || ride.destination.name,
                mode: ride.mode === 'scenic' ? '2' : '1',
                tour_type: ride.tourType
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Route planning failed');

        const result = data.result;
        ride.landmarks = result.landmarks || [];
        ride.visited = new Array(ride.landmarks.length).fill(false);
        ride.distances = new Array(ride.landmarks.length).fill(Infinity);
        ride.etaMinutes = result.chosen_eta;
        ride.startedAt = Date.now();

        drawRoute(result.route_points || []);
        drawPins();
        updateEta();
        setInterval(updateEta, 30000);

        if (ride.landmarks.length) {
            showMini(0);
            updateNextStop(0);
            // GPS may have answered before the route arrived: use that position now
            if (lastPosition) handlePosition(lastPosition);
            const hint = $('pin-hint');
            hint.hidden = false;
            setTimeout(() => { hint.hidden = true; }, 6000);
        } else {
            $('next-stop-name').textContent = ride.destination.name;
            $('next-eyebrow').textContent = 'Destination';
        }
    } catch (error) {
        console.error('Route error:', error);
        $('next-stop-name').textContent = "Couldn't plan the route";
    }
}

function drawRoute(points) {
    if (!map || !points.length) return;
    const path = points.map(p => ({ lat: p[0], lng: p[1] }));
    new google.maps.Polyline({ path, geodesic: true, strokeColor: '#FAF8F3', strokeOpacity: 0.9, strokeWeight: 3, map });
    const end = (pos, color) => new google.maps.Marker({
        position: pos, map, zIndex: 100,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: color, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 1.5 }
    });
    end(path[0], '#9ca3af');
    end(path[path.length - 1], '#ef4444');

    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    // Leave room for the top panel and the mini card
    map.fitBounds(bounds, { top: 170, right: 40, bottom: 190, left: 40 });
}

// Numbered pins. Tapping one opens that landmark's postcard.
function drawPins() {
    if (!map) return;
    pinMarkers.forEach(m => m.setMap(null));
    pinMarkers = ride.landmarks.map((lm, idx) => {
        const pos = landmarkLatLng(lm);
        if (pos.lat == null || pos.lng == null) return null;
        const pin = window.landmarkPin(idx + 1);
        const marker = new google.maps.Marker({
            position: pos, map, title: lm.name, zIndex: 200 + idx,
            icon: pin.icon, label: pin.label
        });
        marker.addListener('click', () => openDeck(idx));
        return marker;
    });
}

function updateEta() {
    if (ride.etaMinutes == null || !ride.startedAt) return;
    const elapsed = (Date.now() - ride.startedAt) / 60000;
    const left = Math.max(1, Math.round(ride.etaMinutes - elapsed));
    $('journey-eta').textContent = `${left} min left`;
}

function updateNextStop(idx) {
    const lm = ride.landmarks[idx];
    if (!lm) return;
    $('next-stop-name').textContent = lm.name;
    const dist = formatDistance(ride.distances[idx]);
    $('next-eyebrow').textContent = dist ? `Next stop · ${dist}` : 'Next stop';
}

// ---------- GPS triggering (same radii and rules as v1) ----------
let lastPosition = null;

function handlePosition(pos) {
    lastPosition = pos;
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const firstFix = !userMarker;
    updateUserMarker({ lat, lng: lon });
    if (map && firstFix && !ride.landmarks.length) map.setCenter({ lat, lng: lon });

    let nextIdx = -1;
    let nextDist = Infinity;
    let triggeredIdx = -1;

    ride.landmarks.forEach((lm, idx) => {
        const p = landmarkLatLng(lm);
        const d = distanceMeters(lat, lon, p.lat, p.lng);
        ride.distances[idx] = d;
        const radius = lm.radius_m ?? 120;
        if (!ride.visited[idx] && d <= radius) {
            ride.visited[idx] = true;
            triggeredIdx = idx;
        }
        // Next stop = nearest landmark not passed yet (checked after triggering)
        if (!ride.visited[idx] && d < nextDist) { nextIdx = idx; nextDist = d; }
    });

    if (nextIdx >= 0) updateNextStop(nextIdx);
    if (triggeredIdx >= 0) {
        ride.anyTriggered = true;
        onLandmarkTriggered(triggeredIdx);
    } else if (!ride.anyTriggered && !ride.userBrowsed && !ride.deckOpen && nextIdx >= 0 && nextIdx !== ride.current) {
        // Before the first landmark (and until the person browses cards themselves),
        // the mini card previews the next stop
        showMini(nextIdx);
    } else {
        refreshCurrentText();
    }
}

function onLandmarkTriggered(idx) {
    // Don't pull the card away from someone who is reading another one
    if (!ride.deckOpen) showMini(idx);
}

function refreshCurrentText() {
    if (ride.deckOpen) {
        $('pc-where').textContent = whereLine(ride.current, false);
        $('pc-back-eyebrow').textContent = whereLine(ride.current, true);
    } else if (!$('mini-card').hidden) {
        $('mini-eyebrow').textContent = whereLine(ride.current, true);
    }
}

// ---------- State 1: mini card ----------
function showMini(idx) {
    const lm = ride.landmarks[idx];
    if (!lm) return;
    const mini = $('mini-card');
    const first = mini.hidden;
    ride.current = idx;
    $('mini-name').textContent = lm.name;
    $('mini-eyebrow').textContent = whereLine(idx, true);
    setImage($('mini-img'), lm.image_url);
    mini.hidden = false;
    $('swipe-hint').hidden = false;
    if (first && !sheet.active) {
        mini.classList.remove('is-entering');
        void mini.offsetWidth;                 // restart the entrance animation
        mini.classList.add('is-entering');
    }
}

let lastTouchAt = 0;
document.addEventListener('touchstart', () => { lastTouchAt = Date.now(); }, { passive: true, capture: true });

function setImage(img, url) {
    if (url) {
        img.src = url;
        img.parentElement.classList.remove('is-empty');
    } else {
        img.removeAttribute('src');
        img.parentElement.classList.add('is-empty');
    }
}

// ---------- The sheet: one panel that grows from the mini card into the postcard ----------
// progress 0 = mini card, 1 = full postcard. While dragging, the panel's top edge
// follows the finger. On release a spring carries on at the finger's speed.
const sheet = { p: 0, active: false, raf: null, range: 1, miniH: 128 };

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function sheetPrepare() {
    const deck = $('deck');
    const mini = $('mini-card');
    if (!mini.hidden) sheet.miniH = mini.offsetHeight;
    mini.classList.remove('is-entering');
    mini.hidden = false;
    deck.hidden = false;
    sheet.active = true;
    sheet.range = Math.max(1, deck.offsetHeight - sheet.miniH);
    if (sheet.raf) { cancelAnimationFrame(sheet.raf); sheet.raf = null; }
}

function sheetApply(p) {
    sheet.p = p;
    const deck = $('deck');
    const mini = $('mini-card');
    const pc = $('postcard');
    const shown = clamp01(p);
    // Rubber band past either end
    const over = p > 1 ? (p - 1) * 0.25 : (p < 0 ? p * 0.25 : 0);
    const inset = Math.max(0, (1 - shown) * sheet.range - over * sheet.range);
    const radius = 20 - 4 * shown;
    const clip = `inset(${inset}px 0 0 0 round ${radius}px)`;
    deck.style.clipPath = clip;
    deck.style.webkitClipPath = clip;
    // The postcard widens into the deck as it opens; the deck cards fade in late
    pc.style.right = `${24 * shown}px`;
    pc.style.setProperty('--content', String(clamp01((shown - 0.3) / 0.55)));
    deck.style.setProperty('--deck', String(clamp01((shown - 0.55) / 0.45)));
    // The mini card's content fades out early, so the panel reads as one surface
    mini.style.opacity = String(clamp01(1 - shown / 0.3));
    $('swipe-hint').style.opacity = String(clamp01(1 - shown / 0.2));
}

function sheetSettle(target) {
    const deck = $('deck');
    const mini = $('mini-card');
    sheet.active = false;
    sheet.raf = null;
    sheetApply(target);
    if (target === 1) {
        ride.deckOpen = true;
        mini.hidden = true;
        $('swipe-hint').hidden = true;
    } else {
        ride.deckOpen = false;
        deck.hidden = true;
        deck.style.clipPath = '';
        deck.style.webkitClipPath = '';
        mini.style.opacity = '';
        $('swipe-hint').style.opacity = '';
        $('swipe-hint').hidden = false;
        showMini(ride.current);
    }
}

// Critically damped spring from the current progress to the target,
// starting at the finger's velocity (progress units per second).
function sheetSpring(target, velocity) {
    if (sheet.raf) cancelAnimationFrame(sheet.raf);
    sheet.active = true;
    let x = sheet.p;
    let v = velocity || 0;
    const stiffness = 320;
    const damping = 2 * Math.sqrt(stiffness) * 0.92;   // a touch of softness, no wobble
    let last = performance.now();
    const step = now => {
        const dt = Math.min(0.032, (now - last) / 1000);
        last = now;
        const a = -stiffness * (x - target) - damping * v;
        v += a * dt;
        x += v * dt;
        if (Math.abs(x - target) < 0.002 && Math.abs(v) < 0.02) {
            sheetSettle(target);
            return;
        }
        sheetApply(x);
        sheet.raf = requestAnimationFrame(step);
    };
    sheet.raf = requestAnimationFrame(step);
}

// Finger velocity from the last ~100 ms of movement (px per second)
function velocityTracker() {
    const samples = [];
    return {
        add(y) {
            const t = performance.now();
            samples.push({ y, t });
            while (samples.length > 2 && t - samples[0].t > 100) samples.shift();
        },
        get() {
            if (samples.length < 2) return 0;
            const a = samples[0];
            const b = samples[samples.length - 1];
            const dt = (b.t - a.t) / 1000;
            return dt > 0 ? (b.y - a.y) / dt : 0;
        },
        reset() { samples.length = 0; }
    };
}

// Release: open or close from position and speed
function sheetRelease(vyPx) {
    const vp = -vyPx / sheet.range;                      // up is positive progress
    let target;
    if (vp > 1.2) target = 1;
    else if (vp < -1.2) target = 0;
    else target = sheet.p > 0.5 ? 1 : 0;
    sheetSpring(target, vp);
}

function openDeck(idx) {
    if (!ride.landmarks[idx]) return;
    ride.userBrowsed = true;
    $('pin-hint').hidden = true;
    if (ride.deckOpen) {                                 // already open: just move to that card
        if (idx !== ride.current) goTo(idx, idx > ride.current ? 1 : -1);
        return;
    }
    showMini(idx);
    fillPostcard(idx);
    setFlipped(false);
    sheetPrepare();
    sheetApply(sheet.p || 0);
    sheetSpring(1, 0);
}

function closeDeck() {
    if (!ride.deckOpen && !sheet.active) return;
    showMiniContent(ride.current);
    sheetPrepare();
    sheetApply(1);
    sheetSpring(0, 0);
}

// Fill the mini card without the entrance animation (used under the closing panel)
function showMiniContent(idx) {
    const lm = ride.landmarks[idx];
    if (!lm) return;
    $('mini-name').textContent = lm.name;
    $('mini-eyebrow').textContent = whereLine(idx, true);
    setImage($('mini-img'), lm.image_url);
}

// Drag up on the mini card. There's no tap-to-open: only the drag opens it.
function initMiniCard() {
    const mini = $('mini-card');
    const vt = velocityTracker();
    let startY = null;
    let dragging = false;

    const begin = y => {
        startY = y;
        dragging = false;
        vt.reset();
        vt.add(y);
    };
    const move = (y, e) => {
        if (startY === null) return;
        if (e && e.cancelable) e.preventDefault();       // never scroll the page
        const dy = y - startY;
        vt.add(y);
        if (!dragging) {
            if (Math.abs(dy) < 4) return;
            dragging = true;
            ride.userBrowsed = true;
            $('pin-hint').hidden = true;
            fillPostcard(ride.current);
            setFlipped(false);
            sheetPrepare();
        }
        sheetApply(-dy / sheet.range);
    };
    const end = () => {
        if (startY === null) return;
        startY = null;
        if (dragging) sheetRelease(vt.get());
    };

    mini.addEventListener('touchstart', e => begin(e.touches[0].clientY), { passive: true });
    mini.addEventListener('touchmove', e => move(e.touches[0].clientY, e), { passive: false });
    mini.addEventListener('touchend', end);
    mini.addEventListener('touchcancel', end);
    // Mouse (desktop testing)
    let mouseDown = false;
    mini.addEventListener('mousedown', e => { if (Date.now() - lastTouchAt < 800) return; mouseDown = true; begin(e.clientY); });
    window.addEventListener('mousemove', e => { if (mouseDown) move(e.clientY, null); });
    window.addEventListener('mouseup', () => { if (mouseDown) { mouseDown = false; end(); } });
}

// ---------- States 2 and 3: postcard deck ----------
function fillPostcard(idx) {
    const lm = ride.landmarks[idx];
    if (!lm) return;
    ride.current = idx;
    $('pc-name').textContent = lm.name;
    $('pc-back-name').textContent = lm.name;
    $('pc-where').textContent = whereLine(idx, false);
    $('pc-back-eyebrow').textContent = whereLine(idx, true);
    $('pc-story').textContent = lm.script || 'No story for this landmark yet.';
    $('pc-story').scrollTop = 0;
    setImage($('pc-img'), lm.image_url);
    setImage($('pc-stamp'), lm.image_url);
    // The deck behind only shows when there are more landmarks after this one
    const remaining = ride.landmarks.length - 1 - idx;
    document.querySelector('.v2-deck-card--2').hidden = remaining < 1;
    document.querySelector('.v2-deck-card--3').hidden = remaining < 2;
}

function setFlipped(on) {
    ride.flipped = on;
    $('postcard').classList.toggle('is-flipped', on);
}

function snapBack(el) {
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
}

// Move to the previous / next postcard. The card leaves in the swipe direction
// from wherever the finger let go, and the next one glides in from the other side.
function goTo(idx, direction) {
    const pc = $('postcard');
    if (idx < 0 || idx >= ride.landmarks.length) {
        snapBack(pc);                                   // nothing there: spring back
        return;
    }
    pc.style.transition = '';
    pc.style.transform = `translateX(${direction > 0 ? -112 : 112}%)`;
    pc.style.opacity = '0';
    setTimeout(() => {
        fillPostcard(idx);
        setFlipped(false);
        pc.style.transition = 'none';
        pc.style.transform = `translateX(${direction > 0 ? 30 : -30}%) scale(0.96)`;
        pc.style.opacity = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => snapBack(pc)));
    }, 230);
}

// One gesture handler for the postcard. Sideways drags move the card with the
// finger; a downward drag shrinks the panel back into the mini card; a tap
// flips it. The story on the back still scrolls natively.
function initPostcard() {
    const pc = $('postcard');
    const deck = $('deck');
    const story = $('pc-story');
    const vt = velocityTracker();
    let g = null;

    const begin = (x, y, target) => {
        if (sheet.raf) return;                          // ignore touches while the panel is settling
        g = { x, y, t: performance.now(), dx: 0, dy: 0, axis: null, inStory: story.contains(target) };
        vt.reset();
        pc.style.transition = 'none';
    };

    const move = (x, y, e) => {
        if (!g) return;
        g.dx = x - g.x;
        g.dy = y - g.y;
        if (!g.axis) {
            if (Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) return;
            if (Math.abs(g.dx) > Math.abs(g.dy)) g.axis = 'x';
            else if (g.dy > 0 && (!g.inStory || story.scrollTop <= 0)) {
                g.axis = 'down';
                showMiniContent(ride.current);
                sheetPrepare();
            } else g.axis = 'scroll';                   // let the story scroll
        }
        if (g.axis === 'scroll') return;
        if (e && e.cancelable) e.preventDefault();      // never scroll the page
        if (g.axis === 'x') {
            vt.add(x);
            const edge = (ride.current === 0 && g.dx > 0) || (ride.current === ride.landmarks.length - 1 && g.dx < 0);
            const dx = edge ? g.dx * 0.28 : g.dx;       // resist at the ends of the deck
            pc.style.transform = `translateX(${dx}px) rotate(0deg)`;
            pc.style.opacity = String(1 - Math.min(Math.abs(dx) / 800, 0.3));
        } else {
            vt.add(y);
            sheetApply(1 - g.dy / sheet.range);
        }
    };

    const end = () => {
        if (!g) return;
        const { dx, axis, t } = g;
        g = null;
        pc.style.transition = '';
        if (!axis) {
            if (performance.now() - t < 450) setFlipped(!ride.flipped);   // tap
        } else if (axis === 'x') {
            const vx = vt.get();                        // px per second
            if (Math.abs(dx) > 90 || (Math.abs(vx) > 450 && Math.abs(dx) > 20)) {
                const dir = dx < 0 ? 1 : -1;
                goTo(ride.current + dir, dir);
            } else {
                snapBack(pc);
            }
        } else if (axis === 'down') {
            sheetRelease(vt.get());
        }
    };

    pc.addEventListener('touchstart', e => begin(e.touches[0].clientX, e.touches[0].clientY, e.target), { passive: true });
    pc.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
    pc.addEventListener('touchend', end);
    pc.addEventListener('touchcancel', () => {
        if (g && g.axis === 'down') sheetRelease(0);
        g = null;
        snapBack(pc);
    });

    // Mouse (desktop testing). Phones also fire mouse events after a touch; ignore those.
    let mouseDown = false;
    pc.addEventListener('mousedown', e => { if (Date.now() - lastTouchAt < 800) return; mouseDown = true; begin(e.clientX, e.clientY, e.target); });
    window.addEventListener('mousemove', e => { if (mouseDown) move(e.clientX, e.clientY, null); });
    window.addEventListener('mouseup', () => { if (mouseDown) { mouseDown = false; end(); } });

    pc.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!ride.flipped); }
        if (e.key === 'Escape') closeDeck();
        if (e.key === 'ArrowRight') goTo(ride.current + 1, 1);
        if (e.key === 'ArrowLeft') goTo(ride.current - 1, -1);
    });
    pc.tabIndex = 0;

    // Stop the page itself from moving if a drag starts on the deck's edges
    deck.addEventListener('touchmove', e => { if (!story.contains(e.target) && e.cancelable) e.preventDefault(); }, { passive: false });
}

// ---------- Audio ----------
// Landmark audio is switched off in this preview (Alfie's recordings aren't all
// made yet). The toggle slides on, shows "Audio is coming soon", then slides back.
// The landing page's "Hear Alfie" clip still plays.
let soonTimer = null;

function initAudioToggle() {
    const btn = $('audio-toggle');
    const soon = $('audio-soon');
    const hide = () => {
        clearTimeout(soonTimer);
        soon.classList.remove('is-shown');
        btn.classList.remove('is-on');
        btn.setAttribute('aria-pressed', 'false');
        setTimeout(() => { if (!soon.classList.contains('is-shown')) soon.hidden = true; }, 250);
    };
    btn.addEventListener('click', () => {
        if (soon.classList.contains('is-shown')) { hide(); return; }
        btn.classList.add('is-on');
        btn.setAttribute('aria-pressed', 'true');
        soon.hidden = false;
        requestAnimationFrame(() => soon.classList.add('is-shown'));
        clearTimeout(soonTimer);
        soonTimer = setTimeout(hide, 2600);
    });
    soon.addEventListener('click', hide);
}

// ---------- End / shortcuts ----------
function endTour() {
    if (confirm('End the ride?')) {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        window.location.href = '/v2';
    }
}

// Double-tap the next stop panel to open the route in Google Maps (demo shortcut kept from v1)
function initGoogleMapsShortcut() {
    const panel = $('next-panel');
    let lastTap = 0;
    panel.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTap < 300) { e.preventDefault(); openInGoogleMaps(); }
        lastTap = now;
    });
    panel.addEventListener('dblclick', e => { e.preventDefault(); openInGoogleMaps(); });
}

function openInGoogleMaps() {
    if (!ride.destination) return;
    let origin = 'Current Location';
    try {
        const s = JSON.parse(localStorage.getItem('pb_v2_start'));
        if (s) origin = s.address || s.name || origin;
    } catch (e) { /* keep default */ }
    const dest = ride.destination.address || ride.destination.name;
    const waypoints = ride.landmarks.slice(0, 5).map(lm => encodeURIComponent(lm.name + ', London')).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving${waypoints ? '&waypoints=' + waypoints : ''}`;
    window.location.href = url;
}
