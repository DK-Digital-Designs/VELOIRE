# Luxury Car Rental – Dev Workflows & Supporting Documentation

This document lists important **non-stack** decisions and artefacts: workflows, documentation, Git strategy, DB structure approaches, and client-facing docs.

---

## 1. Documentation Types

### 1.1 Developer-Facing Docs

1. **Architecture Overview**

    * System context diagram (frontend, backend, DB, external services).
    * Component diagrams for API, frontend, admin, integrations.

2. **API Specification**

    * REST endpoints, request/response shapes, auth flows.
    * Error codes and conventions.

3. **Database Schema & Data Model**

    * ERD / schema diagram (Cars, Bookings, Customers, Locations, Payments).
    * Indexing, constraints, relationship notes.

4. **Environment & Secrets Setup**

    * Required environment variables.
    * Secret management approach (Azure Key Vault, AWS Secrets Manager, etc.).

5. **Coding Standards & Conventions**

    * C# naming, folder structure, layering rules.
    * Frontend conventions (components, hooks, state management).

6. **Git & Branching Strategy**

    * Branch types (main, develop/staging, feature, hotfix).
    * Naming conventions, commit message style, PR template.

7. **CI/CD Pipeline Documentation**

    * Build, test, lint stages.
    * Deployment targets (dev/staging/prod).
    * Release process (tags, changelogs, rollback steps).

8. **Testing Strategy**

    * What is covered by unit tests, integration tests, E2E tests.
    * How to run tests locally and in CI.

9. **Monitoring & Observability**

    * Logging standards and log structure.
    * Metrics and alerting (uptime, error rates, latency).
    * Dashboards (e.g. Grafana, Application Insights).

10. **Infrastructure & Deployment**

    * Diagram of hosting (app services, containers, DB, CDN).
    * Backup/restore procedure.
    * Scaling strategy.

### 1.2 Client-Facing Docs

1. **Project Proposal / Overview**

    * Problem statement, solution summary.
    * Goals, timelines, and key milestones.

2. **Feature List / Scope Statement**

    * MVP vs Phase 2 features.
    * Clear inclusions/exclusions.

3. **Information Architecture & UX Flows**

    * Site map (pages, flows).
    * Booking journey steps with simple diagrams.

4. **Content Responsibilities**

    * What client must provide (copy, car photos, legal text).
    * What devs design/write.

5. **Service Level & Maintenance Plan**

    * Support channels, response windows (if any).
    * Update cadence for security/feature releases.

6. **Privacy & Data Handling Summary**

    * High-level explanation of what data is stored, where, and why.
    * Links to full privacy policy and terms.

7. **Handover & Training Guide**

    * Simple manual for using admin panel.
    * How to manage fleet, bookings, and content.

---

## 2. Git, Branching & Workflow Options

### 2.1 Branching Models

1. **GitHub Flow (Simple)**

    * `main` is always deployable.
    * Feature branches: `feature/booking-flow`, `feature/admin-dashboard`.
    * PR → review → merge to `main` → deploy.

2. **GitFlow (Release-Oriented)**

    * Long-lived branches: `main`, `develop`.
    * Feature branches from `develop`.
    * Release branches (`release/1.0.0`), hotfix branches (`hotfix/1.0.1`).

3. **Trunk-Based Development**

    * One main branch; very short-lived feature branches.
    * Heavy use of feature toggles.

**Decision levers:**

* Team size.
* Release cadence.
* Desire for long-lived release branches vs simplicity.

### 2.2 Branch Naming & Conventions

Examples (configurable):

* `feature/<area>-<short-description>`
* `fix/<issue-id>-<short-description>`
* `release/<version>`
* `hotfix/<version>`

### 2.3 Commit Messages & PRs

* Commit styles:

    * Conventional commits (`feat: add booking step`, `fix: correct price calc`).
* PR template:

    * Summary, screenshots, testing checklist, risk notes.

### 2.4 CI/CD Workflow

Stages to define:

* **On PR:**

    * Lint, format checks.
    * Unit tests (backend + frontend).
    * Build verification.

* **On merge to main/staging:**

    * Build artefacts.
    * Run tests.
    * Deploy to dev/staging environment.
    * Tag release (`v1.0.0`, etc.).

* **On tagged release:**

    * Deploy to production.
    * Generate changelog.

---

## 3. Databases, Schema & Data Workflows

### 3.1 DB Technology Choices

* Relational (recommended): PostgreSQL / SQL Server / MySQL.
* Optional extras:

    * Redis for caching (popular cars, lookups).
    * Search engine (Elasticsearch/OpenSearch/Algolia) for rich search.

### 3.2 Schema Design Options

Entities (conceptual):

* `Car` (make, model, year, class, dailyRate, status).
* `Booking` (carId, customerId, from, to, price, status).
* `Customer` (personal info, docs).
* `Location` (pickup/dropoff).
* `Payment` (amount, method, transactionId).
* `User` / `Admin` (accounts, roles).

Approaches:

* Normalized relational schema (most common).
* Read-optimised views/materialized views for reporting.
* Optional denormalized tables for analytics.

### 3.3 Migrations & Versioning

* Tools: EF Core migrations, Flyway, Liquibase, etc.
* Policies:

    * All schema changes via migrations.
    * Migration naming (`YYYYMMDDHHMM_<change>`).
    * Rollback strategy.

### 3.4 Data Lifecycle & Backups

* Backup policy: frequency, retention.
* Restore procedure: test periodically.
* Data retention rules (delete old data or archive).

---

## 4. Environments & Release Strategy

### 4.1 Environment Layout

* `local`: developer machines.
* `dev`: shared dev environment.
* `staging`: pre-production, mirrors prod as closely as possible.
* `prod`: live environment for clients/users.

Optional:

* Ephemeral preview environments per PR for frontend.

### 4.2 Release Strategy

* Versioning: semantic versioning (`MAJOR.MINOR.PATCH`).
* Release notes: generated from PRs or commits.
* Rollback: documented process (redeploy previous build; DB rollback strategy).

---

## 5. Testing & Quality Gates

### 5.1 Testing Types

* **Unit tests**: domain logic, pricing rules, availability checks.
* **Integration tests**: API endpoints, DB interactions.
* **E2E tests**: booking flow from frontend to backend.
* **Visual/UX checks**: screenshot comparison (optional).

### 5.2 Quality Gates

* Minimum test coverage thresholds (or at least trend tracking).
* Linting and formatting must pass before merging.
* Block merges on failing tests.

---

## 6. Monitoring, Logging & Security Practices

### 6.1 Logging & Monitoring

* Structured logs (JSON) with correlation IDs.
* Centralised log store (ELK, Application Insights, etc.).
* Metrics: request count, error rate, P95 latency, booking conversion.

### 6.2 Security Practices

* HTTPS everywhere.
* JWT/OAuth for auth; role-based access for admin.
* Input validation & sanitization.
* Regular dependency updating.
* Secrets never committed to Git.

---

## 7. Optional Supporting Artefacts

* **Design System & Component Library**

    * Token definitions (colors, spacing, typography).
    * Reusable components (buttons, cards, forms).

* **Content Style Guide**

    * Tone, brand voice, naming conventions.

* **API Usage Guide for Third Parties**

    * If client wants to expose certain endpoints to partners.

* **Ops Runbook**

    * Common incidents and how to resolve them.

These are all knobs the dev team can tune independent of the chosen tech stack.
