"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const connection_1 = require("../db/connection");
const errors_1 = require("../../../shared/utils/errors");
class UserService {
    constructor() {
        this.db = (0, connection_1.connectDB)();
    }
    async getUserById(userId) {
        const result = await this.db.query('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('User');
        }
        return result.rows[0];
    }
    async getUserByEmail(email) {
        const result = await this.db.query('SELECT id, email, full_name, phone, role, created_at FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('User');
        }
        return result.rows[0];
    }
    async updateUser(userId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (updates.full_name !== undefined) {
            fields.push(`full_name = $${paramIndex++}`);
            values.push(updates.full_name);
        }
        if (updates.phone !== undefined) {
            fields.push(`phone = $${paramIndex++}`);
            values.push(updates.phone);
        }
        if (fields.length === 0) {
            return this.getUserById(userId);
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        const result = await this.db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, phone, role, created_at, updated_at`, values);
        return result.rows[0];
    }
}
exports.UserService = UserService;
