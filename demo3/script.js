// VELOIRE merged demo script.js

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------------------------
    // Smooth scroll for CTA buttons
    // ---------------------------------------------------------------------
    document.querySelectorAll(".js-scroll-to").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetSelector = btn.getAttribute("data-target");
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // ---------------------------------------------------------------------
    // Pre-approval / Request Access forms (index + car page)
    // ---------------------------------------------------------------------
    document.querySelectorAll("[data-rfa-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            alert(
                "Thank you. Your Request for Access has been captured for manual review.\n\n" +
                "(This is a front-end demo only.)"
            );
            form.reset();
        });
    });

    // ---------------------------------------------------------------------
    // Owner partner enquiry form
    // ---------------------------------------------------------------------
    const ownerForm = document.getElementById("owner-enquiry-form");
    if (ownerForm) {
        ownerForm.addEventListener("submit", event => {
            event.preventDefault();
            alert(
                "Thank you. A member of the VELOIRE team will contact you regarding your partnership enquiry.\n\n" +
                "(Demo only.)"
            );
            ownerForm.reset();
        });
    }

    // ---------------------------------------------------------------------
    // Newsletter / early access
    // ---------------------------------------------------------------------
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();
            alert(
                "Thank you. Your email has been added to the private early access list.\n\n" +
                "(Demo only.)"
            );
            newsletterForm.reset();
        });
    }

    // ---------------------------------------------------------------------
    // Admin navigation tab switching
    // (works on admin.html where .admin-nav-item / .admin-section exist)
    // ---------------------------------------------------------------------
    const adminNavItems = document.querySelectorAll(".admin-nav-item");
    const adminSections = document.querySelectorAll(".admin-section");

    if (adminNavItems.length && adminSections.length) {
        adminNavItems.forEach(button => {
            button.addEventListener("click", () => {
                const target = button.getAttribute("data-admin-section");

                adminNavItems.forEach(b => b.classList.remove("is-active"));
                button.classList.add("is-active");

                adminSections.forEach(section => {
                    section.classList.toggle(
                        "is-active",
                        section.id === `admin-${target}`
                    );
                });
            });
        });
    }

    // ---------------------------------------------------------------------
    // Admin request status toggles
    // ---------------------------------------------------------------------
    document.querySelectorAll("[data-rfa-row]").forEach(row => {
        const approveBtn = row.querySelector("[data-action='approve']");
        const rejectBtn = row.querySelector("[data-action='reject']");
        const resetBtn = row.querySelector("[data-action='reset']");
        const statusPill = row.querySelector(".status-pill");

        const setStatus = (status) => {
            if (!statusPill) return;

            statusPill.classList.remove("status-pending", "status-approved");
            if (status === "pending") {
                statusPill.textContent = "Pending";
                statusPill.classList.add("status-pending");
            } else if (status === "approved") {
                statusPill.textContent = "Approved";
                statusPill.classList.add("status-approved");
            } else if (status === "rejected") {
                statusPill.textContent = "Rejected";
                statusPill.classList.add("status-pending");
            }
        };

        if (approveBtn) {
            approveBtn.addEventListener("click", () => setStatus("approved"));
        }
        if (rejectBtn) {
            rejectBtn.addEventListener("click", () => setStatus("rejected"));
        }
        if (resetBtn) {
            resetBtn.addEventListener("click", () => setStatus("pending"));
        }
    });
});
