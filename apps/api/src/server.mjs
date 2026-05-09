import http from 'node:http';
import { vetCoreBlueprint } from '../../../packages/shared/vetcore-blueprint.mjs';
import { getClinicCoreSummary, listOwners, listPatients, listVisits } from '../../../packages/shared/clinic-core.mjs';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  response.end(JSON.stringify(payload, null, 2));
}

export function createVetCoreApiServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);

    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    if (url.pathname === '/health') {
      sendJson(response, 200, { status: 'ok', product: vetCoreBlueprint.product, timestamp: new Date().toISOString() });
      return;
    }

    if (url.pathname === '/blueprint') {
      sendJson(response, 200, vetCoreBlueprint);
      return;
    }

    if (url.pathname === '/clinic/summary') {
      sendJson(response, 200, getClinicCoreSummary());
      return;
    }

    if (url.pathname === '/clinic/owners') {
      sendJson(response, 200, { items: listOwners() });
      return;
    }

    if (url.pathname === '/clinic/patients') {
      sendJson(response, 200, { items: listPatients() });
      return;
    }

    if (url.pathname === '/clinic/visits') {
      sendJson(response, 200, { items: listVisits() });
      return;
    }

    sendJson(response, 404, {
      error: 'Not found',
      endpoints: ['/health', '/blueprint', '/clinic/summary', '/clinic/owners', '/clinic/patients', '/clinic/visits']
    });
  });
}
