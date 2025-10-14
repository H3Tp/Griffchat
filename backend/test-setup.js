// test-setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongoServer;
let client;
let db;

export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();

  db = client.db('testdb');
  return db;
};

export const disconnect = async () => {
  if (client) {
    await client.dropDatabase();
    await client.close();
  }
  if (mongoServer) await mongoServer.stop();
};

export const clearCollections = async () => {
  if (!db) return;
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const getDb = () => db;
