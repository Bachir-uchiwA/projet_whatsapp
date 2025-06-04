import jsonServer from 'json-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Configuration CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

server.use(middlewares);
server.use('/api', router); // Préfixe toutes les routes avec /api

// Start server if not in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
  });
}

export default server;