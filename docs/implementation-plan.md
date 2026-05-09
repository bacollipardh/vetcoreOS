# VetCoreOS implementation plan

## P0 Foundation Skeleton

Status: started

- Preserve full inventory in `docs/vetcore-feature-inventory.md`.
- Keep a shared blueprint in `packages/shared/vetcore-blueprint.mjs`.
- Expose `/health` and `/blueprint` from the API skeleton.
- Display phases and product domains in the web skeleton.

## P1 Clinic Core MVP

Feature IDs: `F001-F018`, `F019-F029`, `F030-F045`

- Patients and owners.
- Visits and consultation notes.
- Audit-friendly clinical timeline.

## P2 Medical Workflows

Feature IDs: `F046-F132`

- Vaccination, prescriptions and dose calculator.
- Surgery, hospitalization and diagnostics.
- Lab and specialty modules.

## P3 Operations, Stock, Finance

Feature IDs: `F133-F236`

- Scheduling and communication.
- Pharmacy inventory and controlled substances.
- Billing, payments, insurance and wellness plans.

## P4 Portal, Mobile, Analytics

Feature IDs: `F237-F298`

- Owner portal and telemedicine.
- Mobile app for owners and staff.
- Operational, clinical and financial analytics.

## P5 SaaS Scale & Ecosystem

Feature IDs: `F299-F487`

- Multi-tenancy, billing and compliance.
- Integrations, AI, network effects and platform infrastructure.
