import { Pool } from 'pg';
import { connectDB } from '../db/connection';
import * as Minio from 'minio';
import { MediaUploadedEvent } from '../../../shared/dist/types/events';
import { Logger } from '../../../shared/dist/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class MediaService {
  private db: Pool;
  private minioClient: Minio.Client;
  private bucketName: string = 'travel-media';
  private logger: Logger;

  constructor() {
    this.db = connectDB();
    this.logger = new Logger('media-service');
    
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    const [host, port] = endpoint.split(':');
    
    this.minioClient = new Minio.Client({
      endPoint: host,
      port: parseInt(port) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.info(`Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize MinIO bucket', error);
    }
  }

  async processMediaUpload(payload: MediaUploadedEvent['payload']) {
    try {
      // Copy file to MinIO if it exists locally
      let minioKey: string | undefined;
      let fileSize = 0;

      if (fs.existsSync(payload.filePath)) {
        const fileStats = fs.statSync(payload.filePath);
        fileSize = fileStats.size;
        
        const fileName = path.basename(payload.filePath);
        minioKey = `${payload.entityType}/${payload.entityId}/${fileName}`;

        await this.minioClient.fPutObject(this.bucketName, minioKey, payload.filePath);
        this.logger.info(`Uploaded file to MinIO: ${minioKey}`);
      }

      // Store metadata in Postgres
      const result = await this.db.query(
        `INSERT INTO media (entity_type, entity_id, file_path, file_type, file_size, minio_bucket, minio_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          payload.entityType,
          payload.entityId,
          payload.filePath,
          payload.fileType,
          fileSize,
          this.bucketName,
          minioKey
        ]
      );

      this.logger.info(`Stored media metadata for ${payload.entityType} ${payload.entityId}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error processing media upload for ${payload.entityId}`, error);
      throw error;
    }
  }

  async getMediaByEntity(entityType: string, entityId: string) {
    const result = await this.db.query(
      'SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2',
      [entityType, entityId]
    );
    return result.rows;
  }

  async getMediaUrl(mediaId: string, expiresIn: number = 3600): Promise<string> {
    const result = await this.db.query('SELECT minio_bucket, minio_key FROM media WHERE id = $1', [mediaId]);
    
    if (result.rows.length === 0) {
      throw new Error('Media not found');
    }

    const { minio_bucket, minio_key } = result.rows[0];
    
    if (!minio_key) {
      throw new Error('Media file not found in storage');
    }

    return await this.minioClient.presignedGetObject(minio_bucket, minio_key, expiresIn);
  }
}

