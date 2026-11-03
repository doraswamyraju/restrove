import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const reportsRouter = Router();

// Get dynamic sales summary based on date range
reportsRouter.get('/summary', (req: Request, res: Response) => {
  const { range = 'Today' } = req.query;
  const rangeLower = String(range).toLowerCase();

  const now = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${pad(yesterdayDate.getMonth() + 1)}-${pad(yesterdayDate.getDate())}`;

  const sevenDaysAgoDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgoStr = `${sevenDaysAgoDate.getFullYear()}-${pad(sevenDaysAgoDate.getMonth() + 1)}-${pad(sevenDaysAgoDate.getDate())}`;

  const monthStartStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;

  let whereClause = '';
  let params: any[] = [];

  if (rangeLower === 'today') {
    whereClause = 'WHERE created_at LIKE ?';
    params.push(`${todayStr}%`);
  } else if (rangeLower === 'yesterday') {
    whereClause = 'WHERE created_at LIKE ?';
    params.push(`${yesterdayStr}%`);
  } else if (rangeLower === 'last 7 days' || rangeLower === 'last7days') {
    whereClause = 'WHERE created_at >= ?';
    params.push(`${sevenDaysAgoStr} 00:00:00`);
  } else if (rangeLower === 'this month' || rangeLower === 'month') {
    whereClause = 'WHERE created_at >= ?';
    params.push(`${monthStartStr} 00:00:00`);
  } else {
    // Default to today
    whereClause = 'WHERE created_at LIKE ?';
    params.push(`${todayStr}%`);
  }

  // Summary aggregation
  const summaryRow: any = db.prepare(`
    SELECT 
      COALESCE(SUM(total_amount), 0) as grossSales,
      COALESCE(COUNT(id), 0) as ordersCount,
      COALESCE(SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END), 0) as cashInDrawer,
      COALESCE(SUM(CASE WHEN payment_method = 'UPI' THEN total_amount ELSE 0 END), 0) as upiSales,
      COALESCE(SUM(CASE WHEN payment_method = 'Wallet' THEN total_amount ELSE 0 END), 0) as walletDeducted,
      COALESCE(SUM(CASE WHEN payment_method IN ('Card', 'Razorpay') THEN total_amount ELSE 0 END), 0) as cardSales
    FROM orders
    ${whereClause}
  `).get(...params);

  const grossSales = Number(summaryRow.grossSales) || 0;
  const ordersCount = Number(summaryRow.ordersCount) || 0;
  const avgOrderValue = ordersCount > 0 ? Math.round((grossSales / ordersCount) * 100) / 100 : 0;

  // Compute yesterday sales for dynamic comparison
  const yestRow: any = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as yestSales 
    FROM orders 
    WHERE created_at LIKE ?
  `).get(`${yesterdayStr}%`);
  const yestSales = Number(yestRow.yestSales) || 0;

  let comparisonText = '';
  let isPositive = true;
  if (rangeLower === 'today') {
    if (yestSales > 0) {
      const diff = Math.round(((grossSales - yestSales) / yestSales) * 100);
      isPositive = diff >= 0;
      comparisonText = `${diff >= 0 ? '+' : ''}${diff}% compared to yesterday`;
    } else if (grossSales > 0) {
      comparisonText = '+100% (No sales yesterday)';
    } else {
      comparisonText = 'No sales recorded yet today';
    }
  } else if (rangeLower === 'yesterday') {
    comparisonText = `Total closed yesterday: ₹${grossSales.toFixed(2)}`;
  } else {
    comparisonText = `${ordersCount} total orders in this period`;
  }

  // Payment breakdown
  const paymentRows: any[] = db.prepare(`
    SELECT payment_method, COUNT(id) as count, SUM(total_amount) as total
    FROM orders
    ${whereClause}
    GROUP BY payment_method
  `).all(...params);

  // Top selling items joined with orders for the specific time range
  const topItemsQuery = `
    SELECT 
      oi.item_name as name, 
      SUM(oi.quantity) as count, 
      SUM(oi.amount) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    ${whereClause.replace(/created_at/g, 'o.created_at')}
    GROUP BY oi.item_name
    ORDER BY count DESC
    LIMIT 6
  `;
  const topItems: any[] = db.prepare(topItemsQuery).all(...params);

  res.json({
    range,
    summary: {
      grossSales,
      ordersCount,
      avgOrderValue,
      cashInDrawer: Number(summaryRow.cashInDrawer) || 0,
      upiSales: Number(summaryRow.upiSales) || 0,
      walletDeducted: Number(summaryRow.walletDeducted) || 0,
      cardSales: Number(summaryRow.cardSales) || 0,
      comparisonText,
      isPositive
    },
    paymentBreakdown: paymentRows,
    topItems
  });
});
