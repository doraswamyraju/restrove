import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const catalogRouter = Router();

// Get all categories with items
catalogRouter.get('/categories', (req: Request, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();
  res.json({ categories });
});

// Get items (optionally filtered by category)
catalogRouter.get('/items', (req: Request, res: Response) => {
  const { categoryId, search } = req.query;
  let query = 'SELECT * FROM items WHERE 1=1';
  const params: any[] = [];

  if (categoryId) {
    query += ' AND category_id = ?';
    params.push(categoryId);
  }

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY name ASC';
  const items = db.prepare(query).all(...params);
  res.json({ items });
});

// Seed default restaurant menu items if empty
catalogRouter.post('/seed', (req: Request, res: Response) => {
  const existingCount: any = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existingCount.count > 0) {
    return res.json({ message: 'Catalog already seeded' });
  }

  const seedTx = db.transaction(() => {
    const cats = [
      { id: 'cat-starters', name: 'Starters', slug: 'starters', sort: 1 },
      { id: 'cat-main', name: 'Main Course', slug: 'main-course', sort: 2 },
      { id: 'cat-biryani', name: 'Biryani', slug: 'biryani', sort: 3 },
      { id: 'cat-breads', name: 'Breads', slug: 'breads', sort: 4 },
      { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', sort: 5 }
    ];

    for (const c of cats) {
      db.prepare(`
        INSERT INTO categories (id, name, slug, sort_order)
        VALUES (?, ?, ?, ?)
      `).run(c.id, c.name, c.slug, c.sort);
    }

    const items = [
      { id: 'it-1', cat: 'cat-starters', name: 'Paneer Tikka', price: 280, isVeg: 1 },
      { id: 'it-2', cat: 'cat-starters', name: 'Chicken Tikka', price: 320, isVeg: 0 },
      { id: 'it-3', cat: 'cat-biryani', name: 'Veg Biryani', price: 260, isVeg: 1 },
      { id: 'it-4', cat: 'cat-biryani', name: 'Chicken Biryani', price: 320, isVeg: 0 },
      { id: 'it-5', cat: 'cat-breads', name: 'Butter Naan', price: 60, isVeg: 1 },
      { id: 'it-6', cat: 'cat-main', name: 'Chicken Curry', price: 330, isVeg: 0 },
      { id: 'it-7', cat: 'cat-main', name: 'Paneer Butter Masala', price: 290, isVeg: 1 },
      { id: 'it-8', cat: 'cat-breads', name: 'Tandoori Roti', price: 35, isVeg: 1 }
    ];

    for (const item of items) {
      db.prepare(`
        INSERT INTO items (id, category_id, name, price, is_veg)
        VALUES (?, ?, ?, ?, ?)
      `).run(item.id, item.cat, item.name, item.price, item.isVeg);
    }
  });

  seedTx();
  res.json({ message: 'Catalog seeded successfully' });
});
