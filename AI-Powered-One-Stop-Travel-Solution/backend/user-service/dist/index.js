"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_controller_1 = require("./controllers/user.controller");
const connection_1 = require("./db/connection");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/user', user_controller_1.userRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'user-service' });
});
async function start() {
    try {
        (0, connection_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`User service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start user service:', error);
        process.exit(1);
    }
}
start();
