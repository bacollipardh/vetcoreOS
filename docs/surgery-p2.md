# P2 Surgery Workflow

Status: started

Feature coverage:

- `F068-F069`: Pre-operative planning checklist and anesthesia observations.
- `F070-F073`: Drugs given, structured surgery record and media-ready fields.
- `F074-F077`: Discharge instructions, follow-up scheduling, surgical safety checklist, estimate and consent.

## Current implementation

- API exposes:
  - `GET /clinic/surgeries/summary`
  - `GET /clinic/surgeries`
  - `POST /clinic/surgeries`
  - `PATCH /clinic/surgeries/:id`
- UI exposes a `Surgery` tab with metrics, surgery alerts, checklist progress and plan surgery form.
- Patient detail timeline includes surgery events.

## Next P2 slice

- Add 5-minute anesthesia chart editing.
- Add discharge instruction templates.
- Add surgical media attachments.
