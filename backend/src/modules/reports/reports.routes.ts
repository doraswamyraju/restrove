import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const reportsRouter = Router();

// Get today's cafeteria sales summary
reportsRouter.get('/summary', (req: Request, res: Response) => {
  // Total sales
  const salesRow: any = db.prepare(`
    SELECT 
      COALESCE(SUM(total_amount), 0) as total_sales,
      COALESCE(COUNT(id), 0) as order_count,
      COALESCE(SUM(discount_amount), 0) as total_discount,
      COALESCE(SUM(tax_amount), 0) as total_tax
    FROM orders
  `).get();

  // Payment breakdown
  const paymentBreakdown = db.prepare(`
    SELECT payment_method, COUNT(id) as count, SUM(total_amount) as total
    FROM orders
    GROUP BY payment_method
  `).all();

  // Top selling items
  const topItems = db.prepare(`
    SELECT item_name, SUM(quantity) as total_qty, SUM(amount) as total_revenue
    FROM order_items
    GROUP BY item_name
    ORDER BY total_qty DESC
    LIMIT 6
  `).all();

  res.json({
    summary: salesRow,
    paymentBreakdown,
    topItems
  });
});

