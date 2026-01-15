/**
 * VELOIRE — Admin Dashboard (ES Module)
 */
import { api } from './api.js';
import { auth } from './auth.js';
import { ui } from './ui.js';

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
                    <button class="btn btn-xs" onclick="window.updateRfaStatus('${req.id}', 'approve')">Approve</button>
                    <button class="btn btn-xs btn-ghost" onclick="window.updateRfaStatus('${req.id}', 'reject')">Reject</button>
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

    document.querySelectorAll(".admin-nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-admin-section");
            document.querySelectorAll(".admin-nav-item").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            document.querySelectorAll(".admin-section").forEach(s => {
                s.style.display = (s.id === `admin-${target}`) ? 'block' : 'none';
            });
            if (target === 'fleet') loadAdminFleet();
        });
    });
});

async function loadAdminFleet() {
    const container = document.querySelector("[data-admin-fleet] tbody");
    if (!container) return;
    const json = await api.get('/admin/fleet');
    if (json.success) {
        container.innerHTML = json.data.map(v => `
            <tr>
                <td>${v.name}</td>
                <td><span class="status-pill status-${v.status.toLowerCase()}">${v.status}</span></td>
                <td><button class="btn btn-xs btn-ghost">Edit</button></td>
            </tr>
        `).join('');
    }
}
