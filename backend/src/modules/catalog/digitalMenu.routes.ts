import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const digitalMenuRouter = Router();

// Public endpoint for QR code table / counter ordering
digitalMenuRouter.get('/', (req: Request, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  const items = db.prepare('SELECT * FROM items WHERE is_available = 1 ORDER BY name ASC').all();

  res.json({
    outlet: {
      name: 'Chai Wala Original',
      tagline: 'Fresh Dum Chai & Bakery Snacks',
      timing: '6:00 AM - 11:00 PM'
    },
    categories,
    items
  });
});
