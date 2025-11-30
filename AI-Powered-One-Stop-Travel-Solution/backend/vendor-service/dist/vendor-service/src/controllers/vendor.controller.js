"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRouter = void 0;
const express_1 = require("express");
const vendor_service_1 = require("../services/vendor.service");
const errors_1 = require("../../../shared/utils/errors");
exports.vendorRouter = (0, express_1.Router)();
const vendorService = new vendor_service_1.VendorService();
// Initialize service on startup
vendorService.initialize().catch(console.error);
exports.vendorRouter.post('/create', async (req, res) => {
    try {
        const { userId, business_name, whatsapp_number, location } = req.body;
        const vendor = await vendorService.createVendor(userId, business_name, whatsapp_number, location);
        res.status(201).json({ success: true, data: vendor });
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
exports.vendorRouter.post('/create-package', async (req, res) => {
    try {
        const { vendorId, files, price, location, raw_text } = req.body;
        const result = await vendorService.createPackage(vendorId, files, price, location, raw_text);
        res.status(201).json({ success: true, data: result });
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
exports.vendorRouter.put('/update-package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updated = await vendorService.updatePackage(id, updates);
        res.json({ success: true, data: updated });
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
exports.vendorRouter.get('/packages/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const packages = await vendorService.getPackages(vendorId);
        res.json({ success: true, data: packages });
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
