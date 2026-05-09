# P1 Clinic Core MVP

Status: started

Feature coverage:

- `F001-F018`: Patient profile, status, identifiers, owner links, weight history, BCS, allergies and behavior notes.
- `F019-F029`: Owner identity, address, contact channels, preferences, balance, private notes, tags and interactions.
- `F030-F045`: Visit type, anamnesis, physical exam, diagnoses, treatment plan, procedures, signature and continuity metadata.

## Current implementation

The first P1 slice is intentionally dependency-light:

- Demo clinical data lives in `packages/shared/clinic-core.mjs`.
- API exposes:
  - `GET /clinic/summary`
  - `GET /clinic/owners`
  - `GET /clinic/patients`
  - `GET /clinic/visits`
- Web shell renders clinic core cards from the API.
- Smoke checks validate all clinical endpoints.

## Next P1 slice

- Add persistent storage and migrations.
- Add create/update forms for patients, owners and visits.
- Add patient detail timeline and critical allergy banner across clinical screens.
