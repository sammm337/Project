"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const connection_1 = require("../db/connection");
const vector_service_1 = require("./vector.service");
class SearchService {
    constructor() {
        this.mongo = null;
        this.db = (0, connection_1.connectPostgres)();
        this.vectorService = new vector_service_1.VectorService();
    }
    async initialize() {
        this.mongo = await (0, connection_1.connectMongo)();
        // Ensure collections exist
        await this.vectorService.createCollection('listings', 384);
        await this.vectorService.createCollection('events', 384);
    }
    async semanticSearch(query, filters, mode = 'via_vendor') {
        // Generate embedding for query
        const queryVector = await this.vectorService.generateEmbedding(query);
        // Determine which collection to search
        const collectionName = mode === 'via_vendor' ? 'listings' : 'events';
        // Search in vector database
        const vectorResults = await this.vectorService.search(collectionName, queryVector, 50);
        // Extract entity IDs from vector results
        const entityIds = vectorResults.map((result) => result.payload?.entityId || result.id).filter(Boolean);
        if (entityIds.length === 0) {
            return [];
        }
        // Fetch full details from Postgres with metadata filtering
        let sqlQuery = '';
        const params = [];
        let paramIndex = 1;
        if (mode === 'via_vendor') {
            sqlQuery = `SELECT l.*, v.business_name as vendor_name 
               FROM listings l 
               LEFT JOIN vendors v ON l.vendor_id = v.id 
               WHERE l.id = ANY($${paramIndex++}) AND l.status = 'published'`;
            params.push(entityIds);
        }
        else {
            sqlQuery = `SELECT e.*, a.business_name as agency_name 
               FROM events e 
               LEFT JOIN agencies a ON e.agency_id = a.id 
               WHERE e.id = ANY($${paramIndex++})`;
            params.push(entityIds);
        }
        // Apply additional filters
        if (filters.minPrice) {
            sqlQuery += ` AND price >= $${paramIndex++}`;
            params.push(filters.minPrice);
        }
        if (filters.maxPrice) {
            sqlQuery += ` AND price <= $${paramIndex++}`;
            params.push(filters.maxPrice);
        }
        if (filters.tags && filters.tags.length > 0) {
            sqlQuery += ` AND tags && $${paramIndex++}`;
            params.push(filters.tags);
        }
        if (filters.city) {
            sqlQuery += ` AND location->>'city' = $${paramIndex++}`;
            params.push(filters.city);
        }
        const dbResults = await this.db.query(sqlQuery, params);
        // Merge vector scores with database results
        const scoreMap = new Map(vectorResults.map((r) => [r.payload?.entityId || r.id, r.score]));
        const results = dbResults.rows.map((row) => ({
            ...row,
            score: scoreMap.get(row.id) || 0
        }));
        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);
        // Re-rank top results (in production, use a local LLM for re-ranking)
        // For now, just return top 10
        return results.slice(0, 10);
    }
}
exports.SearchService = SearchService;
