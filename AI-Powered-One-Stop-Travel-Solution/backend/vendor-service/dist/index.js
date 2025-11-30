"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vendor_controller_1 = require("./controllers/vendor.controller");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/vendor', vendor_controller_1.vendorRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'vendor-service' });
});
async function start() {
    try {
        app.listen(PORT, () => {
            console.log(`Vendor service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start vendor service:', error);
        process.exit(1);
    }
}
start();
