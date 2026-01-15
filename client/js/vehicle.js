/**
 * VELOIRE — Vehicle Profile Logic (ES Module)
 */
import { api } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const vehicleSlug = params.get('id');

    if (!vehicleSlug) {
        window.location.href = '/pages/fleet.html';
        return;
    }

    try {
        const json = await api.get(`/fleet/${vehicleSlug}`);
        if (json.success) {
            renderVehicle(json.data);
        } else {
            document.getElementById("vehicle-name").textContent = "Vehicle Not Found";
        }
    } catch (e) {
        console.error("Failed to load vehicle", e);
    }
});

function renderVehicle(vehicle) {
    document.title = `${vehicle.name} — VELOIRE`;

    const nameEl = document.getElementById("vehicle-name");
    const descEl = document.getElementById("vehicle-description");
    const idInput = document.getElementById("vehicle-id-input");
    const mediaRoot = document.getElementById("vehicle-hero-media");
    const specsRoot = document.getElementById("vehicle-specs");

    if (nameEl) nameEl.textContent = vehicle.name;
    if (descEl) descEl.textContent = vehicle.description || `The ${vehicle.name} offers unparalleled performance and presence.`;
    if (idInput) idInput.value = vehicle.id;

    if (mediaRoot && vehicle.heroImageUrl) {
        mediaRoot.innerHTML = `<img src="${vehicle.heroImageUrl}" alt="${vehicle.name}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);">`;
    }

    if (specsRoot) {
        let specs = [];
        try {
            const parsed = JSON.parse(vehicle.specsJson || '{}');
            specs = Object.entries(parsed).map(([k, v]) => ({
                label: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
                value: v
            }));
        } catch (e) {
            console.warn("Failed to parse specs", e);
        }

        if (specs.length === 0) {
            specs = [
                { label: 'Class', value: vehicle.type || 'Supercar' },
                { label: 'Year', value: vehicle.year },
                { label: 'Availability', value: 'Subject to Vetting' }
            ];
        }

        specsRoot.innerHTML = specs.map(s => `
            <div>
                <dt class="tiny muted uppercase">${s.label}</dt>
                <dd>${s.value}</dd>
            </div>
        `).join('');
    }
}
