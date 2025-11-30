"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectPostgres = connectPostgres;
exports.connectMongo = connectMongo;
const pg_1 = require("pg");
const mongodb_1 = require("mongodb");
let pgPool = null;
let mongoClient = null;
function connectPostgres() {
    if (!pgPool) {
        pgPool = new pg_1.Pool({
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
async function connectMongo() {
    if (!mongoClient) {
        mongoClient = new mongodb_1.MongoClient(process.env.MONGO_URL);
        await mongoClient.connect();
        console.log('Connected to MongoDB');
    }
    return mongoClient;
}
