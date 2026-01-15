/**
 * VELOIRE — Forms Interaction Module (ES Module)
 */
import { api } from './api.js';
import { ui } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    // RFA Submit
    document.querySelectorAll("[data-rfa-form]").forEach(form => {
        form.addEventListener("submit", async event => {
            event.preventDefault();
            const btn = form.querySelector("button[type='submit']");
            const payload = Object.fromEntries(new FormData(form).entries());

            const data = {
                clientName: payload.clientName || payload.fullName,
                clientEmail: payload.clientEmail || payload.email,
                phone: payload.phone,
                usageDescription: payload.usageDescription || payload.usage || payload.message,
                startDate: payload.startDate || null,
                endDate: payload.endDate || null,
                vehicleId: payload.vehicleId || form.getAttribute("data-vehicle-id") || null
            };

            ui.setBtnLoading(btn, true);
            const json = await api.post('/requests', data);

            if (json.success) {
                ui.showFormStatus(form, "Request submitted. We will contact you shortly.");
                form.reset();
            } else {
                ui.showFormStatus(form, json.error || "Submission failed", true);
            }
            ui.setBtnLoading(btn, false);
        });
    });

    // Owner Submit
    const ownerForm = document.getElementById("owner-enquiry-form");
    if (ownerForm) {
        ownerForm.addEventListener("submit", async event => {
            event.preventDefault();
            const btn = ownerForm.querySelector("button[type='submit']");
            const payload = Object.fromEntries(new FormData(ownerForm).entries());

            ui.setBtnLoading(btn, true);
            const json = await api.post('/owners/apply', payload);

            if (json.success) {
                ui.showFormStatus(ownerForm, "Enquiry sent. Thank you.");
                ownerForm.reset();
            } else {
                ui.showFormStatus(ownerForm, json.error || "Failed", true);
            }
            ui.setBtnLoading(btn, false);
        });
    }
});
