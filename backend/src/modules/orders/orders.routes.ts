import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const ordersRouter = Router();

// Active SSE client connections for real-time live order broadcasts
const sseClients: Response[] = [];

// Real-time Server-Sent Events (SSE) live orders stream for cashier counter
ordersRouter.get('/live-stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);
  sseClients.push(res);

  // Heartbeat ping every 20 seconds to keep connection active through proxies/Nginx
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

export function broadcastNewOrder(orderData: any) {
  const payload = `data: ${JSON.stringify({ type: 'new_order', order: orderData })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {}
  }
}

export function broadcastOrderStatus(orderId: string, orderNumber: string, status: string) {
  const payload = `data: ${JSON.stringify({ type: 'order_status_update', orderId, orderNumber, status })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {}
  }
}

// List orders with optional filters and real-time database counts
ordersRouter.get('/', (req: Request, res: Response) => {
  const { status, serviceType, search, limit = 100 } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'All' && status !== 'All Orders') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (serviceType && serviceType !== 'All Orders') {
    query += ' AND service_type = ?';
    params.push(serviceType);
  }

  if (search) {
    query += ' AND (order_number LIKE ? OR customer_phone LIKE ? OR customer_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  const orders = db.prepare(query).all(...params);

  // Attach items to each order
  const ordersWithItems = orders.map((o: any) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    const d = new Date(o.created_at);
    const timeFormatted = isNaN(d.getTime()) 
      ? o.created_at 
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      id: o.id,
      orderNumber: o.order_number,
      serviceType: o.service_type,
      details: o.details || (o.service_type === 'Dine In' ? 'Table Order' : 'Counter Pickup'),
      amount: Number(o.total_amount),
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.tax_amount),
      discountAmount: Number(o.discount_amount),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.status,
      customerName: o.customer_name || 'Walk-in Guest',
      customerPhone: o.customer_phone || '',
      createdAt: o.created_at,
      time: timeFormatted,
      items: items.map((it: any) => ({
        id: it.id,
        name: it.item_name,
        qty: Number(it.quantity),
        rate: Number(it.rate),
        amount: Number(it.amount),
        notes: it.notes
      }))
    };
  });

  // Calculate real counts from database
  const countAllRow: any = db.prepare('SELECT COUNT(*) as c FROM orders').get();
  const countDineInRow: any = db.prepare("SELECT COUNT(*) as c FROM orders WHERE service_type = 'Dine In'").get();
  const countTakeawayRow: any = db.prepare("SELECT COUNT(*) as c FROM orders WHERE service_type = 'Takeaway'").get();
  const countDeliveryRow: any = db.prepare("SELECT COUNT(*) as c FROM orders WHERE service_type = 'Delivery'").get();
  const countOnlineRow: any = db.prepare("SELECT COUNT(*) as c FROM orders WHERE service_type = 'Online'").get();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const countTodayRow: any = db.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at LIKE ?").get(`${todayStr}%`);

  const counts = {
    all: countAllRow.c || 0,
    dineIn: countDineInRow.c || 0,
    takeaway: countTakeawayRow.c || 0,
    delivery: countDeliveryRow.c || 0,
    online: countOnlineRow.c || 0,
    today: countTodayRow.c || 0
  };

  res.json({ orders: ordersWithItems, counts });
});

// Get single order with line items
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order: any = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const d = new Date(order.created_at);
  const timeFormatted = isNaN(d.getTime()) ? order.created_at : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const orderFormatted = {
    id: order.id,
    orderNumber: order.order_number,
    serviceType: order.service_type,
    details: order.details || 'Counter Pickup',
    amount: Number(order.total_amount),
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.tax_amount),
    discountAmount: Number(order.discount_amount),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.status,
    customerName: order.customer_name || 'Walk-in Guest',
    customerPhone: order.customer_phone || '',
    createdAt: order.created_at,
    time: timeFormatted,
    items: items.map((it: any) => ({
      id: it.id,
      name: it.item_name,
      qty: Number(it.quantity),
      rate: Number(it.rate),
      amount: Number(it.amount),
      notes: it.notes
    }))
  };

  res.json({ order: orderFormatted, items: orderFormatted.items });
});

// Create new POS order with payment & optional wallet deduction
ordersRouter.post('/', (req: Request, res: Response) => {
  const {
    customerPhone,
    customerName,
    serviceType = 'Takeaway',
    details,
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
    const orderPrefix = serviceType === 'Takeaway' ? '#T-' : serviceType === 'Dine In' ? '#D-' : '#O-';
    const orderNumber = `${orderPrefix}${1480 + countRow.count + 1}`;
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

    const orderDetails = details || (serviceType === 'Dine In' ? 'Dine In Table' : 'Counter Pickup');

    // Insert Order
    db.prepare(`
      INSERT INTO orders (
        id, order_number, service_type, details, customer_id, customer_name, customer_phone,
        subtotal, tax_amount, discount_amount, total_amount, status, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      serviceType,
      orderDetails,
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

    const completeOrder = {
      id: orderId,
      orderNumber,
      serviceType,
      details: orderDetails,
      amount: totalAmount,
      subtotal,
      taxAmount,
      discountAmount: Number(discountAmount),
      paymentMethod,
      paymentStatus: 'Paid',
      orderStatus: status,
      customerName: customer ? customer.name : customerName || 'Walk-in Guest',
      customerPhone: customer ? customer.phone : customerPhone || '',
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: items.map((it: any) => ({
        name: it.name,
        qty: it.quantity,
        rate: it.rate,
        amount: it.rate * it.quantity
      }))
    };

    return { orderId, orderNumber, totalAmount, order: completeOrder };
  });

  try {
    const result = tx();
    // Broadcast live event to cashier POS counter
    if (result && result.order) {
      broadcastNewOrder(result.order);
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update order status (e.g. mark 'In Service' as 'Completed')
ordersRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const target: any = db.prepare('SELECT id, order_number FROM orders WHERE id = ? OR order_number = ?').get(id, id);
  if (!target) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, target.id);
  broadcastOrderStatus(target.id, target.order_number, status);
  res.json({ success: true, message: `Order ${target.order_number} marked as ${status}`, status });
});

// Delete order from dashboard
ordersRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const target: any = db.prepare('SELECT id FROM orders WHERE id = ? OR order_number = ?').get(id, id);
  if (!target) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(target.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(target.id);
  res.json({ success: true, message: 'Order deleted from database' });
});
