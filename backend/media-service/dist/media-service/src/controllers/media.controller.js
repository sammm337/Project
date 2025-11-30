"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRouter = void 0;
const express_1 = require("express");
const media_service_1 = require("../services/media.service");
const errors_1 = require("../../../shared/utils/errors");
exports.mediaRouter = (0, express_1.Router)();
const mediaService = new media_service_1.MediaService();
exports.mediaRouter.get('/entity/:entityType/:entityId', async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const media = await mediaService.getMediaByEntity(entityType, entityId);
        res.json({ success: true, data: media });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ success: false, error: error.message });
        }
        else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});
exports.mediaRouter.get('/:id/url', async (req, res) => {
    try {
        const { id } = req.params;
        const expiresIn = req.query.expiresIn ? parseInt(req.query.expiresIn) : 3600;
        const url = await mediaService.getMediaUrl(id, expiresIn);
        res.json({ success: true, data: { url } });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ success: false, error: error.message });
        }
        else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});
