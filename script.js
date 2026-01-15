/**
 * VELOIRE Web App - script.js
 */

const API_BASE = '/api/v1';

document.addEventListener("DOMContentLoaded", () => {
    let currentUser = null;

    // ---------------------------------------------------------------------
    // Auth & UI State
    // ---------------------------------------------------------------------
    async function checkAuth() {
        try {
            const resp = await fetch(`${API_BASE}/auth/me`);
            const json = await resp.json();

            if (json.success) {
                currentUser = json.data.user;
                updateAuthUI();
                if (document.body.classList.contains("page-admin")) {
                    showAdminUI(true);
                }
            } else {
                if (document.body.classList.contains("page-admin")) {
                    showAdminUI(false);
                }
            }
        } catch (e) {
            console.error("Auth check failed", e);
        }
    }

    function updateAuthUI() {
        const adminUserInfo = document.getElementById("admin-user-info");
        const logoutBtn = document.getElementById("logout-btn");

        if (currentUser && adminUserInfo) {
            adminUserInfo.textContent = `LoggedIn: ${currentUser.email}`;
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        }
    }

    function showAdminUI(authenticated) {
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
    }

    // Login Form
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button");
            const data = Object.fromEntries(new FormData(loginForm).entries());

            setBtnLoading(btn, true);
            try {
                const resp = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await resp.json();
                if (json.success) {
                    currentUser = json.data.user;
                    updateAuthUI();
                    showAdminUI(true);
                } else {
                    alert(json.error || "Login failed");
                }
            } catch (err) {
                alert("Network error");
            } finally {
                setBtnLoading(btn, false);
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
            window.location.reload();
        });
    }

    checkAuth();

    // ---------------------------------------------------------------------
    // Forms & General Interactions
    // ---------------------------------------------------------------------
    function showFormStatus(form, message, isError = false) {
        let statusEl = form.querySelector(".form-status");
        if (!statusEl) {
            statusEl = document.createElement("p");
            statusEl.className = "form-status tiny";
            form.appendChild(statusEl);
        }
        statusEl.textContent = message;
        statusEl.style.color = isError ? "#ff4d4d" : "#d4af37";
    }

    function setBtnLoading(btn, isLoading) {
        if (isLoading) {
            btn.disabled = true;
            btn.setAttribute("data-prev", btn.textContent);
            btn.textContent = "Processing...";
        } else {
            btn.disabled = false;
            btn.textContent = btn.getAttribute("data-prev") || "Submit";
        }
    }

    // RFA Submit
    document.querySelectorAll("[data-rfa-form]").forEach(form => {
        form.addEventListener("submit", async event => {
            event.preventDefault();
            const btn = form.querySelector("button[type='submit']");
            const payload = Object.fromEntries(new FormData(form).entries());

            // Map common field names
            const data = {
                clientName: payload.clientName || payload.fullName,
                clientEmail: payload.clientEmail || payload.email,
                phone: payload.phone,
                usageDescription: payload.usageDescription || payload.usage || payload.message,
                startDate: payload.startDate || null,
                endDate: payload.endDate || null,
                vehicleId: form.getAttribute("data-vehicle-id") || null
            };

            setBtnLoading(btn, true);
            try {
                const resp = await fetch(`${API_BASE}/requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await resp.json();
                if (json.success) {
                    showFormStatus(form, "Request submitted. We will contact you shortly.");
                    form.reset();
                } else {
                    showFormStatus(form, json.error || "Submission failed", true);
                }
            } catch (e) { showFormStatus(form, "Network error", true); }
            finally { setBtnLoading(btn, false); }
        });
    });

    // Owner Submit
    const ownerForm = document.getElementById("owner-enquiry-form");
    if (ownerForm) {
        ownerForm.addEventListener("submit", async event => {
            event.preventDefault();
            const btn = ownerForm.querySelector("button[type='submit']");
            const payload = Object.fromEntries(new FormData(ownerForm).entries());

            setBtnLoading(btn, true);
            try {
                const resp = await fetch(`${API_BASE}/owners/apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await resp.json();
                if (json.success) {
                    showFormStatus(ownerForm, "Enquiry sent. Thank you.");
                    ownerForm.reset();
                } else { showFormStatus(ownerForm, json.error || "Failed", true); }
            } catch (e) { showFormStatus(ownerForm, "Network error", true); }
            finally { setBtnLoading(btn, false); }
        });
    }

    // Newsletter
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Added to early access list (stub)");
            newsletterForm.reset();
        });
    }

    // ---------------------------------------------------------------------
    // Admin Data Loading
    // ---------------------------------------------------------------------
    async function loadAdminMetrics() {
        const grid = document.querySelector(".admin-metrics");
        if (!grid) return;
        const res = await fetch(`${API_BASE}/admin/metrics`);
        const json = await res.json();
        if (json.success) {
            const numbers = grid.querySelectorAll(".metric-number");
            numbers[0].textContent = json.data.pendingRequests;
            numbers[1].textContent = json.data.approvedClients;
            numbers[2].textContent = json.data.liveVehicles;
        }
    }

    async function loadAdminRequests() {
        const container = document.querySelector("[data-admin-requests] tbody");
        if (!container) return;
        const res = await fetch(`${API_BASE}/admin/requests`);
        const json = await res.json();
        if (json.success) {
            container.innerHTML = json.data.map(req => `
                <tr>
                    <td><strong>${req.clientName}</strong><br><span class="tiny muted">${req.clientEmail}</span></td>
                    <td>${req.vehicle?.name || 'General'}</td>
                    <td>${new Date(req.startDate).toLocaleDateString()}</td>
                    <td><span class="status-pill status-${req.status.toLowerCase()}">${req.status}</span></td>
                    <td>
                        <button class="btn btn-xs" onclick="updateRfaStatus('${req.id}', 'approve')">Approve</button>
                        <button class="btn btn-xs btn-outline" onclick="updateRfaStatus('${req.id}', 'reject')">Reject</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Global helper for admin buttons (since they are injected as HTML strings)
    window.updateRfaStatus = async (id, action) => {
        const res = await fetch(`${API_BASE}/admin/requests/${id}/${action}`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
            loadAdminRequests();
            loadAdminMetrics();
        } else {
            alert(json.error);
        }
    };

    // Tab Switching
    document.querySelectorAll(".admin-nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-admin-section");
            document.querySelectorAll(".admin-nav-item").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            document.querySelectorAll(".admin-section").forEach(s => s.classList.toggle("is-active", s.id === `admin-${target}`));

            // Lazy load other sections
            if (target === 'fleet') loadAdminFleet();
            if (target === 'owners') loadAdminOwners();
            if (target === 'testimonials') loadAdminTestimonials();
        });
    });

    async function loadAdminFleet() {
        const container = document.querySelector("[data-admin-fleet] tbody");
        if (!container) return;
        const res = await fetch(`${API_BASE}/admin/fleet`);
        const json = await res.json();
        if (json.success) {
            container.innerHTML = json.data.map(v => `
                <tr>
                    <td>${v.name}</td>
                    <td>${v.owner?.name || 'N/A'}</td>
                    <td><span class="status-pill status-${v.status.toLowerCase()}">${v.status}</span></td>
                    <td><button class="btn btn-xs btn-ghost">Edit</button></td>
                </tr>
            `).join('');
        }
    }

    async function loadAdminOwners() {
        const container = document.querySelector("[data-admin-owners] tbody");
        if (!container) return;
        const res = await fetch(`${API_BASE}/admin/owners`);
        const json = await res.json();
        if (json.success) {
            container.innerHTML = json.data.map(o => `
                <tr>
                    <td><strong>${o.name}</strong><br><span class="tiny muted">${o.email}</span></td>
                    <td>${o.storageDescription || 'N/A'}</td>
                    <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td><button class="btn btn-xs btn-ghost">View</button></td>
                </tr>
            `).join('');
        }
    }

    async function loadAdminTestimonials() {
        const container = document.querySelector("[data-admin-testimonials] ul");
        if (!container) return;
        const res = await fetch(`${API_BASE}/admin/testimonials`);
        const json = await res.json();
        if (json.success) {
            container.innerHTML = json.data.map(t => `
                <li>
                    <p class="tiny muted">${t.vehicle.name} · ${new Date(t.createdAt).toLocaleDateString()}</p>
                    <p>“${t.content}”</p>
                    <div class="tiny muted">Status: <strong>${t.status}</strong></div>
                </li>
            `).join('');
        }
    }

    // Smooth Scroll
    document.querySelectorAll(".js-scroll-to").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.querySelector(btn.getAttribute("data-target"));
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
});
