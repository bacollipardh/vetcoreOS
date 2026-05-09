import { readFile } from 'node:fs/promises';
import { vetCoreBlueprint } from '../packages/shared/vetcore-blueprint.mjs';
import { clinicCoreFeatureCoverage, getClinicCoreSummary, listOwners, listPatients, listVisits } from '../packages/shared/clinic-core.mjs';

const inventory = await readFile(new URL('../docs/vetcore-feature-inventory.md', import.meta.url), 'utf8');
const featureMatches = inventory.match(/^- \*\*F\d{3}\*\*/gm) || [];
const domainTotal = vetCoreBlueprint.domains.reduce((sum, domain) => sum + domain.featureCount, 0);

if (featureMatches.length !== vetCoreBlueprint.featureCount) {
  throw new Error(`Expected ${vetCoreBlueprint.featureCount} features, found ${featureMatches.length}`);
}

if (domainTotal !== vetCoreBlueprint.featureCount) {
  throw new Error(`Domain total ${domainTotal} does not match blueprint count ${vetCoreBlueprint.featureCount}`);
}

for (const range of ['F001-F018', 'F019-F029', 'F030-F045']) {
  if (!clinicCoreFeatureCoverage.some((coverage) => coverage.range === range)) {
    throw new Error(`Missing P1 feature coverage range ${range}`);
  }
}

const summary = getClinicCoreSummary();
if (summary.counts.patients < 2 || summary.counts.owners < 2 || summary.counts.visits < 2) {
  throw new Error('Clinic core demo data is incomplete');
}

if (!listPatients().every((patient) => patient.owners.length > 0)) {
  throw new Error('Every demo patient must have an owner relationship');
}

if (!listOwners().every((owner) => Array.isArray(owner.interactionTimeline))) {
  throw new Error('Every demo owner must expose interaction history');
}

if (!listVisits().every((visit) => visit.physicalExam && Array.isArray(visit.treatmentPlan))) {
  throw new Error('Every demo visit must include physical exam and treatment plan');
}

console.log(`Verified ${featureMatches.length} VetCoreOS feature IDs across ${vetCoreBlueprint.domains.length} domains.`);
console.log(`Verified P1 clinic core with ${summary.counts.patients} patients, ${summary.counts.owners} owners and ${summary.counts.visits} visits.`);
