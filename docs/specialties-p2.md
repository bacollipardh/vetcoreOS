# P2 Specialty Modules

Feature IDs: `F109-F132`

This step adds the specialty workflow layer for companion specialty care, species-specific modules and advanced clinical records.

Implemented surface:

- Specialty registry with patient and visit linkage.
- Coverage tracking for `F109-F116`, `F117-F128` and `F129-F132`.
- API endpoints for listing, summarizing, creating and updating specialty records.
- UI worklist, alert panel, create form and detail modal inputs.
- Task closure, completion actions, findings, plan updates and quality-of-life scoring.
- Patient timeline integration so specialty events appear beside visits, labs, diagnostics and other clinical workflows.

Primary workflows now covered:

- Dentistry, reproduction, behavior, nutrition and weight management records.
- Equine, livestock, exotic, shelter/rescue and breeder module placeholders with operational data capture.
- End-of-life, hospice, necropsy and genetic-test oriented record fields.

Next enterprise hardening targets:

- Dental chart canvas and tooth-level status editing.
- Herd or batch treatment execution for livestock workflows.
- Longitudinal quality-of-life charts and hospice review thresholds.
