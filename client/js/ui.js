/**
 * VELOIRE — UI Utilities (Overhaul)
 */

export const ui = {
    showFormStatus(form, message, isError = false) {
        let statusEl = form.querySelector(".form-status");
        if (!statusEl) {
            statusEl = document.createElement("p");
            statusEl.className = "form-status tiny";
            statusEl.style.marginTop = "1rem";
            form.appendChild(statusEl);
        }
        statusEl.textContent = message;
        statusEl.style.color = isError ? "var(--error)" : "var(--accent)";
    },

    setBtnLoading(btn, isLoading) {
        if (isLoading) {
            btn.disabled = true;
            btn.setAttribute("data-prev", btn.textContent);
            btn.textContent = "Processing...";
        } else {
            btn.disabled = false;
            btn.textContent = btn.getAttribute("data-prev") || "Submit";
        }
    }
};

window.veloireUI = ui;

document.addEventListener("DOMContentLoaded", () => {
    // Header Scroll Effect
    const header = document.querySelector(".header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
    });

    // Fade-in Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
});

export default ui;
