/**
 * VELOIRE — Vendor Portal Logic
 */
import { api } from '../js/api.js';
import { ui } from '../js/ui.js';

document.addEventListener("DOMContentLoaded", () => {
    loadVendorMetrics();
    loadVendorFleet();
});

async function loadVendorMetrics() {
    const json = await api.get('/vendor/metrics');
    if (json.success) {
        const stats = document.querySelectorAll(".stat-num");
        if (stats.length >= 3) {
            stats[0].textContent = String(json.data.activeListings).padStart(2, '0');
            stats[1].textContent = json.data.totalYield;
            stats[2].textContent = json.data.utilization;
        }
    }
}

async function loadVendorFleet() {
    const container = document.getElementById("vendor-fleet-list");
    if (!container) return;

    const json = await api.get('/vendor/fleet');
    if (json.success && json.data.length > 0) {
        container.innerHTML = `
            <div class="grid grid-2" style="gap: 2rem; margin-top: 2rem;">
                ${json.data.map(v => `
                    <div class="card-minimal vendor-car-card" style="display: flex; gap: 2rem; align-items: center; padding: 1.5rem;">
                        <img src="${v.heroImageUrl}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; font-family: 'Playfair Display', serif;">${v.name}</h4>
                            <p class="tiny muted uppercase" style="margin: 0.2rem 0;">${v.status} · R2,500/day yield</p>
                        </div>
                        <div class="accent-pill" style="background: var(--surface-soft); color: var(--text);">Active</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `<p class="muted">No assets registered under your partnership yet.</p>`;
    }
}
