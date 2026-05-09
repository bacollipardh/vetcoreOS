# P2 Vaccination Workflow

Status: started

Feature coverage:

- `F046-F047`: Protocol metadata for species, age and country differences.
- `F048-F052`: Lot number, manufacturer, expiry, next dose scheduling and passport-ready history.
- `F053-F055`: Overdue alerts and inventory reduction marker.

## Current implementation

- API exposes:
  - `GET /clinic/vaccinations/summary`
  - `GET /clinic/vaccinations`
  - `POST /clinic/vaccinations`
  - `PATCH /clinic/vaccinations/:id`
- UI exposes a `Vaccinations` tab with metrics, overdue alerts, vaccination history and a record vaccine form.
- Patient detail timeline includes vaccine events.

## Next P2 slice

- Generate branded vaccination certificate PDF.
- Add per-country protocol rules.
- Connect vaccine administration to a real stock ledger.
