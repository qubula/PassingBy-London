// v2 Choose Theme: edition tiles with landmark counts, sorted by count.
// Uses the existing /api/check-tour-availability endpoint (shared with v1).
// Tapping a tile saves the theme and goes straight to the ride.

// Edition colours and fonts: docs/design/handoff-in-ride-map.md ("Theme editions")
const EDITIONS = {
    all: {
        name: 'Surprise Me', code: '00 · OMNIA', body: '#111111', ink: '#ffffff', accent: '#EF4444',
        font: "'JetBrains Mono', monospace", style: 'italic', weight: 500, size: 16,
        glyph: '<path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z"/>'
    },
    royal: {
        name: 'Royal', code: '01 · REX', body: '#3A1C9C', ink: '#ffffff', accent: '#FFC629',
        font: "'Cinzel', serif", weight: 700, size: 15,
        glyph: '<path d="M3 17.5 L4 7 L8.5 11 L12 4 L15.5 11 L20 7 L21 17.5 Z"/><rect x="3" y="19" width="18" height="2.2"/>'
    },
    parks_gardens: {
        name: 'Parks & Gardens', code: '02 · FLORA', body: '#17803A', ink: '#ffffff', accent: '#C8F04B',
        font: "'Fraunces', serif", weight: 600, size: 18,
        glyph: '<circle cx="12" cy="9" r="6.5"/><rect x="11" y="14" width="2" height="7.5"/>'
    },
    historical: {
        name: 'Historical', code: '03 · ANNO', body: '#EAD9B0', ink: '#2A1A10', accent: '#B3261E', light: true,
        font: "'Grenze Gotisch', serif", weight: 600, size: 20,
        glyph: '<path d="M6 2.5h12v2.2l-4.6 7.3 4.6 7.3v2.2H6v-2.2l4.6-7.3L6 4.7z"/>'
    },
    architecture: {
        name: 'Architecture', code: '04 · FORMA', body: '#B8401C', ink: '#ffffff', accent: '#1E1E1E',
        font: "'Big Shoulders Display', sans-serif", weight: 700, size: 21,
        glyph: '<path d="M12 2.5l9 5.3H3z"/><rect x="4.5" y="9.5" width="2.6" height="8.5"/><rect x="10.7" y="9.5" width="2.6" height="8.5"/><rect x="16.9" y="9.5" width="2.6" height="8.5"/><rect x="3" y="19" width="18" height="2.5"/>'
    },
    museums_galleries: {
        name: 'Museums & Galleries', code: '05 · ARS', body: '#F2EFE8', ink: '#111111', accent: '#1E3FD8', light: true,
        font: "'Bodoni Moda', serif", weight: 600, size: 16,
        glyph: '<path fill-rule="evenodd" d="M2.5 4h19v16h-19zM5.5 7v10h13V7z"/><path d="M5.5 17l4.5-5 3.5 3.5 2-2 3 3.5z"/>'
    },
    religious: {
        name: 'Religious', code: '06 · FIDES', body: '#1F3A93', ink: '#ffffff', accent: '#F2B33D',
        font: "'Cormorant Garamond', serif", weight: 700, size: 20,
        glyph: '<path fill-rule="evenodd" d="M5 21.5V10a7 7 0 0 1 14 0v11.5zM11 7.5v12.5h2V7.5zM7.5 12.2v1.8h9v-1.8z"/>'
    },
    modern: {
        name: 'Modern London', code: '07 · NOVA', body: '#FF5A1F', ink: '#111111', accent: '#ffffff',
        font: "'Unbounded', sans-serif", weight: 500, size: 14,
        glyph: '<path fill-rule="evenodd" d="M12 2l6.5 19.5h-13zM11.4 7v14.5h1.2V7z"/>'
    },
    victorian: {
        name: 'Victorian Era', code: '08 · 1837', body: '#0E4B3B', ink: '#F3E3C3', accent: '#D4AF37',
        font: "'Abril Fatface', serif", weight: 400, size: 18,
        glyph: '<path fill-rule="evenodd" d="M7 3.5h10v11.5H7zM7 11.5v1.6h10v-1.6z"/><rect x="2.5" y="15" width="19" height="2.6" rx="1.3"/>'
    }
};

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
    const start = getLocation('pb_v2_start');
    const savedEnd = localStorage.getItem('pb_v2_destination');
    if (!savedEnd) { window.location.href = '/v2'; return; }
    const endLoc = JSON.parse(savedEnd);
    const end = endLoc.address || endLoc.name;

    try {
        const response = await fetch('/api/check-tour-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start: start || 'Charing Cross, London', end, mode: localStorage.getItem('pb_v2_route_mode') || 'scenic' })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Check failed');
        desc.textContent = 'Sorted by landmarks on your route';
        renderTiles(data.landmark_counts || {});
    } catch (error) {
        console.error('[Choose Theme]', error);
        desc.textContent = "Couldn't check your route. All themes are shown.";
        renderTiles(null);
    }
}

document.addEventListener('DOMContentLoaded', loadThemes);
