import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import type { StringValue } from 'ms';
import { connectDB } from '../db/connection';
import { ValidationError, UnauthorizedError } from '../../../shared/dist/utils/errors';

export class AuthService {
  private db: Pool;
  private jwtSecret: string;
  private jwtExpiresIn: StringValue | number;

  constructor() {
    this.db = connectDB();
    this.jwtSecret = process.env.JWT_SECRET || 'secret';
    const expiresInEnv = process.env.JWT_EXPIRES_IN as StringValue | number | undefined;
    this.jwtExpiresIn = expiresInEnv || '7d';
  }

  async signup(email: string, password: string, full_name?: string) {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await this.db.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role, created_at',
      [email, hashedPassword, full_name]
    );

    return result.rows[0];
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const result = await this.db.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

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

