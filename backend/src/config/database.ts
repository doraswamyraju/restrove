import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'restrove.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      wallet_balance REAL DEFAULT 0.00,
      total_spent REAL DEFAULT 0.00,
      visit_count INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      type TEXT NOT NULL,
      reference_order_id TEXT,
      notes TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_veg INTEGER DEFAULT 1,
      tax_rate REAL DEFAULT 5.0,
      tag TEXT DEFAULT 'Fresh',
      description TEXT,
      image_emoji TEXT DEFAULT '☕',
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      service_type TEXT NOT NULL DEFAULT 'Takeaway',
      customer_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      subtotal REAL NOT NULL DEFAULT 0.00,
      tax_amount REAL NOT NULL DEFAULT 0.00,
      discount_amount REAL NOT NULL DEFAULT 0.00,
      total_amount REAL NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Completed',
      payment_status TEXT NOT NULL DEFAULT 'Paid',
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Raw Materials',
      unit TEXT NOT NULL DEFAULT 'kg',
      current_stock REAL DEFAULT 0.0,
      min_stock_alert REAL DEFAULT 5.0,
      cost_per_unit REAL DEFAULT 0.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Ensure image_url column exists in items table
  try {
    db.prepare('ALTER TABLE items ADD COLUMN image_url TEXT').run();
  } catch (e) {
    // Column already exists
  }

  // Auto seed real Chai Wala categories & items if empty
  const catCount: any = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (catCount.c === 0) {
    const seedCats = [
      { id: 'cat-chai', name: 'Special Chai', slug: 'special-chai', sort: 1 },
      { id: 'cat-coffee', name: 'Coffee & Milk', slug: 'coffee-milk', sort: 2 },
      { id: 'cat-buns', name: 'Maska Buns', slug: 'maska-buns', sort: 3 },
      { id: 'cat-snacks', name: 'Hot Snacks', slug: 'hot-snacks', sort: 4 },
      { id: 'cat-bakery', name: 'Biscuits & Bakery', slug: 'biscuits-bakery', sort: 5 },
    ];
    for (const c of seedCats) {
      db.prepare('INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)').run(c.id, c.name, c.slug, c.sort);
    }

    const seedItems = [
      { id: 'it-1', cat: 'cat-chai', name: 'Irani Dum Chai', price: 20, emoji: '☕', tag: 'Bestseller' },
      { id: 'it-2', cat: 'cat-chai', name: 'Ginger Elaichi Chai', price: 25, emoji: '🫖', tag: 'Fresh Spiced' },
      { id: 'it-3', cat: 'cat-chai', name: 'Masala Chai', price: 25, emoji: '☕', tag: 'Traditional' },
      { id: 'it-4', cat: 'cat-coffee', name: 'Filter Coffee', price: 30, emoji: '☕', tag: 'South Indian' },
      { id: 'it-5', cat: 'cat-coffee', name: 'Hot Badam Milk', price: 40, emoji: '🥛', tag: 'Rich & Creamy' },
      { id: 'it-6', cat: 'cat-coffee', name: 'Turmeric Golden Milk', price: 35, emoji: '🥛', tag: 'Immunity' },
      { id: 'it-7', cat: 'cat-buns', name: 'Classic Maska Bun', price: 35, emoji: '🍞', tag: 'Amul Butter' },
      { id: 'it-8', cat: 'cat-buns', name: 'Bun Maska Jam', price: 45, emoji: '🍞', tag: 'Sweet & Salty' },
      { id: 'it-9', cat: 'cat-buns', name: 'Cheese Bun Maska', price: 55, emoji: '🧀', tag: 'Grilled' },
      { id: 'it-10', cat: 'cat-snacks', name: 'Crispy Aloo Samosa (2 pcs)', price: 40, emoji: '🥟', tag: 'Served Hot' },
      { id: 'it-11', cat: 'cat-snacks', name: 'Onion Samosa (4 pcs)', price: 35, emoji: '🥟', tag: 'Crispy Mini' },
      { id: 'it-12', cat: 'cat-bakery', name: 'Osmania Biscuits (4 pcs)', price: 25, emoji: '🍪', tag: 'Chai Dip' },
      { id: 'it-13', cat: 'cat-bakery', name: 'Butter Cookies (Plate)', price: 30, emoji: '🍪', tag: 'Fresh Baked' },
    ];
    for (const it of seedItems) {
      db.prepare(`
        INSERT INTO items (id, category_id, name, price, is_veg, image_emoji, tag, is_available)
        VALUES (?, ?, ?, ?, 1, ?, ?, 1)
      `).run(it.id, it.cat, it.name, it.price, it.emoji, it.tag);
    }
  }

  // Seed inventory if empty
  const invCount: any = db.prepare('SELECT COUNT(*) as c FROM inventory_items').get();
  if (invCount.c === 0) {
    const rawItems = [
      { id: 'inv-1', name: 'Fresh Buffalo Milk', category: 'Dairy', unit: 'Ltr', current_stock: 45.0, min_stock_alert: 15.0, cost_per_unit: 58.0 },
      { id: 'inv-2', name: 'Assam Tea Dust (Chai Patti)', category: 'Raw Materials', unit: 'Kg', current_stock: 12.5, min_stock_alert: 4.0, cost_per_unit: 260.0 },
      { id: 'inv-3', name: 'White Cane Sugar', category: 'Raw Materials', unit: 'Kg', current_stock: 25.0, min_stock_alert: 8.0, cost_per_unit: 44.0 },
      { id: 'inv-4', name: 'Elaichi & Fresh Ginger', category: 'Spices', unit: 'Kg', current_stock: 2.8, min_stock_alert: 1.0, cost_per_unit: 220.0 },
      { id: 'inv-5', name: 'Fresh Bun Maska Buns', category: 'Bakery', unit: 'Pcs', current_stock: 60.0, min_stock_alert: 20.0, cost_per_unit: 14.0 },
      { id: 'inv-6', name: 'Amul Butter Block', category: 'Dairy', unit: 'Kg', current_stock: 5.5, min_stock_alert: 2.0, cost_per_unit: 480.0 },
      { id: 'inv-7', name: 'Fresh Aloo Samosas', category: 'Hot Snacks', unit: 'Pcs', current_stock: 35.0, min_stock_alert: 15.0, cost_per_unit: 12.0 },
      { id: 'inv-8', name: 'Osmania Biscuits (Pkt)', category: 'Bakery', unit: 'Pkt', current_stock: 28.0, min_stock_alert: 10.0, cost_per_unit: 18.0 }
    ];
    for (const r of rawItems) {
      db.prepare(`
        INSERT INTO inventory_items (id, name, category, unit, current_stock, min_stock_alert, cost_per_unit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(r.id, r.name, r.category, r.unit, r.current_stock, r.min_stock_alert, r.cost_per_unit);
    }
  }
}
