"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../db/connection");
const errors_1 = require("../../../shared/dist/utils/errors");
class AuthService {
    constructor() {
        this.db = (0, connection_1.connectDB)();
        this.jwtSecret = process.env.JWT_SECRET || 'secret';
        const expiresInEnv = process.env.JWT_EXPIRES_IN;
        this.jwtExpiresIn = expiresInEnv || '7d';
    }
    async signup(email, password, full_name) {
        // Validate input
        if (!email || !password) {
            throw new errors_1.ValidationError('Email and password are required');
        }
        if (password.length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        // Check if user exists
        const existingUser = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw new errors_1.ValidationError('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const result = await this.db.query('INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role, created_at', [email, hashedPassword, full_name]);
        return result.rows[0];
    }
    async login(email, password) {
        if (!email || !password) {
            throw new errors_1.ValidationError('Email and password are required');
        }
        const result = await this.db.query('SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const user = result.rows[0];
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        };
    }
}
exports.AuthService = AuthService;
