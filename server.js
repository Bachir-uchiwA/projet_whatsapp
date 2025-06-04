import jsonServer from 'json-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Configuration CORS et headers
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Content-Type', 'application/json');
    next();
});

// Middleware pour parser le JSON
server.use(jsonServer.bodyParser);

server.use(middlewares);

// Middleware de validation des données JSON
server.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});

server.use('/api', router); // Préfixe toutes les routes avec /api

// Start server if not in production
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`JSON Server is running on port ${PORT}`);
    });
}

export default server;