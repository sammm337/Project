import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

let pgPool: Pool | null = null;
let mongoClient: MongoClient | null = null;

export function connectPostgres(): Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pgPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pgPool;
}

export async function connectMongo(): Promise<MongoClient> {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URL!);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
  }
  return mongoClient;
}

