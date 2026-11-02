import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const customersRouter = Router();

// List regular customers
customersRouter.get('/', (req: Request, res: Response) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY total_spent DESC LIMIT 50';
  const customers = db.prepare(query).all(...params);
  res.json({ customers });
});

