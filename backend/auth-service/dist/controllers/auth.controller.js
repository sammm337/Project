"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const errors_1 = require("../../../shared/dist/utils/errors");
exports.authRouter = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
exports.authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        const user = await authService.signup(email, password, full_name);
        res.status(201).json({
            success: true,
            data: { user: { id: user.id, email: user.email, full_name: user.full_name } }
        });
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
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({
            success: true,
            data: result
        });
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
