import { createVetCoreApiServer } from './server.mjs';

const port = Number(process.env.PORT || 4100);
const server = createVetCoreApiServer();

server.listen(port, () => {
  console.log(`VetCoreOS API listening on http://localhost:${port}`);
});
