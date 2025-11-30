import { Pool } from 'pg';
import { connectDB } from '../db/connection';
import { NotFoundError } from '../../../shared/dist/utils/errors';

export class UserService {
  private db: Pool;

  constructor() {
    this.db = connectDB();
  }

  async getUserById(userId: string) {
    const result = await this.db.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }

  async getUserByEmail(email: string) {
    const result = await this.db.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }

  async updateUser(userId: string, updates: { full_name?: string; phone?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
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

    const result = await this.db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, phone, role, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }
}

