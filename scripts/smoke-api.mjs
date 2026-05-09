import { rm } from 'node:fs/promises';
import { createVetCoreApiServer } from '../apps/api/src/server.mjs';

await rm(new URL('../apps/api/data/clinic-core.json', import.meta.url), { force: true });

const server = createVetCoreApiServer();
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();

async function request(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${payload.error}`);
  return payload;
}

await request('/health');
await request('/blueprint');
const initialSummary = await request('/clinic/summary');
if (initialSummary.counts.patients < 2 || initialSummary.featureCoverage.length !== 3) throw new Error('Unexpected initial clinic summary');

const owner = await request('/clinic/owners', {
  method: 'POST',
  body: JSON.stringify({ displayName: 'Test Owner', phone: '+38344000000', email: 'test@example.com', city: 'Prishtine', tags: 'test' })
});
if (!owner.id) throw new Error('Owner create failed');

const patient = await request('/clinic/patients', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test Pet', ownerId: owner.id, species: 'Dog', breed: 'Mixed', microchip: '999000111222333', allergy: 'Chicken' })
});
if (!patient.id || patient.ownerIds[0] !== owner.id) throw new Error('Patient create failed');

const visit = await request('/clinic/visits', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, visitType: 'Smoke consultation', clinician: 'Dr. Smoke', anamnesis: 'Smoke test anamnesis', procedureName: 'Consult', procedureCost: 12.5 })
});
if (!visit.id || visit.patientId !== patient.id) throw new Error('Visit create failed');

const vaccination = await request('/clinic/vaccinations', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, vaccineName: 'Smoke rabies', protocol: 'Smoke protocol', manufacturer: 'SmokeLab', lotNumber: 'SMOKE-1', administeredAt: '2026-05-09', nextDueAt: '2027-05-09' })
});
if (!vaccination.id || vaccination.patientId !== patient.id || !vaccination.inventoryReduced) throw new Error('Vaccination create failed');

const prescription = await request('/clinic/prescriptions', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, visitId: visit.id, medicationName: 'Smoke med', catalogCode: 'ATCVET-SMOKE', defaultDoseMgPerKg: 0.5, patientWeightKg: 12.4, route: 'PO', frequency: 'BID', durationDays: 5, refillDueAt: '2026-05-14' })
});
if (!prescription.id || prescription.calculatedDoseMg <= 0) throw new Error('Prescription create failed');

const prescriptionSummary = await request('/clinic/prescriptions/summary');
if (prescriptionSummary.counts.prescriptions < 1 || prescriptionSummary.featureCoverage.length !== 3) throw new Error('Prescription summary failed');

const surgery = await request('/clinic/surgeries', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, visitId: visit.id, procedureName: 'Smoke surgery', surgeon: 'Dr. Smoke', estimate: 75, consentStatus: 'pending', checklist: 'Fasting confirmed, Consent signed' })
});
if (!surgery.id || surgery.patientId !== patient.id || surgery.preOpChecklist.length < 2) throw new Error('Surgery create failed');

const surgerySummary = await request('/clinic/surgeries/summary');
if (surgerySummary.counts.surgeries < 1 || surgerySummary.featureCoverage.length !== 3) throw new Error('Surgery summary failed');

const hospitalization = await request('/clinic/hospitalizations', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, visitId: visit.id, stayType: 'hospitalization', cage: 'Smoke Ward / Cage 1', acuity: 'routine', ownerVisibleStatus: 'Smoke stable', tasks: 'Nursing check, Feeding', shiftNote: 'Smoke handover', photoCaption: 'Smoke photo' })
});
if (!hospitalization.id || hospitalization.patientId !== patient.id || hospitalization.treatmentSheet.length < 2) throw new Error('Hospitalization create failed');

const hospitalizationSummary = await request('/clinic/hospitalizations/summary');
if (hospitalizationSummary.counts.stays < 1 || hospitalizationSummary.featureCoverage.length !== 3) throw new Error('Hospitalization summary failed');

const diagnostic = await request('/clinic/diagnostics', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id, visitId: visit.id, modality: 'X-ray', title: 'Smoke imaging', fileName: 'smoke-study.dcm', pacsLink: 'pacs://smoke/study', annotations: 'Smoke annotation', impression: 'Smoke diagnostic impression' })
});
if (!diagnostic.id || diagnostic.patientId !== patient.id || diagnostic.annotations.length < 1) throw new Error('Diagnostic create failed');

const diagnosticSummary = await request('/clinic/diagnostics/summary');
if (diagnosticSummary.counts.diagnostics < 1 || diagnosticSummary.featureCoverage.length !== 3) throw new Error('Diagnostic summary failed');

const updatedVisit = await request(`/clinic/visits/${visit.id}`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'signed', signedBy: 'Dr. Smoke', signedAt: new Date().toISOString() })
});
if (updatedVisit.status !== 'signed') throw new Error('Visit update failed');

const finalSummary = await request('/clinic/summary');
if (finalSummary.counts.patients !== initialSummary.counts.patients + 1) throw new Error('Summary did not update after CRUD operations');

server.close();
await rm(new URL('../apps/api/data/clinic-core.json', import.meta.url), { force: true });
console.log('API CRUD smoke checks passed.');


