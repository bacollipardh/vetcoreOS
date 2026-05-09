# P2 Prescription and Dosing Workflow

Status: started

Feature coverage:

- `F056-F058`: Medication catalog metadata, default mg/kg dosing and automatic dose calculation from patient weight.
- `F059-F063`: Safety alert placeholders, contraindication hooks and controlled substance review.
- `F064-F067`: Printable prescription readiness, refill reminders and compliance tracking.

## Current implementation

- API exposes:
  - `GET /clinic/prescriptions/summary`
  - `GET /clinic/prescriptions`
  - `POST /clinic/prescriptions`
  - `PATCH /clinic/prescriptions/:id`
- UI exposes a `Prescriptions` tab with metrics, controlled drug alerts, refill reminders, prescription history and create prescription form.
- Patient detail timeline includes prescription events and calculated dose.

## Next P2 slice

- Add printable prescription PDF.
- Add drug interaction and breed contraindication rules.
- Add explicit client compliance check-in workflow.
