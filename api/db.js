import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed. Read-only API on Vercel.' });
    return;
  }
  const filePath = path.join(process.cwd(), 'db.json');
  // (Ce fichier lit en local, pas d'appel à l'API externe. Rien à changer.)
  const data = await fs.readFile(filePath, 'utf8');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(data);
}
