import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const inventoryRouter = Router();

// Seed cafeteria inventory items if table is empty
function seedCafeteriaInventory() {
  const countRow: any = db.prepare('SELECT COUNT(*) as c FROM inventory_items').get();
  if (countRow.c === 0) {
    const rawItems = [
      { id: 'inv-1', name: 'Fresh Buffalo Milk', unit: 'ltr', current_stock: 45.0, min_stock_alert: 15.0, cost_per_unit: 58.0 },
      { id: 'inv-2', name: 'Assam Tea Dust (Chai Patti)', unit: 'kg', current_stock: 12.5, min_stock_alert: 4.0, cost_per_unit: 260.0 },
      { id: 'inv-3', name: 'White Cane Sugar', unit: 'kg', current_stock: 25.0, min_stock_alert: 8.0, cost_per_unit: 44.0 },
      { id: 'inv-4', name: 'Elaichi & Fresh Ginger', unit: 'kg', current_stock: 2.8, min_stock_alert: 1.0, cost_per_unit: 220.0 },
      { id: 'inv-5', name: 'Fresh Bun Maska Buns', unit: 'pcs', current_stock: 60.0, min_stock_alert: 20.0, cost_per_unit: 14.0 },
      { id: 'inv-6', name: 'Amul Butter Block', unit: 'kg', current_stock: 5.5, min_stock_alert: 2.0, cost_per_unit: 480.0 },
      { id: 'inv-7', name: 'Fresh Aloo Samosas', unit: 'pcs', current_stock: 35.0, min_stock_alert: 15.0, cost_per_unit: 12.0 },
      { id: 'inv-8', name: 'Osmania Biscuits (Pkt)', unit: 'pkt', current_stock: 28.0, min_stock_alert: 10.0, cost_per_unit: 18.0 }
    ];

    for (const r of rawItems) {
      db.prepare(`
        INSERT INTO inventory_items (id, name, unit, current_stock, min_stock_alert, cost_per_unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(r.id, r.name, r.unit, r.current_stock, r.min_stock_alert, r.cost_per_unit);
    }
  }
}

// Get stock list
inventoryRouter.get('/', (req: Request, res: Response) => {
  seedCafeteriaInventory();
  const items = db.prepare('SELECT * FROM inventory_items ORDER BY name ASC').all();
  res.json({ items });
});

// Update or adjust stock
inventoryRouter.post('/adjust', (req: Request, res: Response) => {
  const { itemId, adjustmentAmount, reason } = req.body; // e.g. +10 or -2.5

  if (!itemId || adjustmentAmount === undefined) {
    return res.status(400).json({ error: 'itemId and adjustmentAmount required' });
  }

  const item: any = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const newStock = Math.max(0, item.current_stock + Number(adjustmentAmount));
  db.prepare(`
    UPDATE inventory_items 
    SET current_stock = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(newStock, itemId);

  res.json({ success: true, newStock, reason });
});

// Add new raw inventory item
inventoryRouter.post('/', (req: Request, res: Response) => {
  const { name, unit = 'kg', currentStock = 0, minStockAlert = 5, costPerUnit = 0 } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = `inv-${Date.now()}`;
  db.prepare(`
    INSERT INTO inventory_items (id, name, unit, current_stock, min_stock_alert, cost_per_unit)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, unit, Number(currentStock), Number(minStockAlert), Number(costPerUnit));

  res.json({ success: true, id });
});
