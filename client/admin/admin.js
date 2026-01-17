/**
 * VELOIRE — Admin Dashboard (ES Module)
 */
import { api } from '../js/api.js';
import { auth } from '../js/auth.js';
import { ui } from '../js/ui.js';

window.showAdminUI = function (authenticated) {
    const overlay = document.getElementById("admin-login-overlay");
    const sidebar = document.getElementById("admin-sidebar");
    const content = document.getElementById("admin-main-content");

    if (authenticated) {
        if (overlay) overlay.style.display = 'none';
        if (sidebar) sidebar.style.display = 'block';
        if (content) content.style.display = 'block';
        loadAdminMetrics();
        loadAdminRequests();
    } else {
        if (overlay) overlay.style.display = 'flex';
        if (sidebar) sidebar.style.display = 'none';
        if (content) content.style.display = 'none';
    }
};

async function loadAdminMetrics() {
    const json = await api.get('/admin/metrics');
    if (json.success) {
        document.getElementById("metric-pending").textContent = json.data.pendingRequests;
        document.getElementById("metric-approved").textContent = json.data.approvedClients;
        document.getElementById("metric-live").textContent = json.data.liveVehicles;
    }
}

async function loadAdminRequests() {
    const container = document.querySelector("[data-admin-requests] tbody");
    if (!container) return;
    const json = await api.get('/admin/requests');
    if (json.success) {
        container.innerHTML = json.data.map(req => `
            <tr>
                <td><strong>${req.clientName}</strong><br><span class="tiny muted">${req.clientEmail}</span></td>
                <td>${req.vehicle?.name || 'General Access'}</td>
                <td>${new Date(req.startDate).toLocaleDateString()}</td>
                <td><span class="status-pill status-${req.status.toLowerCase()}">${req.status}</span></td>
                <td>
                    ${req.status === 'PENDING' ? `
                        <button class="btn btn-xs" onclick="window.updateRfaStatus('${req.id}', 'approve')">Approve</button>
                        <button class="btn btn-xs btn-ghost" onclick="window.updateRfaStatus('${req.id}', 'reject')">Reject</button>
                    ` : `<span class="tiny muted">Actioned</span>`}
                </td>
            </tr>
        `).join('');
    }
}

window.updateRfaStatus = async (id, action) => {
    const json = await api.post(`/admin/requests/${id}/${action}`, {});
    if (json.success) {
        loadAdminRequests();
        loadAdminMetrics();
    } else {
        alert(json.error);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button");
            const data = Object.fromEntries(new FormData(loginForm).entries());
            ui.setBtnLoading(btn, true);
            const res = await auth.login(data.email, data.password);
            if (!res.success) alert(res.error);
            ui.setBtnLoading(btn, false);
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => auth.logout());
    }

    const addVehicleForm = document.getElementById("add-vehicle-form");
    if (addVehicleForm) {
        addVehicleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = addVehicleForm.querySelector("button");
            const data = Object.fromEntries(new FormData(addVehicleForm).entries());

            // Basic slug generation if empty
            if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

            ui.setBtnLoading(btn, true);
            const res = await api.post('/admin/fleet', data);
            ui.setBtnLoading(btn, false);

            if (res.success) {
                document.getElementById('add-vehicle-overlay').style.display = 'none';
                addVehicleForm.reset();
                loadAdminFleet();
                loadAdminMetrics();
            } else {
                alert(res.error || "Failed to create vehicle");
            }
        });
    }
});

async function loadAdminFleet() {
    const container = document.querySelector("[data-admin-fleet] tbody");
    if (!container) return;
    const json = await api.get('/admin/fleet');
    if (json.success) {
        container.innerHTML = json.data.map(v => `
            <tr>
                <td><strong>${v.name}</strong><br><span class="tiny muted">${v.make} ${v.model} (${v.year || ''})</span></td>
                <td><span class="status-pill status-${v.status.toLowerCase()}">${v.status}</span></td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-xs btn-outline" onclick="window.openEditVehicle('${v.id}')">Edit</button>
                    <button class="btn btn-xs btn-ghost" onclick="window.deleteVehicle('${v.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

window.openEditVehicle = async (id) => {
    const json = await api.get(`/fleet/${id}`); // Use public endpoint to get details
    if (json.success) {
        const v = json.data;
        const modal = document.getElementById('edit-vehicle-overlay');
        const form = document.getElementById('edit-vehicle-form');

        form.id_hidden = v.id; // Store ID
        form.querySelector('[name="id"]').value = v.id;
        form.querySelector('[name="make"]').value = v.make;
        form.querySelector('[name="model"]').value = v.model;
        form.querySelector('[name="year"]').value = v.year;
        form.querySelector('[name="status"]').value = v.status;
        form.querySelector('[name="name"]').value = v.name;
        form.querySelector('[name="heroImageUrl"]').value = v.heroImageUrl;
        form.querySelector('[name="summary"]').value = v.summary;
        form.querySelector('[name="specsJson"]').value = v.specsJson || '';

        modal.style.display = 'flex';
    }
};

// Handle edit form submission
document.addEventListener("DOMContentLoaded", () => {
    const editForm = document.getElementById("edit-vehicle-form");
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = editForm.querySelector("button");
            const formData = new FormData(editForm);
            const id = formData.get('id');
            const data = Object.fromEntries(formData.entries());

            ui.setBtnLoading(btn, true);
            const res = await api.patch(`/admin/fleet/${id}`, data);
            ui.setBtnLoading(btn, false);

            if (res.success) {
                document.getElementById('edit-vehicle-overlay').style.display = 'none';
                loadAdminFleet();
                loadAdminMetrics();
            } else {
                alert(res.error || "Failed to update vehicle");
            }
        });
    }
});

window.deleteVehicle = async (id) => {
    if (!confirm("Are you sure you want to decommission this vehicle?")) return;
    const json = await api.delete(`/admin/fleet/${id}`);
    if (json.success) {
        loadAdminFleet();
        loadAdminMetrics();
    } else {
        alert(json.error || "Failed to delete vehicle");
    }
};
