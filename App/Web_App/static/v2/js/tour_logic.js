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
    audioOn: false,
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
        const marker = new google.maps.Marker({
            position: pos, map, title: lm.name, zIndex: 200 + idx,
            label: { text: String(idx + 1), color: '#ffffff', fontSize: '11px', fontWeight: '600' },
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#1e3a8a', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 }
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
    if (ride.audioOn) playStory(idx);
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
    ride.current = idx;
    $('mini-name').textContent = lm.name;
    $('mini-eyebrow').textContent = whereLine(idx, true);
    setImage($('mini-img'), lm.image_url);
    $('mini-live').hidden = !ride.audioOn;
    $('mini-card').hidden = false;
    $('swipe-hint').hidden = false;
}

function initMiniCard() {
    const mini = $('mini-card');
    let startY = null;
    let swiped = false;
    // Swipe up opens the postcard; a plain tap does too (via click)
    mini.addEventListener('touchstart', e => { startY = e.touches[0].clientY; swiped = false; }, { passive: true });
    mini.addEventListener('touchend', e => {
        if (startY === null) return;
        const dy = e.changedTouches[0].clientY - startY;
        startY = null;
        if (dy < -30) { swiped = true; openDeck(ride.current); }
    });
    mini.addEventListener('click', () => {
        if (swiped) { swiped = false; return; }
        openDeck(ride.current);
    });
}

function setImage(img, url) {
    if (url) {
        img.src = url;
        img.parentElement.classList.remove('is-empty');
    } else {
        img.removeAttribute('src');
        img.parentElement.classList.add('is-empty');
    }
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

function openDeck(idx) {
    if (!ride.landmarks[idx]) return;
    ride.userBrowsed = true;
    fillPostcard(idx);
    setFlipped(false);
    ride.deckOpen = true;
    $('mini-card').hidden = true;
    $('swipe-hint').hidden = true;
    $('pin-hint').hidden = true;
    $('deck').hidden = false;
    requestAnimationFrame(() => $('deck').classList.add('is-open'));
}

function closeDeck() {
    const deck = $('deck');
    deck.classList.remove('is-open');
    ride.deckOpen = false;
    setTimeout(() => {
        deck.hidden = true;
        showMini(ride.current);
    }, 220);
}

function setFlipped(on) {
    ride.flipped = on;
    $('postcard').classList.toggle('is-flipped', on);
}

function goTo(idx, direction) {
    if (idx < 0 || idx >= ride.landmarks.length) {
        // Nothing there: small nudge so the swipe still feels answered
        const pc = $('postcard');
        pc.classList.add(direction > 0 ? 'nudge-left' : 'nudge-right');
        setTimeout(() => pc.classList.remove('nudge-left', 'nudge-right'), 250);
        return;
    }
    const pc = $('postcard');
    pc.classList.add(direction > 0 ? 'out-left' : 'out-right');
    setTimeout(() => {
        fillPostcard(idx);
        setFlipped(false);
        pc.classList.remove('out-left', 'out-right');
        pc.classList.add(direction > 0 ? 'in-right' : 'in-left');
        requestAnimationFrame(() => requestAnimationFrame(() => pc.classList.remove('in-right', 'in-left')));
    }, 160);
}

// One gesture handler for the whole postcard: tap flips, swipe down minimises,
// swipe sideways moves through the deck. The story on the back still scrolls.
function initPostcard() {
    const pc = $('postcard');
    const story = $('pc-story');
    let start = null;

    const begin = (x, y, target) => {
        start = { x, y, t: Date.now(), inStory: story.contains(target), storyTop: story.scrollTop };
    };
    const finish = (x, y) => {
        if (!start) return;
        const dx = x - start.x;
        const dy = y - start.y;
        const dt = Date.now() - start.t;
        const s = start;
        start = null;

        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 400) {
            setFlipped(!ride.flipped);              // tap
        } else if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            goTo(ride.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);   // sideways
        } else if (dy > 60 && Math.abs(dy) > Math.abs(dx)) {
            // Down: minimise, unless the person is scrolling the story back up
            if (!s.inStory || (s.storyTop <= 0 && story.scrollTop <= 0)) closeDeck();
        }
    };

    let lastTouch = 0;
    pc.addEventListener('touchstart', e => { lastTouch = Date.now(); begin(e.touches[0].clientX, e.touches[0].clientY, e.target); }, { passive: true });
    pc.addEventListener('touchend', e => { lastTouch = Date.now(); finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY); });
    pc.addEventListener('touchcancel', () => { start = null; });
    // Mouse (desktop testing). Phones also fire mouse events after a tap; ignore those.
    pc.addEventListener('mousedown', e => { if (Date.now() - lastTouch > 800) begin(e.clientX, e.clientY, e.target); });
    pc.addEventListener('mouseup', e => { if (Date.now() - lastTouch > 800) finish(e.clientX, e.clientY); });
    pc.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!ride.flipped); }
        if (e.key === 'Escape') closeDeck();
        if (e.key === 'ArrowRight') goTo(ride.current + 1, 1);
        if (e.key === 'ArrowLeft') goTo(ride.current - 1, -1);
    });
    pc.tabIndex = 0;
}

// ---------- Audio ----------
// Plays Alfie's recording when one exists (narration.js); otherwise the phone's
// built-in voice reads the story. Off by default: phones only allow sound after a tap.
let currentAudio = null;

function initAudioToggle() {
    const btn = $('audio-toggle');
    btn.addEventListener('click', () => {
        ride.audioOn = !ride.audioOn;
        btn.setAttribute('aria-pressed', ride.audioOn ? 'true' : 'false');
        btn.classList.toggle('is-on', ride.audioOn);
        $('mini-live').hidden = !ride.audioOn;
        if (ride.audioOn) {
            // Play the story that's on screen, so the toggle has an instant effect
            if (ride.landmarks.length) playStory(ride.current);
        } else {
            stopStory();
        }
    });
}

function stopStory() {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function playStory(idx) {
    const lm = ride.landmarks[idx];
    if (!lm) return;
    stopStory();
    const file = (window.NARRATION || {})[lm.name];
    if (file) {
        currentAudio = new Audio(`/static/v2/audio/narration/${file}`);
        currentAudio.play().catch(() => speak(lm));
        return;
    }
    speak(lm);
}

function speak(lm) {
    if (!window.speechSynthesis || !lm.script) return;
    const utterance = new SpeechSynthesisUtterance(`${lm.name}. ${lm.script}`);
    utterance.lang = 'en-GB';
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB');
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
}

// ---------- End / shortcuts ----------
function endTour() {
    if (confirm('End the ride?')) {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        stopStory();
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
