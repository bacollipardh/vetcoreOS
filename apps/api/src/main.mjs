import http from 'node:http';
import { vetCoreBlueprint } from '../../../packages/shared/vetcore-blueprint.mjs';

const port = Number(process.env.PORT || 4100);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*'
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);

  if (url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok', product: vetCoreBlueprint.product, timestamp: new Date().toISOString() });
    return;
  }

  if (url.pathname === '/blueprint') {
    sendJson(response, 200, vetCoreBlueprint);
    return;
  }

  sendJson(response, 404, { error: 'Not found', endpoints: ['/health', '/blueprint'] });
});

server.listen(port, () => {
  console.log(`VetCoreOS API listening on http://localhost:${port}`);
});
