"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_service_1 = require("../services/user.service");
const errors_1 = require("../../../shared/utils/errors");
exports.userRouter = (0, express_1.Router)();
const userService = new user_service_1.UserService();
exports.userRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.json({ success: true, data: user });
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
exports.userRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await userService.updateUser(id, updates);
        res.json({ success: true, data: user });
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
