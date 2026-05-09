import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 4200);
const root = fileURLToPath(new URL('.', import.meta.url));
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8']
]);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const pathname = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
  const filePath = join(root, pathname);

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes.get(extname(filePath)) || 'text/plain; charset=utf-8' });
    response.end(content);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`VetCoreOS web listening on http://localhost:${port}`);
});
