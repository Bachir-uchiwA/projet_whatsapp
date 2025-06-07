import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Mets cette variable dans tes secrets Vercel

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { phone, country } = req.body;
  try {
    await client.connect();
    const db = client.db(); // nom de la base dans l’URI
    const user = await db.collection('users').findOne({ phone, country });
    if (!user) {
      res.status(401).json({ error: 'Utilisateur non trouvé' });
      return;
    }
    // Crée une session (exemple simple)
    const session = {
      userId: user._id,
      phone,
      country,
      createdAt: new Date().toISOString()
    };
    const result = await db.collection('sessions').insertOne(session);
    session.id = result.insertedId;
    res.status(200).json(session);
  } catch (err) {
    console.error('Erreur API /api/login:', err); // <-- Ajoute ce log
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    await client.close();
  }
}
