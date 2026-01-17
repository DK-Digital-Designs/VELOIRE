/**
 * VELOIRE — API Client (ES Module)
 */

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1';

export const api = {
    async get(endpoint) {
        try {
            const resp = await fetch(`${API_BASE}${endpoint}`);
            return await resp.json();
        } catch (e) {
            console.error(`GET ${endpoint} failed`, e);
            return { success: false, error: "Network error" };
        }
    },

    async post(endpoint, data) {
        try {
            const resp = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await resp.json();
        } catch (e) {
            console.error(`POST ${endpoint} failed`, e);
            return { success: false, error: "Network error" };
        }
    }
};

window.veloireApi = api;
export default api;
