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

