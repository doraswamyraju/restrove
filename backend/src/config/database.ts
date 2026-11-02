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
    -- Users and Staff
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff', -- admin, cashier, manager, staff
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customers and Wallet
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

    -- Customer Wallet Ledger
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL, -- positive for deposit/credit, negative for deduction
      balance_after REAL NOT NULL,
      type TEXT NOT NULL, -- 'deposit', 'order_payment', 'refund', 'manual_adjustment'
      reference_order_id TEXT,
      notes TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    -- Catalog Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Catalog Items
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      price REAL NOT NULL,
      is_veg INTEGER DEFAULT 1, -- 1 = veg, 0 = non-veg
      tax_rate REAL DEFAULT 5.0,
      description TEXT,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL, -- e.g. #D-1482
      service_type TEXT NOT NULL DEFAULT 'Takeaway', -- 'Takeaway', 'Delivery', 'Dine-In', 'Online'
      customer_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      subtotal REAL NOT NULL DEFAULT 0.00,
      tax_amount REAL NOT NULL DEFAULT 0.00,
      discount_amount REAL NOT NULL DEFAULT 0.00,
      total_amount REAL NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Completed', -- 'In Service', 'Preparing', 'Ready', 'Completed', 'Cancelled'
      payment_status TEXT NOT NULL DEFAULT 'Unpaid', -- 'Paid', 'Partially Paid', 'Unpaid', 'Refunded'
      payment_method TEXT, -- 'UPI', 'Cash', 'Card', 'Wallet', 'Split'
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    -- Inventory Items
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg', -- 'kg', 'ltr', 'pcs', 'pkt'
      current_stock REAL DEFAULT 0.0,
      min_stock_alert REAL DEFAULT 5.0,
      cost_per_unit REAL DEFAULT 0.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
