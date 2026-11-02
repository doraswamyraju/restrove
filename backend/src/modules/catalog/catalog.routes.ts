import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const catalogRouter = Router();

// Get all categories with counts
catalogRouter.get('/categories', (req: Request, res: Response) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(i.id) as item_count 
    FROM categories c 
    LEFT JOIN items i ON c.id = i.category_id 
    GROUP BY c.id 
    ORDER BY c.sort_order ASC, c.name ASC
  `).all();
  res.json({ categories });
});

// Add new category
catalogRouter.post('/categories', (req: Request, res: Response) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const id = `cat-${Date.now()}`;
  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  db.prepare(`
    INSERT INTO categories (id, name, slug, sort_order, is_active)
    VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories), 1)
  `).run(id, name, generatedSlug);

  res.json({ success: true, category: { id, name, slug: generatedSlug } });
});

// Get items
catalogRouter.get('/items', (req: Request, res: Response) => {
  const { categoryId, search, availableOnly } = req.query;
  let query = `
    SELECT i.*, c.name as category_name 
    FROM items i 
    LEFT JOIN categories c ON i.category_id = c.id 
    WHERE 1=1
  `;
  const params: any[] = [];

  if (categoryId && categoryId !== 'All') {
    query += ' AND i.category_id = ?';
    params.push(categoryId);
  }

  if (search) {
    query += ' AND i.name LIKE ?';
    params.push(`%${search}%`);
  }

  if (availableOnly === 'true') {
    query += ' AND i.is_available = 1';
  }

  query += ' ORDER BY i.name ASC';
  const items = db.prepare(query).all(...params);
  res.json({ items });
});

// Add or edit item
catalogRouter.post('/items', (req: Request, res: Response) => {
  const { id, categoryId, name, price, isVeg = 1, description = '', isAvailable = 1, taxRate = 5.0 } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  if (id) {
    // Update existing
    db.prepare(`
      UPDATE items 
      SET category_id = ?, name = ?, price = ?, is_veg = ?, description = ?, is_available = ?, tax_rate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(categoryId, name, Number(price), isVeg ? 1 : 0, description, isAvailable ? 1 : 0, Number(taxRate), id);
    return res.json({ success: true, message: 'Item updated' });
  } else {
    // Insert new
    const newId = `it-${Date.now()}`;
    db.prepare(`
      INSERT INTO items (id, category_id, name, price, is_veg, description, is_available, tax_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, categoryId, name, Number(price), isVeg ? 1 : 0, description, isAvailable ? 1 : 0, Number(taxRate));
    return res.json({ success: true, id: newId });
  }
});

// Quick toggle item availability (Out-of-stock toggle)
catalogRouter.patch('/items/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  db.prepare('UPDATE items SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(isAvailable ? 1 : 0, id);

  res.json({ success: true, isAvailable: !!isAvailable });
});

// Delete item
catalogRouter.delete('/items/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.json({ success: true });
});
