"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRouter = void 0;
const express_1 = require("express");
const listing_service_1 = require("../services/listing.service");
const errors_1 = require("../../../shared/utils/errors");
exports.listingRouter = (0, express_1.Router)();
const listingService = new listing_service_1.ListingService();
// Initialize service on startup
listingService.initialize().catch(console.error);
exports.listingRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await listingService.getListingById(id);
        res.json({ success: true, data: listing });
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
exports.listingRouter.get('/', async (req, res) => {
    try {
        const filters = {
            city: req.query.city,
            min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
            tags: req.query.tags ? req.query.tags.split(',') : undefined,
            near: req.query.near,
            radius_km: req.query.radius_km ? parseFloat(req.query.radius_km) : undefined
        };
        const listings = await listingService.searchListings(filters);
        res.json({ success: true, data: listings });
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
exports.listingRouter.post('/publish/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await listingService.publishListing(id);
        res.json({ success: true, data: listing });
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
