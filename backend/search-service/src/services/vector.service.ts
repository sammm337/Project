import axios, { AxiosInstance } from 'axios';
import { Logger } from '../../../shared/dist/utils/logger';

export class VectorService {
  private client: AxiosInstance;
  private qdrantUrl: string;
  private logger: Logger;

  constructor() {
    this.qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    this.client = axios.create({
      baseURL: this.qdrantUrl,
      timeout: 10000
    });
    this.logger = new Logger('vector-service');
  }

  async createCollection(collectionName: string, vectorSize: number = 384) {
    try {
      await this.client.put(`/collections/${collectionName}`, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine'
        }
      });
      this.logger.info(`Created collection: ${collectionName}`);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.status?.error?.includes('already exists')) {
        this.logger.info(`Collection ${collectionName} already exists`);
      } else {
        throw error;
      }
    }
  }

  async upsertPoint(collectionName: string, pointId: string, vector: number[], payload: any) {
    try {
      await this.client.put(`/collections/${collectionName}/points`, {
        points: [{
          id: pointId,
          vector,
          payload
        }]
      });
      this.logger.debug(`Upserted point ${pointId} in collection ${collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to upsert point in collection ${collectionName}`, error);
      throw error;
    }
  }

  async search(collectionName: string, queryVector: number[], limit: number = 10, filter?: any) {
    try {
      const response = await this.client.post(`/collections/${collectionName}/points/search`, {
        vector: queryVector,
        limit,
        filter,
        with_payload: true,
        with_vector: false
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to search in collection ${collectionName}`, error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // In production, this would call an embedding model API
    // For now, return a mock embedding (384 dimensions)
    // In a real implementation, you'd use a local model or API
    const embedding = new Array(384).fill(0).map(() => Math.random() - 0.5);
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
}

