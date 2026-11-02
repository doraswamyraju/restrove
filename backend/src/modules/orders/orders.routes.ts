import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const ordersRouter = Router();

// List orders with optional status filters
ordersRouter.get('/', (req: Request, res: Response) => {
  const { status, limit = 50 } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'All') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  const orders = db.prepare(query).all(...params);
  res.json({ orders });
});

// Get single order with line items
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all((order as any).id);

  res.json({ order, items });
});

// Create new POS order with payment & optional wallet deduction
ordersRouter.post('/', (req: Request, res: Response) => {
  const {
    customerPhone,
    customerName,
    serviceType = 'Takeaway',
    items = [],
    discountAmount = 0,
    paymentMethod = 'Cash', // 'Cash', 'UPI', 'Card', 'Wallet'
    status = 'Completed'
  } = req.body;

  if (!items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  const tx = db.transaction(() => {
    let customer: any = null;
    if (customerPhone) {
      customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(customerPhone);
      if (!customer) {
        const newCustomerId = uuidv4();
        db.prepare(`
          INSERT INTO customers (id, name, phone, wallet_balance, total_spent, visit_count)
          VALUES (?, ?, ?, 0.00, 0.00, 0)
        `).run(newCustomerId, customerName || 'Walk-in Guest', customerPhone);
        customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(newCustomerId);
      }
    }

    // Calculate totals
    let subtotal = 0;
    for (const it of items) {
      subtotal += Number(it.rate) * Number(it.quantity);
    }

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const totalAmount = Math.max(0, subtotal + taxAmount - Number(discountAmount));

    // Generate Order Number
    const countRow: any = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const orderNumber = `#D-${1480 + countRow.count + 1}`;
    const orderId = uuidv4();

    // If payment method is Wallet, deduct customer balance
    if (paymentMethod === 'Wallet') {
      if (!customer) {
        throw new Error('Customer required for wallet payment');
      }
      if (customer.wallet_balance < totalAmount) {
        throw new Error(`Insufficient wallet balance. Available: ₹${customer.wallet_balance}, Required: ₹${totalAmount}`);
      }

      const newBalance = customer.wallet_balance - totalAmount;
      db.prepare('UPDATE customers SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newBalance, customer.id);

      const txId = uuidv4();
      db.prepare(`
        INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, reference_order_id, notes)
        VALUES (?, ?, ?, ?, 'order_payment', ?, ?)
      `).run(txId, customer.id, -totalAmount, newBalance, orderId, `Payment for ${orderNumber}`);
    }

    // Insert Order
    db.prepare(`
      INSERT INTO orders (
        id, order_number, service_type, customer_id, customer_name, customer_phone,
        subtotal, tax_amount, discount_amount, total_amount, status, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      serviceType,
      customer ? customer.id : null,
      customer ? customer.name : customerName || 'Walk-in Guest',
      customer ? customer.phone : customerPhone || null,
      subtotal,
      taxAmount,
      Number(discountAmount),
      totalAmount,
      status,
      'Paid',
      paymentMethod
    );

    // Insert Order Line Items
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, item_id, item_name, quantity, rate, amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const it of items) {
      insertItem.run(
        uuidv4(),
        orderId,
        it.itemId || 'custom-item',
        it.name,
        it.quantity,
        it.rate,
        it.rate * it.quantity,
        it.notes || null
      );
    }

    // Update customer total_spent and visit_count
    if (customer) {
      db.prepare(`
        UPDATE customers 
        SET total_spent = total_spent + ?, visit_count = visit_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalAmount, customer.id);
    }

    return { orderId, orderNumber, totalAmount };
  });

  try {
    const result = tx();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

