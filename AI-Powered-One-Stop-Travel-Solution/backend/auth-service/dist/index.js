"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_controller_1 = require("./controllers/auth.controller");
const connection_1 = require("./db/connection");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_controller_1.authRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
});
async function start() {
    try {
        (0, connection_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Auth service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start auth service:', error);
        process.exit(1);
    }
}
start();
