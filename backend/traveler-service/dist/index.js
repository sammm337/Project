"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3011;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:3007';
// This service acts as a proxy to the traveler agent
// In production, this would call the actual traveler agent service
app.post('/api/traveler/search', async (req, res) => {
    try {
        const { q, filters, mode, userId } = req.body;
        // Proxy to search service
        const response = await axios_1.default.post(`${SEARCH_SERVICE_URL}/search/semantic`, {
            q,
            filters,
            mode
        });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/traveler/recommend', async (req, res) => {
    try {
        const { userId, mode } = req.body;
        // Stub implementation - in production, this would call the traveler agent
        res.json({
            success: true,
            data: {
                recommendations: [],
                message: 'Recommendations feature - integrate with traveler agent'
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/traveler/itinerary', async (req, res) => {
    try {
        const { userId, selectionId, nights } = req.body;
        // Stub implementation - in production, this would call the traveler agent
        res.json({
            success: true,
            data: {
                itinerary: [],
                message: 'Itinerary feature - integrate with traveler agent'
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'traveler-service' });
});
app.listen(PORT, () => {
    console.log(`Traveler service running on port ${PORT}`);
});
