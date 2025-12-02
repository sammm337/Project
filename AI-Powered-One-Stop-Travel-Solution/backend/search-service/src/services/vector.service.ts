import axios, { AxiosInstance } from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../../../shared/dist/utils/logger';

export class VectorService {
  private client: AxiosInstance;
  private qdrantUrl: string;
  private logger: Logger;
  private genAI: GoogleGenerativeAI | null = null;
  private embeddingProvider: 'GEMINI' | 'OLLAMA';

  constructor() {
    this.qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    this.client = axios.create({
      baseURL: this.qdrantUrl,
      timeout: 10000
    });
    this.logger = new Logger('vector-service');
    
    // Determine provider (default to GEMINI if not set)
    this.embeddingProvider = (process.env.EMBEDDING_PROVIDER as 'GEMINI' | 'OLLAMA') || 'GEMINI';

    if (this.embeddingProvider === 'GEMINI') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        this.logger.warn('GEMINI_API_KEY is missing. Semantic search will fail if using Gemini.');
      } else {
        this.genAI = new GoogleGenerativeAI(apiKey);
      }
    }
  }

  async createCollection(collectionName: string, vectorSize: number = 768) {
    try {
      await this.client.put(`/collections/${collectionName}`, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine'
        }
      });
      this.logger.info(`Created collection: ${collectionName} with size ${vectorSize}`);
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
    if (this.embeddingProvider === 'GEMINI') {
        return this.generateGeminiEmbedding(text);
    } else {
        return this.generateOllamaEmbedding(text);
    }
  }

  private async generateGeminiEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) throw new Error('Gemini API not initialized');
    try {
      const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      return embedding.values;
    } catch (error) {
      this.logger.error('Failed to generate Gemini embedding', error);
      throw error;
    }
  }

  private async generateOllamaEmbedding(text: string): Promise<number[]> {
    try {
      // If running in Docker, use host.docker.internal to reach host machine's Ollama
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';
      const response = await axios.post(`${ollamaUrl}/api/embeddings`, {
        model: "nomic-embed-text",
        prompt: text
      });
      return response.data.embedding;
    } catch (error) {
      this.logger.error('Failed to generate Ollama embedding', error);
      throw error;
    }
  }
}