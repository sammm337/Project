"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = require("express");
const search_service_1 = require("../services/search.service");
const errors_1 = require("../../../shared/dist/utils/errors");
exports.searchRouter = (0, express_1.Router)();
const searchService = new search_service_1.SearchService();
// Initialize service on startup
searchService.initialize().catch(console.error);
exports.searchRouter.post('/semantic', async (req, res) => {
    try {
        const { q, filters, mode } = req.body;
        if (!q) {
            return res.status(400).json({ success: false, error: 'Query string is required' });
        }
        const results = await searchService.semanticSearch(q, filters || {}, mode || 'via_vendor');
        res.json({ success: true, data: results });
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
