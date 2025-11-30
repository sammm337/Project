"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const booking_controller_1 = require("./controllers/booking.controller");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3006;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/bookings', booking_controller_1.bookingRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'booking-service' });
});
async function start() {
    try {
        app.listen(PORT, () => {
            console.log(`Booking service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start booking service:', error);
        process.exit(1);
    }
}
start();
