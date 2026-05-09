# VetCoreOS

VetCoreOS is a pan-European veterinary SaaS platform built from the full VetSaaS feature inventory. The project starts intentionally from a traceable skeleton so every future module can map back to the original feature IDs.

## Current Phase

`P0 Foundation Skeleton`

- Full feature inventory preserved in `docs/vetcore-feature-inventory.md`.
- Shared product blueprint lives in `packages/shared/vetcore-blueprint.mjs`.
- API skeleton exposes health and blueprint endpoints.
- Web skeleton displays product phases and domains.

## Run Locally

```powershell
npm run verify
npm run dev:api
npm run dev:web
```

Default URLs:

- API: `http://localhost:4100`
- Web: `http://localhost:4200`

## Build Rule

Every new module must reference the relevant feature IDs, for example `F001-F018` for patient records or `F169-F191` for inventory and pharmacy. This keeps scope visible and prevents silent loss of requirements.
