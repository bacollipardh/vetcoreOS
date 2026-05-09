# P1 Clinic Core MVP

Status: in progress

Feature coverage:

- `F001-F018`: Patient profile, status, identifiers, owner links, weight history, BCS, allergies and behavior notes.
- `F019-F029`: Owner identity, address, contact channels, preferences, balance, private notes, tags and interactions.
- `F030-F045`: Visit type, anamnesis, physical exam, diagnoses, treatment plan, procedures, signature and continuity metadata.

## Current implementation

The P1 slice now has local CRUD backed by JSON storage:

- Seed clinical data lives in `packages/shared/clinic-core.mjs`.
- Runtime data is written to `apps/api/data/clinic-core.json` and ignored by Git.
- API exposes:
  - `GET /clinic/summary`
  - `GET /clinic/owners`
  - `POST /clinic/owners`
  - `PATCH /clinic/owners/:id`
  - `GET /clinic/patients`
  - `POST /clinic/patients`
  - `PATCH /clinic/patients/:id`
  - `GET /clinic/visits`
  - `POST /clinic/visits`
  - `PATCH /clinic/visits/:id`
- Web shell renders clinic core records and includes forms to create owners, patients and visits.
- Smoke checks validate create/update flows across all clinical resources.

## Next P1 slice

- Add structured validation with user-friendly error payloads.
- Add patient detail route with clinical timeline.
- Add persistent database schema and migrations when the product stack is selected.
