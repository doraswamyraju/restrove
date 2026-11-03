import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const customersRouter = Router();

// List regular customers from database
customersRouter.get('/', (req: Request, res: Response) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY wallet_balance DESC, total_spent DESC, name ASC';
  const customers = db.prepare(query).all(...params);
  res.json({ customers });
});

// Add or update customer
customersRouter.post('/', (req: Request, res: Response) => {
  const { id, name, phone, email, notes, initialAdvance = 0 } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required' });
  }

  const cleanPhone = phone.trim();

  // Check if exists
  let existing: any = db.prepare('SELECT * FROM customers WHERE phone = ? OR id = ?').get(cleanPhone, id || '');

  if (existing) {
    db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email || null, notes || null, existing.id);

    return res.json({ success: true, customerId: existing.id, message: 'Customer updated' });
  } else {
    const newId = id || `cust-${Date.now()}`;
    const advance = Number(initialAdvance) || 0;

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO customers (id, name, phone, email, wallet_balance, total_spent, visit_count, notes)
        VALUES (?, ?, ?, ?, ?, 0.00, 1, ?)
      `).run(newId, name, cleanPhone, email || null, advance, notes || null);

      if (advance > 0) {
        db.prepare(`
          INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, notes, created_by)
          VALUES (?, ?, ?, ?, 'deposit', 'Initial Advance Deposit', 'admin')
        `).run(uuidv4(), newId, advance, advance);
      }
    });

    tx();
    return res.json({ success: true, customerId: newId, message: 'Customer added to database' });
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
