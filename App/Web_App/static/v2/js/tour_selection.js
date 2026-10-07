// v2 Choose Theme: edition tiles with landmark counts, sorted by count.
// Uses the existing /api/check-tour-availability endpoint (shared with v1).
// Tapping a tile saves the theme and goes straight to the ride.

// EDITIONS comes from editions.js

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function tileHtml(key, count) {
    const e = EDITIONS[key];
    const nameStyle = `font-family:${e.font};font-weight:${e.weight};font-size:${e.size}px;${e.style ? `font-style:${e.style};` : ''}`;
    const label = count === 1 ? 'LANDMARK' : 'LANDMARKS';
    return `
        <button type="button" class="v2-tile${e.light ? ' v2-tile--light' : ''}" data-theme="${key}"
                style="--body:${e.body};--ink:${e.ink};--accent:${e.accent}"
                aria-label="${escapeHtml(e.name)}, ${count === null ? '' : count + ' landmarks'}">
            <span class="v2-tile-code">${e.code}</span>
            <svg class="v2-tile-glyph" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">${e.glyph}</svg>
            ${count === null ? '' : `<span class="v2-tile-count">${count}</span><span class="v2-tile-label">${label}</span>`}
            <span class="v2-tile-name" style="${nameStyle}">${escapeHtml(e.name)}</span>
        </button>`;
}

function renderTiles(counts) {
    const grid = document.getElementById('tile-grid');
    const keys = Object.keys(EDITIONS);
    let available;
    let unavailable = [];

    if (counts) {
        available = keys.filter(k => (counts[k] || 0) > 0).sort((a, b) => counts[b] - counts[a]);
        unavailable = keys.filter(k => !((counts[k] || 0) > 0));
    } else {
        available = keys; // couldn't check: show everything, without counts
    }

    let html = available.map(k => tileHtml(k, counts ? counts[k] : null)).join('');
    if (unavailable.length) {
        const codes = unavailable.map(k => EDITIONS[k].code.split(' ')[0]).join(' · ');
        const names = unavailable.map(k => EDITIONS[k].name).join(', ');
        html += `<div class="v2-tile v2-tile--off"><span class="v2-tile-code">${codes}</span><span class="v2-tile-off-names">${escapeHtml(names)}</span><span class="v2-tile-off-note">Not on this route</span></div>`;
    }
    grid.innerHTML = html;
    grid.setAttribute('aria-busy', 'false');

    grid.querySelectorAll('.v2-tile[data-theme]').forEach(tile => {
        tile.addEventListener('click', () => chooseTheme(tile.dataset.theme, tile));
    });
}

function chooseTheme(key, tile) {
    localStorage.setItem('pb_v2_tour_type', key);
    tile.classList.add('is-chosen');
    setTimeout(() => { window.location.href = '/v2/tour'; }, 180);
}

function getLocation(storageKey) {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    const loc = JSON.parse(saved);
    if (loc.lat && loc.lng) return `${loc.lat},${loc.lng}`;
    return loc.address || loc.name;
}

async function loadThemes() {
    const desc = document.getElementById('theme-desc');
    const start = getLocation('pb_v2_start') || 'Charing Cross, London';
    const savedEnd = localStorage.getItem('pb_v2_destination');
    if (!savedEnd) { window.location.href = '/v2'; return; }
    const endLoc = JSON.parse(savedEnd);
    const end = endLoc.address || endLoc.name;
    const key = `${start}|${end}`;

    // 1. Counts already fetched in the background on Choose Route: show them instantly
    try {
        const cached = JSON.parse(sessionStorage.getItem('pb_v2_theme_counts') || 'null');
        if (cached && cached.key === key) {
            desc.textContent = 'Sorted by landmarks on your route';
            renderTiles(cached.counts);
            return;
        }
    } catch (e) { /* ignore */ }

    // 2. Otherwise show every tile straight away and fill in the counts when they arrive
    renderTiles(null);
    desc.textContent = 'Counting landmarks on your route…';
    try {
        const response = await fetch('/api/check-tour-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start, end, mode: 'scenic' })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Check failed');
        sessionStorage.setItem('pb_v2_theme_counts', JSON.stringify({ key, counts: data.landmark_counts || {} }));
        desc.textContent = 'Sorted by landmarks on your route';
        renderTiles(data.landmark_counts || {});
    } catch (error) {
        console.error('[Choose Theme]', error);
        desc.textContent = 'Pick a theme for your ride';
    }
}

document.addEventListener('DOMContentLoaded', loadThemes);
