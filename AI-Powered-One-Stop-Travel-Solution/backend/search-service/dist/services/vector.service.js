"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../../shared/dist/utils/logger");
class VectorService {
    constructor() {
        this.qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
        this.client = axios_1.default.create({
            baseURL: this.qdrantUrl,
            timeout: 10000
        });
        this.logger = new logger_1.Logger('vector-service');
    }
    async createCollection(collectionName, vectorSize = 384) {
        try {
            await this.client.put(`/collections/${collectionName}`, {
                vectors: {
                    size: vectorSize,
                    distance: 'Cosine'
                }
            });
            this.logger.info(`Created collection: ${collectionName}`);
        }
        catch (error) {
            if (error.response?.status === 400 && error.response?.data?.status?.error?.includes('already exists')) {
                this.logger.info(`Collection ${collectionName} already exists`);
            }
            else {
                throw error;
            }
        }
    }
    async upsertPoint(collectionName, pointId, vector, payload) {
        try {
            await this.client.put(`/collections/${collectionName}/points`, {
                points: [{
                        id: pointId,
                        vector,
                        payload
                    }]
            });
            this.logger.debug(`Upserted point ${pointId} in collection ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`Failed to upsert point in collection ${collectionName}`, error);
            throw error;
        }
    }
    async search(collectionName, queryVector, limit = 10, filter) {
        try {
            const response = await this.client.post(`/collections/${collectionName}/points/search`, {
                vector: queryVector,
                limit,
                filter,
                with_payload: true,
                with_vector: false
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to search in collection ${collectionName}`, error);
            throw error;
        }
    }
    async generateEmbedding(text) {
        // In production, this would call an embedding model API
        // For now, return a mock embedding (384 dimensions)
        // In a real implementation, you'd use a local model or API
        const embedding = new Array(384).fill(0).map(() => Math.random() - 0.5);
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / magnitude);
    }
}
exports.VectorService = VectorService;
