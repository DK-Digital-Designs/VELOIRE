/**
 * VELOIRE — Fleet Explorer Logic (ES Module)
 */
import { api } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("fleet-explorer-grid");
    if (!grid) return;

    await loadFleet('all');

    // Filter logic
    document.querySelectorAll("[data-filter]").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadFleet(btn.getAttribute("data-filter"));
        });
    });
});

async function loadFleet(filter) {
    const grid = document.getElementById("fleet-explorer-grid");
    grid.innerHTML = '<div class="muted">Scanning collection...</div>';

    const json = await api.get('/fleet');
    if (json.success) {
        let vehicles = json.data;
        if (filter !== 'all') {
            vehicles = vehicles.filter(v => (v.type || '').includes(filter));
        }

        if (vehicles.length === 0) {
            grid.innerHTML = '<div class="muted">No matching vehicles found.</div>';
            return;
        }

        grid.innerHTML = vehicles.map(v => `
            <article class="card-minimal" data-animate>
                <div class="card-media">
                    <img src="${v.heroImageUrl || '../assets/ferarri.webp'}" alt="${v.name}">
                </div>
                <div class="card-details">
                    <h3>${v.name}</h3>
                    <p class="tiny muted uppercase">${v.type || 'Supercar'} · POA</p>
                    <a href="vehicle.html?id=${v.id}" class="link-minimal">View Profile →</a>
                </div>
            </article>
        `).join('');

        // Trigger animations
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('fade');
        });
    } else {
        grid.innerHTML = '<div class="error">Failed to load fleet.</div>';
    }
}
