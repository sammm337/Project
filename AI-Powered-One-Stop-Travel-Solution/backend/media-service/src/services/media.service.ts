import { Pool } from 'pg';
import { connectDB } from '../db/connection';
import * as Minio from 'minio';
import { MediaUploadedEvent } from '../../../shared/dist/types/events';
import { Logger } from '../../../shared/dist/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export class MediaService {
  private db: Pool;
  private minioClient: Minio.Client;
  private bucketName: string = 'travel-media';
  private logger: Logger;

  constructor() {
    this.db = connectDB();
    this.logger = new Logger('media-service');
    
    // Internal Docker Connection (used for uploads)
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    const [host, portStr] = endpoint.split(':');
    const port = parseInt(portStr) || 9000;
    
    this.minioClient = new Minio.Client({
      endPoint: host,
      port: port,
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

      // ALWAYS Apply Public Read Policy
      // This allows browsers to access images directly like http://localhost:9000/bucket/image.jpg
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.info(`Updated bucket policy to Public Read for: ${this.bucketName}`);

    } catch (error) {
      this.logger.error('Failed to initialize MinIO bucket policy', error);
    }
  }

  async uploadFile(file: MulterFile): Promise<string> {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    const minioKey = `uploads/${timestamp}-${safeName}`;

    // 1. Upload using Internal Client
    await this.minioClient.putObject(
      this.bucketName,
      minioKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );

    this.logger.info(`Direct file upload: ${minioKey}`);

    // 2. Return a Direct Public URL (No signing required)
    // This points to localhost:9000 which works in your browser
    return `http://localhost:9000/${this.bucketName}/${minioKey}`;
  }

  async processMediaUpload(payload: MediaUploadedEvent['payload']) {
    try {
      let minioKey: string | undefined;
      let fileSize = 0;

      if (fs.existsSync(payload.filePath)) {
        const fileStats = fs.statSync(payload.filePath);
        fileSize = fileStats.size;
        const fileName = path.basename(payload.filePath);
        minioKey = `${payload.entityType}/${payload.entityId}/${fileName}`;
        await this.minioClient.fPutObject(this.bucketName, minioKey, payload.filePath);
      }

      const result = await this.db.query(
        `INSERT INTO media (entity_type, entity_id, file_path, file_type, file_size, minio_bucket, minio_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [payload.entityType, payload.entityId, payload.filePath, payload.fileType, fileSize, this.bucketName, minioKey]
      );
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error processing media upload`, error);
      throw error;
    }
  }

  async getMediaByEntity(entityType: string, entityId: string) {
    const result = await this.db.query('SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
    return result.rows;
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const result = await this.db.query('SELECT minio_bucket, minio_key FROM media WHERE id = $1', [mediaId]);
    if (result.rows.length === 0) throw new Error('Media not found');
    const { minio_bucket, minio_key } = result.rows[0];
    
    // Return Direct Public URL
    return `http://localhost:9000/${minio_bucket}/${minio_key}`;
  }
}