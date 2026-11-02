import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const walletRouter = Router();

// Get customer wallet balance & details by phone or ID
walletRouter.get('/customer/:identifier', (req: Request, res: Response) => {
  const { identifier } = req.params;
  const customer = db.prepare(`
    SELECT * FROM customers WHERE id = ? OR phone = ?
  `).get(identifier, identifier);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const transactions = db.prepare(`
    SELECT * FROM wallet_transactions 
    WHERE customer_id = ? 
    ORDER BY created_at DESC 
    LIMIT 25
  `).all((customer as any).id);

  res.json({
    customer,
    transactions
  });
});

// Advance deposit / top-up customer wallet
walletRouter.post('/deposit', (req: Request, res: Response) => {
  const { phone, name, amount, notes, createdBy } = req.body;

  if (!phone || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid phone and positive amount required' });
  }

  const depositAmount = Number(amount);

  const tx = db.transaction(() => {
    let customer: any = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);

    if (!customer) {
      const newCustomerId = uuidv4();
      db.prepare(`
        INSERT INTO customers (id, name, phone, wallet_balance, total_spent, visit_count)
        VALUES (?, ?, ?, 0.00, 0.00, 0)
      `).run(newCustomerId, name || 'Guest Customer', phone);
      customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(newCustomerId);
    }

    const newBalance = customer.wallet_balance + depositAmount;

    // Update customer wallet balance
    db.prepare(`
      UPDATE customers 
      SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newBalance, customer.id);

    // Record ledger transaction
    const txId = uuidv4();
    db.prepare(`
      INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, notes, created_by)
      VALUES (?, ?, ?, ?, 'deposit', ?, ?)
    `).run(txId, customer.id, depositAmount, newBalance, notes || 'Advance deposit', createdBy || 'admin');

    return { customerId: customer.id, newBalance, txId };
  });

  try {
    const result = tx();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Deduct wallet for order payment
walletRouter.post('/deduct', (req: Request, res: Response) => {
  const { customerId, orderId, amount, notes, createdBy } = req.body;

  if (!customerId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid customerId and positive amount required' });
  }

  const deductAmount = Number(amount);

  const tx = db.transaction(() => {
    const customer: any = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.wallet_balance < deductAmount) {
      throw new Error(`Insufficient wallet balance. Available: ₹${customer.wallet_balance}`);
    }

    const newBalance = customer.wallet_balance - deductAmount;

    db.prepare(`
      UPDATE customers 
      SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newBalance, customer.id);

    const txId = uuidv4();
    db.prepare(`
      INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, reference_order_id, notes, created_by)
      VALUES (?, ?, ?, ?, 'order_payment', ?, ?, ?)
    `).run(txId, customer.id, -deductAmount, newBalance, orderId || null, notes || 'Payment for order', createdBy || 'staff');

    return { customerId: customer.id, newBalance, txId };
  });

  try {
    const result = tx();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
