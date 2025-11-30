"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const connection_1 = require("../db/connection");
const Minio = __importStar(require("minio"));
const logger_1 = require("../../../shared/dist/utils/logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MediaService {
    constructor() {
        this.bucketName = 'travel-media';
        this.db = (0, connection_1.connectDB)();
        this.logger = new logger_1.Logger('media-service');
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
    async initializeBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.info(`Created bucket: ${this.bucketName}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize MinIO bucket', error);
        }
    }
    async processMediaUpload(payload) {
        try {
            // Copy file to MinIO if it exists locally
            let minioKey;
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
            const result = await this.db.query(`INSERT INTO media (entity_type, entity_id, file_path, file_type, file_size, minio_bucket, minio_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                payload.entityType,
                payload.entityId,
                payload.filePath,
                payload.fileType,
                fileSize,
                this.bucketName,
                minioKey
            ]);
            this.logger.info(`Stored media metadata for ${payload.entityType} ${payload.entityId}`);
            return result.rows[0];
        }
        catch (error) {
            this.logger.error(`Error processing media upload for ${payload.entityId}`, error);
            throw error;
        }
    }
    async getMediaByEntity(entityType, entityId) {
        const result = await this.db.query('SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
        return result.rows;
    }
    async getMediaUrl(mediaId, expiresIn = 3600) {
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
exports.MediaService = MediaService;
