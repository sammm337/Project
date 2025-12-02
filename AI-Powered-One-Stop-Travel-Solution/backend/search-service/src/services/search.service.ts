import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { connectPostgres, connectMongo } from '../db/connection';
import { VectorService } from './vector.service';
import { SearchFilters } from '../../../shared/dist/types/common';

export class SearchService {
  private db: Pool;
  private mongo: MongoClient | null = null;
  private vectorService: VectorService;

  constructor() {
    this.db = connectPostgres();
    this.vectorService = new VectorService();
  }

  async initialize() {
    this.mongo = await connectMongo();
    // Ensure collections exist
    await this.vectorService.createCollection('listings', 768);
    await this.vectorService.createCollection('events', 768);
  }

  async semanticSearch(query: string, filters: SearchFilters, mode: 'via_vendor' | 'via_agency' = 'via_vendor') {
    // Generate embedding for query
    const queryVector = await this.vectorService.generateEmbedding(query);

    // Determine which collection to search
    const collectionName = mode === 'via_vendor' ? 'listings' : 'events';

    // Search in vector database
    const vectorResults = await this.vectorService.search(collectionName, queryVector, 50);

    // Extract entity IDs from vector results
    const entityIds = vectorResults.map((result: any) => result.payload?.entityId || result.id).filter(Boolean);

    if (entityIds.length === 0) {
      return [];
    }

    // Fetch full details from Postgres with metadata filtering
    let sqlQuery = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (mode === 'via_vendor') {
      sqlQuery = `SELECT l.*, v.business_name as vendor_name 
               FROM listings l 
               LEFT JOIN vendors v ON l.vendor_id = v.id 
               WHERE l.id = ANY($${paramIndex++}) AND l.status = 'published'`;
      params.push(entityIds);
    } else {
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
    const scoreMap = new Map(vectorResults.map((r: any) => [r.payload?.entityId || r.id, r.score]));

    const results = dbResults.rows.map((row: any) => ({
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

