import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const catalogRouter = Router();

// Multer storage for uploaded product card photos
const uploadDir = path.join(__dirname, '../../../uploads/items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `item_${Date.now()}_${Math.round(Math.random() * 1E6)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload item photo endpoint
catalogRouter.post('/upload', upload.single('photo'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });
  const photoUrl = `/uploads/items/${req.file.filename}`;
  res.json({ success: true, photoUrl });
});

// Get all categories
catalogRouter.get('/categories', (req: Request, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();
  res.json({ categories });
});

// Get items
catalogRouter.get('/items', (req: Request, res: Response) => {
  const { categoryId, search } = req.query;
  let query = 'SELECT * FROM items WHERE 1=1';
  const params: any[] = [];

  if (categoryId && categoryId !== 'All') {
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

// Add or edit item with image_url
catalogRouter.post('/items', (req: Request, res: Response) => {
  const { id, categoryId, name, price, isVeg = 1, tag = 'Fresh', imageEmoji = '☕', imageUrl = null, description = '', isAvailable = 1 } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  if (id) {
    db.prepare(`
      UPDATE items 
      SET category_id = ?, name = ?, price = ?, is_veg = ?, tag = ?, image_emoji = ?, image_url = ?, description = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(categoryId, name, Number(price), isVeg ? 1 : 0, tag, imageEmoji, imageUrl, description, isAvailable ? 1 : 0, id);
    return res.json({ success: true, message: 'Item updated' });
  } else {
    const newId = `it-${Date.now()}`;
    db.prepare(`
      INSERT INTO items (id, category_id, name, price, is_veg, tag, image_emoji, image_url, description, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, categoryId, name, Number(price), isVeg ? 1 : 0, tag, imageEmoji, imageUrl, description, isAvailable ? 1 : 0);
    return res.json({ success: true, id: newId });
  }
});

// Toggle item availability
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
