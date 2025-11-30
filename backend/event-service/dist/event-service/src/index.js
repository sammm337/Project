"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const event_controller_1 = require("./controllers/event.controller");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/events', event_controller_1.eventRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'event-service' });
});
async function start() {
    try {
        app.listen(PORT, () => {
            console.log(`Event service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start event service:', error);
        process.exit(1);
    }
}
start();
