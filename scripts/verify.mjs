import { readFile } from 'node:fs/promises';
import { vetCoreBlueprint } from '../packages/shared/vetcore-blueprint.mjs';

const inventory = await readFile(new URL('../docs/vetcore-feature-inventory.md', import.meta.url), 'utf8');
const featureMatches = inventory.match(/^- \*\*F\d{3}\*\*/gm) || [];
const domainTotal = vetCoreBlueprint.domains.reduce((sum, domain) => sum + domain.featureCount, 0);

if (featureMatches.length !== vetCoreBlueprint.featureCount) {
  throw new Error(`Expected ${vetCoreBlueprint.featureCount} features, found ${featureMatches.length}`);
}

if (domainTotal !== vetCoreBlueprint.featureCount) {
  throw new Error(`Domain total ${domainTotal} does not match blueprint count ${vetCoreBlueprint.featureCount}`);
}

console.log(`Verified ${featureMatches.length} VetCoreOS feature IDs across ${vetCoreBlueprint.domains.length} domains.`);
