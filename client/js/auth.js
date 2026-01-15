/**
 * VELOIRE — Auth Module (ES Module)
 */
import { api } from './api.js';

let currentUser = null;

export async function checkAuth() {
    const json = await api.get('/auth/me');
    if (json.success) {
        currentUser = json.data.user;
        updateAuthUI();
        if (document.body.classList.contains("page-admin")) {
            if (window.showAdminUI) window.showAdminUI(true);
        }
    } else {
        if (document.body.classList.contains("page-admin")) {
            if (window.showAdminUI) window.showAdminUI(false);
        }
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

export async function login(email, password) {
    const json = await api.post('/auth/login', { email, password });
    if (json.success) {
        currentUser = json.data.user;
        updateAuthUI();
        if (window.showAdminUI) window.showAdminUI(true);
        return { success: true };
    }
    return { success: false, error: json.error };
}

export async function logout() {
    await api.post('/auth/logout', {});
    window.location.reload();
}

export const auth = { checkAuth, login, logout, getCurrentUser: () => currentUser };
window.veloireAuth = auth;

// Init auth on load
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});
