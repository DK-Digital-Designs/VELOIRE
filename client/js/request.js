/**
 * VELOIRE — Multi-Step Request Access (ES Module)
 */
import { api } from './api.js';
import { ui } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("multi-step-rfa");
    if (!form) return;

    const steps = form.querySelectorAll(".form-step");
    const dots = document.querySelectorAll(".step-dot");
    let currentStep = 1;

    form.querySelectorAll(".next-step").forEach(btn => {
        btn.addEventListener("click", () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });

    form.querySelectorAll(".prev-step").forEach(btn => {
        btn.addEventListener("click", () => {
            goToStep(currentStep - 1);
        });
    });

    function goToStep(step) {
        steps.forEach(s => s.style.display = 'none');
        const nextStepEl = form.querySelector(`.form-step[data-step="${step}"]`);
        if (nextStepEl) {
            nextStepEl.style.display = 'block';
            currentStep = step;
            updateDots();
        }
    }

    function updateDots() {
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx + 1 === currentStep);
        });
    }

    function validateStep(step) {
        const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = stepEl.querySelectorAll("input[required], textarea[required]");
        let valid = true;
        inputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = "var(--error)";
                valid = false;
            } else {
                input.style.borderColor = "";
            }
        });
        return valid;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = form.querySelector("button[type='submit']");
        const payload = Object.fromEntries(new FormData(form).entries());

        const data = {
            ...payload,
            usageDescription: `[Experience: ${payload.experience}] [Intent: ${payload.usageDescription}]`
        };

        ui.setBtnLoading(btn, true);
        const json = await api.post('/requests', data);

        if (json.success) {
            form.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <h2>Application Submitted.</h2>
                    <p class="muted">A Veloire concierge will review your profile and reach out within 24 hours.</p>
                    <a href="../index.html" class="btn btn-primary" style="margin-top: 2rem;">Return Home</a>
                </div>
            `;
        } else {
            alert(json.error || "Submission failed");
            ui.setBtnLoading(btn, false);
        }
    });
});
