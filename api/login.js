import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { phone, country } = req.body;
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(); // Utilise la base par défaut de l'URI
    const user = await db.collection('users').findOne({ phone, country });
    if (!user) {
      res.status(401).json({ error: 'Utilisateur non trouvé' });
      return;
    }
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
    // Log complet pour debug Vercel
    console.error('Erreur API /api/login:', err, err.stack);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  } finally {
    if (client) await client.close();
  }
}
