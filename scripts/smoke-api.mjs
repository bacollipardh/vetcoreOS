import { createVetCoreApiServer } from '../apps/api/src/server.mjs';

const server = createVetCoreApiServer();
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();

async function check(path, predicate) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  const payload = await response.json();
  if (!predicate(payload)) throw new Error(`${path} returned unexpected payload`);
  return payload;
}

await check('/health', (payload) => payload.status === 'ok');
await check('/blueprint', (payload) => payload.featureCount === 487);
await check('/clinic/summary', (payload) => payload.counts?.patients >= 2 && payload.featureCoverage?.length === 3);
await check('/clinic/patients', (payload) => payload.items?.some((patient) => patient.microchip));
await check('/clinic/owners', (payload) => payload.items?.some((owner) => owner.patients?.length));
await check('/clinic/visits', (payload) => payload.items?.some((visit) => visit.physicalExam));

server.close();
console.log('API smoke checks passed.');
