import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const customersRouter = Router();

// Stats summary for CRM dashboard
customersRouter.get('/stats', (req: Request, res: Response) => {
  const row: any = db.prepare(`
    SELECT 
      COUNT(id) as totalCustomers,
      COALESCE(SUM(wallet_balance), 0) as totalWalletBalance,
      COALESCE(SUM(total_spent), 0) as totalLifetimeSpent,
      COALESCE(AVG(visit_count), 0) as avgVisits
    FROM customers
  `).get();

  res.json({
    totalCustomers: Number(row.totalCustomers || 0),
    totalWalletBalance: Number(row.totalWalletBalance || 0),
    totalLifetimeSpent: Number(row.totalLifetimeSpent || 0),
    avgVisits: Math.round(Number(row.avgVisits || 0) * 10) / 10
  });
});

// List regular customers from database with filter and sorting
customersRouter.get('/', (req: Request, res: Response) => {
  const { search, filter, sort = 'wallet' } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (filter === 'has_balance') {
    query += ' AND wallet_balance > 0';
  } else if (filter === 'vip') {
    query += ' AND visit_count >= 10';
  }

  if (sort === 'spent') {
    query += ' ORDER BY total_spent DESC, name ASC';
  } else if (sort === 'visits') {
    query += ' ORDER BY visit_count DESC, name ASC';
  } else if (sort === 'name') {
    query += ' ORDER BY name ASC';
  } else {
    query += ' ORDER BY wallet_balance DESC, total_spent DESC, name ASC';
  }

  const customers = db.prepare(query).all(...params);
  res.json({ customers });
});

// Get single customer details with full ledger and order history
customersRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const customer: any = db.prepare('SELECT * FROM customers WHERE id = ? OR phone = ? OR email = ?').get(id, id, id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const transactions = db.prepare(`
    SELECT * FROM wallet_transactions 
    WHERE customer_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(customer.id);

  const orders = db.prepare(`
    SELECT * FROM orders 
    WHERE customer_id = ? OR customer_phone = ?
    ORDER BY created_at DESC 
    LIMIT 20
  `).all(customer.id, customer.phone);

  res.json({ customer, transactions, orders });
});

// Add new customer
customersRouter.post('/', (req: Request, res: Response) => {
  const { name, phone, email, notes, initialAdvance = 0 } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required' });
  }

  const cleanPhone = phone.trim();

  // Check if phone already registered
  const existing: any = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone);
  if (existing) {
    return res.status(409).json({ error: `Customer with phone ${cleanPhone} already exists (${existing.name})` });
  }

  const newId = `cust-${Date.now()}`;
  const advance = Number(initialAdvance) || 0;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO customers (id, name, phone, email, wallet_balance, total_spent, visit_count, notes)
      VALUES (?, ?, ?, ?, ?, 0.00, 1, ?)
    `).run(newId, name.trim(), cleanPhone, email?.trim() || null, advance, notes?.trim() || null);

    if (advance > 0) {
      db.prepare(`
        INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, notes, created_by)
        VALUES (?, ?, ?, ?, 'deposit', 'Initial Advance Deposit', 'admin')
      `).run(uuidv4(), newId, advance, advance);
    }
  });

  try {
    tx();
    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(newId);
    return res.json({ success: true, customer: created, message: 'Customer added to database' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update customer details
customersRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, notes } = req.body;

  const customer: any = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone are required' });
  }

  // Check phone duplicate on other customer
  const phoneConflict: any = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone.trim(), id);
  if (phoneConflict) {
    return res.status(409).json({ error: 'This phone number is already registered to another customer' });
  }

  db.prepare(`
    UPDATE customers 
    SET name = ?, phone = ?, email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name.trim(), phone.trim(), email?.trim() || null, notes?.trim() || null, id);

  const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.json({ success: true, customer: updated, message: 'Customer updated successfully' });
});

// Adjust customer wallet balance (Top-up or manual debit)
customersRouter.post('/:id/wallet-adjust', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, type = 'deposit', notes = 'Counter Adjustment', paymentMode = 'Cash' } = req.body;

  const delta = Number(amount);
  if (!delta || delta === 0) {
    return res.status(400).json({ error: 'Valid adjustment amount required' });
  }

  const tx = db.transaction(() => {
    const customer: any = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const newBalance = customer.wallet_balance + delta;
    if (newBalance < 0) {
      throw new Error(`Insufficient wallet balance. Current: ₹${customer.wallet_balance}`);
    }

    db.prepare(`
      UPDATE customers 
      SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newBalance, id);

    const txId = uuidv4();
    const noteText = `${paymentMode} ${type === 'deposit' ? 'Top-up' : 'Deduction'}: ${notes}`;

    db.prepare(`
      INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 'admin')
    `).run(txId, id, delta, newBalance, type, noteText);

    return { newBalance, txId };
  });

  try {
    const result = tx();
    res.json({ success: true, ...result, message: 'Wallet balance updated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete customer
customersRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const cust: any = db.prepare('SELECT id FROM customers WHERE id = ? OR phone = ?').get(id, id);
  if (!cust) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  db.prepare('DELETE FROM wallet_transactions WHERE customer_id = ?').run(cust.id);
  db.prepare('DELETE FROM customers WHERE id = ?').run(cust.id);

  res.json({ success: true, message: 'Customer deleted from database' });
});
