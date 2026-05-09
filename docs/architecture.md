# Architecture skeleton

VetCoreOS starts as a small monorepo with room to grow.

## Folders

- `apps/api`: HTTP API skeleton. Current endpoints are `/health` and `/blueprint`.
- `apps/web`: Web shell for product roadmap and domain visibility.
- `packages/shared`: Shared product metadata and feature blueprint.
- `docs`: Product inventory and implementation planning.
- `scripts`: Local verification utilities.

## Next architecture step

P1 should replace the temporary Node HTTP skeleton with the selected production stack, database schema and authentication model. Until then, this repo keeps the feature map visible and runnable without dependency installation.
