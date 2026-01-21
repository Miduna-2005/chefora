// lib/mongodb.ts
import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Atlas requires TLS (default true)
const options = {
  serverSelectionTimeoutMS: 10000
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, options);
  await client.connect();

  const db = client.db("chefora");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
