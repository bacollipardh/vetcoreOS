import { readFile } from 'node:fs/promises';
import { vetCoreBlueprint } from '../packages/shared/vetcore-blueprint.mjs';
import { clinicCoreFeatureCoverage, clinicCoreSeed, getClinicCoreSummary, listOwners, listPatients, listVisits } from '../packages/shared/clinic-core.mjs';
import { getHospitalizationSummary, hospitalizationFeatureCoverage } from '../packages/shared/hospitalizations.mjs';
import { getPrescriptionSummary, prescriptionFeatureCoverage } from '../packages/shared/prescriptions.mjs';
import { getSurgerySummary, surgeryFeatureCoverage } from '../packages/shared/surgeries.mjs';
import { getVaccinationSummary, vaccinationFeatureCoverage } from '../packages/shared/vaccinations.mjs';

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

for (const range of ['F046-F047', 'F048-F052', 'F053-F055']) {
  if (!vaccinationFeatureCoverage.some((coverage) => coverage.range === range)) {
    throw new Error(`Missing P2 vaccination coverage range ${range}`);
  }
}

for (const range of ['F056-F058', 'F059-F063', 'F064-F067']) {
  if (!prescriptionFeatureCoverage.some((coverage) => coverage.range === range)) {
    throw new Error(`Missing P2 prescription coverage range ${range}`);
  }
}

for (const range of ['F068-F069', 'F070-F073', 'F074-F077']) {
  if (!surgeryFeatureCoverage.some((coverage) => coverage.range === range)) {
    throw new Error(`Missing P2 surgery coverage range ${range}`);
  }
}

for (const range of ['F078-F080', 'F081-F082', 'F083-F085']) {
  if (!hospitalizationFeatureCoverage.some((coverage) => coverage.range === range)) {
    throw new Error(`Missing P2 hospitalization coverage range ${range}`);
  }
}

const summary = getClinicCoreSummary(clinicCoreSeed);
const vaccinationSummary = getVaccinationSummary(clinicCoreSeed);
const prescriptionSummary = getPrescriptionSummary(clinicCoreSeed);
const surgerySummary = getSurgerySummary(clinicCoreSeed);
const hospitalizationSummary = getHospitalizationSummary(clinicCoreSeed);
if (summary.counts.patients < 2 || summary.counts.owners < 2 || summary.counts.visits < 2 || vaccinationSummary.counts.vaccinations < 2 || prescriptionSummary.counts.prescriptions < 2 || surgerySummary.counts.surgeries < 2 || hospitalizationSummary.counts.stays < 2) {
  throw new Error('Clinic core seed data is incomplete');
}

if (!listPatients(clinicCoreSeed).every((patient) => patient.owners.length > 0)) {
  throw new Error('Every seed patient must have an owner relationship');
}

if (!listOwners(clinicCoreSeed).every((owner) => Array.isArray(owner.interactionTimeline))) {
  throw new Error('Every seed owner must expose interaction history');
}

if (!listVisits(clinicCoreSeed).every((visit) => visit.physicalExam && Array.isArray(visit.treatmentPlan))) {
  throw new Error('Every seed visit must include physical exam and treatment plan');
}

console.log(`Verified ${featureMatches.length} VetCoreOS feature IDs across ${vetCoreBlueprint.domains.length} domains.`);
console.log(`Verified P1 clinic core seed with ${summary.counts.patients} patients, ${summary.counts.owners} owners and ${summary.counts.visits} visits.`);

console.log(`Verified P2 vaccination seed with ${vaccinationSummary.counts.vaccinations} vaccines and ${vaccinationSummary.counts.overdue} overdue alerts.`);
console.log(`Verified P2 prescription seed with ${prescriptionSummary.counts.prescriptions} prescriptions and ${prescriptionSummary.counts.unsignedControlled} controlled alerts.`);
console.log(`Verified P2 surgery seed with ${surgerySummary.counts.surgeries} surgeries and ${surgerySummary.alerts.length} alerts.`);
console.log(`Verified P2 hospitalization seed with ${hospitalizationSummary.counts.stays} stays and ${hospitalizationSummary.counts.openTasks} open tasks.`);

