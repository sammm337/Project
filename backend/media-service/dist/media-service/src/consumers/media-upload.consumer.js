"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadConsumer = void 0;
const logger_1 = require("../../../shared/utils/logger");
class MediaUploadConsumer {
    constructor(mq, mediaService) {
        this.mq = mq;
        this.mediaService = mediaService;
        this.logger = new logger_1.Logger('media-upload-consumer');
    }
    async start() {
        await this.mq.subscribe('media.uploaded', async (payload) => {
            try {
                await this.mediaService.processMediaUpload(payload);
                this.logger.info(`Processed media upload for ${payload.entityType} ${payload.entityId}`);
            }
            catch (error) {
                this.logger.error(`Error processing media upload for ${payload.entityId}`, error);
                throw error;
            }
        }, 'media-service-upload');
    }
}
exports.MediaUploadConsumer = MediaUploadConsumer;
