import { PoolClient } from 'pg';
import { randomUUID } from 'crypto';

export class PaymentService {
  async processPayment(bookingId: string, amount: number, client: PoolClient) {
    // Simulate payment processing delay (100-500ms)
    const delay = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate payment success (in production, this would call a payment gateway)
    // For local simulation, we always succeed
    const transactionId = `txn_${Date.now()}_${randomUUID().substring(0, 8)}`;
    
    const result = await client.query(
      `INSERT INTO payments (booking_id, amount, status, transaction_id, payment_method)
       VALUES ($1, $2, 'succeeded', $3, 'local_simulated')
       RETURNING *`,
      [bookingId, amount, transactionId]
    );

    return result.rows[0];
  }
}

