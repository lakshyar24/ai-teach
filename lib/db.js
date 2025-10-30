import { MongoClient } from 'mongodb';

let client;
let db;

export async function getDb() {
  if (!db) {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'ai_tutor_roadmap';
    
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    
    console.log('Connected to MongoDB:', dbName);
  }
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default { getDb, closeDb };