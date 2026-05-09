import http from 'node:http';
import { vetCoreBlueprint } from '../../../packages/shared/vetcore-blueprint.mjs';
import { getClinicCoreSummary, listOwners, listPatients, listVisits } from '../../../packages/shared/clinic-core.mjs';
import { getPrescriptionSummary, listPrescriptions } from '../../../packages/shared/prescriptions.mjs';
import { getVaccinationSummary, listVaccinations } from '../../../packages/shared/vaccinations.mjs';
import { createOwner, createPatient, createPrescription, createVaccination, createVisit, readClinicState, updateOwner, updatePatient, updatePrescription, updateVaccination, updateVisit } from './clinic-repository.mjs';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function matchId(pathname, prefix) {
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const id = pathname.slice(prefix.length + 1);
  return id && !id.includes('/') ? id : null;
}

async function sendClinicPayload(response, mapper) {
  const state = await readClinicState();
  sendJson(response, 200, mapper(state));
}

export function createVetCoreApiServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);

    try {
      if (request.method === 'OPTIONS') {
        sendJson(response, 204, {});
        return;
      }

      if (request.method === 'GET' && url.pathname === '/health') {
        sendJson(response, 200, { status: 'ok', product: vetCoreBlueprint.product, timestamp: new Date().toISOString() });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/blueprint') {
        sendJson(response, 200, vetCoreBlueprint);
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/summary') {
        await sendClinicPayload(response, (state) => getClinicCoreSummary(state));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/owners') {
        await sendClinicPayload(response, (state) => ({ items: listOwners(state) }));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/patients') {
        await sendClinicPayload(response, (state) => ({ items: listPatients(state) }));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/visits') {
        await sendClinicPayload(response, (state) => ({ items: listVisits(state) }));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/vaccinations/summary') {
        await sendClinicPayload(response, (state) => getVaccinationSummary(state));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/vaccinations') {
        await sendClinicPayload(response, (state) => ({ items: listVaccinations(state) }));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/prescriptions/summary') {
        await sendClinicPayload(response, (state) => getPrescriptionSummary(state));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/clinic/prescriptions') {
        await sendClinicPayload(response, (state) => ({ items: listPrescriptions(state) }));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/clinic/owners') {
        sendJson(response, 201, await createOwner(await readBody(request)));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/clinic/patients') {
        sendJson(response, 201, await createPatient(await readBody(request)));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/clinic/visits') {
        sendJson(response, 201, await createVisit(await readBody(request)));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/clinic/vaccinations') {
        sendJson(response, 201, await createVaccination(await readBody(request)));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/clinic/prescriptions') {
        sendJson(response, 201, await createPrescription(await readBody(request)));
        return;
      }

      const ownerId = matchId(url.pathname, '/clinic/owners');
      if (request.method === 'PATCH' && ownerId) {
        const owner = await updateOwner(ownerId, await readBody(request));
        sendJson(response, owner ? 200 : 404, owner || { error: 'Owner not found' });
        return;
      }

      const patientId = matchId(url.pathname, '/clinic/patients');
      if (request.method === 'PATCH' && patientId) {
        const patient = await updatePatient(patientId, await readBody(request));
        sendJson(response, patient ? 200 : 404, patient || { error: 'Patient not found' });
        return;
      }

      const visitId = matchId(url.pathname, '/clinic/visits');
      if (request.method === 'PATCH' && visitId) {
        const visit = await updateVisit(visitId, await readBody(request));
        sendJson(response, visit ? 200 : 404, visit || { error: 'Visit not found' });
        return;
      }

      const vaccinationId = matchId(url.pathname, '/clinic/vaccinations');
      if (request.method === 'PATCH' && vaccinationId) {
        const vaccination = await updateVaccination(vaccinationId, await readBody(request));
        sendJson(response, vaccination ? 200 : 404, vaccination || { error: 'Vaccination not found' });
        return;
      }

      const prescriptionId = matchId(url.pathname, '/clinic/prescriptions');
      if (request.method === 'PATCH' && prescriptionId) {
        const prescription = await updatePrescription(prescriptionId, await readBody(request));
        sendJson(response, prescription ? 200 : 404, prescription || { error: 'Prescription not found' });
        return;
      }

      sendJson(response, 404, {
        error: 'Not found',
        endpoints: ['/health', '/blueprint', '/clinic/summary', '/clinic/owners', '/clinic/patients', '/clinic/visits', '/clinic/vaccinations', '/clinic/prescriptions']
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message || 'Bad request' });
    }
  });
}

