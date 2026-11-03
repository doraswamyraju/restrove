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
db.pragma('foreign_keys = OFF');

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
      details TEXT DEFAULT 'Counter Pickup',
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
      notes TEXT,
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

  // Auto-migrate tables for new columns
  try { db.prepare('ALTER TABLE items ADD COLUMN image_url TEXT').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE items ADD COLUMN tag TEXT DEFAULT "Fresh"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE items ADD COLUMN image_emoji TEXT DEFAULT "☕"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE inventory_items ADD COLUMN category TEXT DEFAULT "Raw Materials"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE order_items ADD COLUMN notes TEXT').run(); } catch (e) {}
  try { db.prepare("ALTER TABLE orders ADD COLUMN details TEXT DEFAULT 'Counter Pickup'").run(); } catch (e) {}

  // 1. Categories
  const seedCats = [
    { id: 'cat-chai', name: 'Special Chai & Tea', slug: 'special-chai', sort: 1 },
    { id: 'cat-coffee', name: 'Coffee & Milk', slug: 'coffee-milk', sort: 2 },
    { id: 'cat-buns', name: 'Maska Buns', slug: 'maska-buns', sort: 3 },
    { id: 'cat-snacks', name: 'Hot Snacks', slug: 'hot-snacks', sort: 4 },
    { id: 'cat-bakery', name: 'Biscuits & Bakery', slug: 'biscuits-bakery', sort: 5 },
  ];
  for (const c of seedCats) {
    db.prepare('INSERT OR REPLACE INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)').run(c.id, c.name, c.slug, c.sort);
  }

  // 2. Products from Menu Card Photo + Core Cafeteria Menu
  const seedItems = [
    // Menu Card Exact 8 Teas:
    {
      id: 'it-irani-tea',
      cat: 'cat-chai',
      name: 'IRANI TEA',
      price: 20,
      emoji: '☕',
      tag: 'Bestseller',
      desc: 'A passion Influenced tea which slowly brewed with some spice with given the tea decoction and nice flavour'
    },
    {
      id: 'it-chaiwala-chai',
      cat: 'cat-chai',
      name: 'CHAIWALA CHAI',
      price: 25,
      emoji: '🫖',
      tag: 'Special',
      desc: 'The Perfect proportion of tea, milk, sugar, herbs and Spices. A Specially Blended [Chaiwala Favourite Tea]'
    },
    {
      id: 'it-ginger-tea',
      cat: 'cat-chai',
      name: 'GINGER TEA',
      price: 25,
      emoji: '🫖',
      tag: 'Immunity',
      desc: 'Health yourself out with delicilously immunity boosting.'
    },
    {
      id: 'it-elachi-tea',
      cat: 'cat-chai',
      name: 'ELACHI TEA',
      price: 25,
      emoji: '☕',
      tag: 'Fragrant',
      desc: 'A perfect blend of milk & elachi mix.'
    },
    {
      id: 'it-zafrani-chai',
      cat: 'cat-chai',
      name: 'ZAFRANI CHAI',
      price: 50,
      emoji: '👑',
      tag: 'Royal Saffron',
      desc: 'Chaiwala tea brewed with original saffron, the mark of royality.'
    },
    {
      id: 'it-lemon-tea',
      cat: 'cat-chai',
      name: 'LEMON TEA',
      price: 20,
      emoji: '🍋',
      tag: 'Refreshing',
      desc: 'With honey tangy lemon flavours in fragrant black tea for day long refreshment.'
    },
    {
      id: 'it-green-tea',
      cat: 'cat-chai',
      name: 'GREEN TEA',
      price: 20,
      emoji: '🍵',
      tag: 'Antioxidant',
      desc: 'A delicate anti oxidant packed warm drink prepared with the choices leave.'
    },
    {
      id: 'it-black-tea',
      cat: 'cat-chai',
      name: 'BLACK TEA',
      price: 20,
      emoji: '☕',
      tag: 'Classic',
      desc: 'Is a true tea that comes with tea leaves.'
    },

    // Coffee & Milk
    { id: 'it-coffee', cat: 'cat-coffee', name: 'Filter Coffee', price: 30, emoji: '☕', tag: 'South Indian', desc: 'Freshly brewed aromatic chicory coffee' },
    { id: 'it-badam-milk', cat: 'cat-coffee', name: 'Hot Badam Milk', price: 40, emoji: '🥛', tag: 'Rich & Creamy', desc: 'Real crushed almonds with saffron milk' },
    { id: 'it-golden-milk', cat: 'cat-coffee', name: 'Turmeric Golden Milk', price: 35, emoji: '🥛', tag: 'Immunity', desc: 'Warm milk with turmeric and black pepper' },

    // Buns
    { id: 'it-bun-maska', cat: 'cat-buns', name: 'Classic Maska Bun', price: 35, emoji: '🍞', tag: 'Amul Butter', desc: 'Soft bun loaded with dollops of butter' },
    { id: 'it-bun-jam', cat: 'cat-buns', name: 'Bun Maska Jam', price: 45, emoji: '🍞', tag: 'Sweet & Salty', desc: 'Mixed fruit jam and cream butter' },
    { id: 'it-bun-cheese', cat: 'cat-buns', name: 'Cheese Bun Maska', price: 55, emoji: '🧀', tag: 'Grilled', desc: 'Melted cheese stuffed inside grilled bun' },

    // Snacks
    { id: 'it-aloo-samosa', cat: 'cat-snacks', name: 'Crispy Aloo Samosa (2 pcs)', price: 40, emoji: '🥟', tag: 'Served Hot', desc: 'Spiced potato samosas served with mint chutney' },
    { id: 'it-onion-samosa', cat: 'cat-snacks', name: 'Onion Samosa (4 pcs)', price: 35, emoji: '🥟', tag: 'Crispy Mini', desc: 'Crispy cocktail onion samosas' },

    // Bakery
    { id: 'it-osmania', cat: 'cat-bakery', name: 'Osmania Biscuits (4 pcs)', price: 25, emoji: '🍪', tag: 'Chai Dip', desc: 'Authentic Hyderabadi salty sweet biscuits' },
    { id: 'it-butter-cookies', cat: 'cat-bakery', name: 'Butter Cookies (Plate)', price: 30, emoji: '🍪', tag: 'Fresh Baked', desc: 'Melt-in-mouth bakery cookies' },

    // Additional Cafeteria Kitchen & Meals (referencable by orders)
    { id: 'custom-item', cat: 'cat-chai', name: 'Custom Item', price: 0, emoji: '🍽️', tag: 'Special', desc: 'Custom cafeteria item' },
    { id: 'it-paneer-tikka', cat: 'cat-snacks', name: 'Paneer Tikka', price: 280, emoji: '🧀', tag: 'Tandoor', desc: 'Tandoori paneer cubes' },
    { id: 'it-veg-biryani', cat: 'cat-snacks', name: 'Veg Biryani', price: 260, emoji: '🍚', tag: 'Main Course', desc: 'Dum vegetable biryani' },
    { id: 'it-butter-naan', cat: 'cat-snacks', name: 'Butter Naan', price: 60, emoji: '🫓', tag: 'Breads', desc: 'Crispy butter naan' },
    { id: 'it-chicken-curry', cat: 'cat-snacks', name: 'Chicken Curry', price: 330, emoji: '🍗', tag: 'Main Course', desc: 'Homestyle chicken curry' },
    { id: 'it-chicken-biryani', cat: 'cat-snacks', name: 'Chicken Biryani', price: 320, emoji: '🍗', tag: 'Bestseller', desc: 'Hyderabadi chicken biryani' },
    { id: 'it-thums-up', cat: 'cat-coffee', name: 'Thums Up', price: 40, emoji: '🥤', tag: 'Cold Drink', desc: 'Chilled bottle' },
    { id: 'it-paneer-butter', cat: 'cat-snacks', name: 'Paneer Butter Masala', price: 290, emoji: '🧀', tag: 'Main Course', desc: 'Rich paneer gravy' },
    { id: 'it-tandoori', cat: 'cat-snacks', name: 'Tandoori Platter', price: 650, emoji: '🍗', tag: 'Special', desc: 'Assorted tandoori platter' },
    { id: 'it-mutton-biryani', cat: 'cat-snacks', name: 'Mutton Biryani', price: 450, emoji: '🍖', tag: 'Special', desc: 'Tender mutton biryani' },
    { id: 'it-garlic-naan', cat: 'cat-snacks', name: 'Garlic Naan', price: 75, emoji: '🫓', tag: 'Breads', desc: 'Garlic butter naan' },
    { id: 'it-fried-rice', cat: 'cat-snacks', name: 'Chicken Fried Rice', price: 260, emoji: '🍚', tag: 'Chinese', desc: 'Indo-Chinese fried rice' },
    { id: 'it-chilli-chicken', cat: 'cat-snacks', name: 'Chilli Chicken', price: 280, emoji: '🍗', tag: 'Chinese', desc: 'Crispy chilli chicken' },
  ];

  for (const it of seedItems) {
    db.prepare(`
      INSERT OR REPLACE INTO items (id, category_id, name, price, is_veg, image_emoji, tag, description, is_available)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, 1)
    `).run(it.id, it.cat, it.name, it.price, it.emoji, it.tag, it.desc);
  }

  // 3. Customers & Wallet Balances (stored in SQLite Database)
  const custCount: any = db.prepare('SELECT COUNT(*) as c FROM customers').get();
  if (custCount.c === 0) {
    const seedCustomers = [
      { id: 'cust-1', name: 'Doraswamy Raju', phone: '9876543210', wallet: 380.00, spent: 4850.00, visits: 28, notes: 'VIP Regular Customer' },
      { id: 'cust-2', name: 'Kiran Kumar', phone: '9848022338', wallet: 150.00, spent: 1920.00, visits: 14, notes: 'Prefers Ginger Tea' },
      { id: 'cust-3', name: 'Suresh Varma', phone: '9440112233', wallet: 620.00, spent: 7120.00, visits: 42, notes: 'Corporate bulk orders' },
      { id: 'cust-4', name: 'Ramesh Reddy', phone: '9988776655', wallet: 0.00, spent: 840.00, visits: 6, notes: 'Walk-in regular' }
    ];

    for (const c of seedCustomers) {
      db.prepare(`
        INSERT INTO customers (id, name, phone, wallet_balance, total_spent, visit_count, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(c.id, c.name, c.phone, c.wallet, c.spent, c.visits, c.notes);

      if (c.wallet > 0) {
        db.prepare(`
          INSERT INTO wallet_transactions (id, customer_id, amount, balance_after, type, notes, created_by)
          VALUES (?, ?, ?, ?, 'deposit', 'Initial Advance Deposit', 'system')
        `).run(`tx-${c.id}-init`, c.id, c.wallet, c.wallet);
      }
    }
  }

  // 4. Initial Orders (Real SQLite Database Records)
  const orderCountRow: any = db.prepare('SELECT COUNT(*) as c FROM orders').get();
  if (orderCountRow.c === 0) {
    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDateStr = yesterdayDate.toISOString().split('T')[0];

    const initialOrders = [
      {
        id: 'ord-1482',
        order_number: '#D-1482',
        service_type: 'Dine In',
        details: 'Table T4 • 4 Guests',
        customer_name: 'Doraswamy Raju',
        customer_phone: '9876543210',
        subtotal: 990.00,
        tax_amount: 49.50,
        discount_amount: 0.00,
        total_amount: 1039.50,
        status: 'Completed',
        payment_status: 'Paid',
        payment_method: 'UPI',
        created_at: `${todayDateStr} 12:42:00`,
        items: [
          { itemId: 'it-paneer-tikka', name: 'Paneer Tikka', qty: 1, rate: 280, amount: 280 },
          { itemId: 'it-veg-biryani', name: 'Veg Biryani', qty: 1, rate: 260, amount: 260 },
          { itemId: 'it-butter-naan', name: 'Butter Naan', qty: 2, rate: 60, amount: 120 },
          { itemId: 'it-chicken-curry', name: 'Chicken Curry', qty: 1, rate: 330, amount: 330 }
        ]
      },
      {
        id: 'ord-1481',
        order_number: '#D-1481',
        service_type: 'Dine In',
        details: 'Table T2 • 2 Guests',
        customer_name: 'Kiran Kumar',
        customer_phone: '9848022338',
        subtotal: 647.62,
        tax_amount: 32.38,
        discount_amount: 0.00,
        total_amount: 680.00,
        status: 'Completed',
        payment_status: 'Paid',
        payment_method: 'Cash',
        created_at: `${todayDateStr} 12:25:00`,
        items: [
          { itemId: 'it-chicken-biryani', name: 'Chicken Biryani', qty: 2, rate: 320, amount: 640 },
          { itemId: 'it-thums-up', name: 'Thums Up', qty: 1, rate: 40, amount: 40 }
        ]
      },
      {
        id: 'ord-1480',
        order_number: '#T-1480',
        service_type: 'Takeaway',
        details: 'Counter Pickup',
        customer_name: 'Suresh Varma',
        customer_phone: '9440112233',
        subtotal: 400.00,
        tax_amount: 20.00,
        discount_amount: 0.00,
        total_amount: 420.00,
        status: 'Completed',
        payment_status: 'Paid',
        payment_method: 'Wallet',
        created_at: `${todayDateStr} 12:10:00`,
        items: [
          { itemId: 'it-paneer-butter', name: 'Paneer Butter Masala', qty: 1, rate: 290, amount: 290 },
          { itemId: 'it-butter-naan', name: 'Butter Naan', qty: 2, rate: 60, amount: 120 }
        ]
      },
      {
        id: 'ord-1479',
        order_number: '#D-1479',
        service_type: 'Dine In',
        details: 'Table T6 • 6 Guests',
        customer_name: 'Walk-in Guest',
        customer_phone: '',
        subtotal: 1771.43,
        tax_amount: 88.57,
        discount_amount: 0.00,
        total_amount: 1860.00,
        status: 'In Service',
        payment_status: 'Paid',
        payment_method: 'Card',
        created_at: `${todayDateStr} 12:05:00`,
        items: [
          { itemId: 'it-tandoori', name: 'Tandoori Platter', qty: 1, rate: 650, amount: 650 },
          { itemId: 'it-mutton-biryani', name: 'Mutton Biryani', qty: 2, rate: 450, amount: 900 },
          { itemId: 'it-garlic-naan', name: 'Garlic Naan', qty: 4, rate: 75, amount: 300 }
        ]
      },
      {
        id: 'ord-1478',
        order_number: '#O-1478',
        service_type: 'Online',
        details: 'Swiggy Web Order',
        customer_name: 'Online Guest',
        customer_phone: '',
        subtotal: 514.28,
        tax_amount: 25.72,
        discount_amount: 0.00,
        total_amount: 540.00,
        status: 'Preparing',
        payment_status: 'Paid',
        payment_method: 'Razorpay',
        created_at: `${todayDateStr} 11:50:00`,
        items: [
          { itemId: 'it-fried-rice', name: 'Chicken Fried Rice', qty: 1, rate: 260, amount: 260 },
          { itemId: 'it-chilli-chicken', name: 'Chilli Chicken', qty: 1, rate: 280, amount: 280 }
        ]
      },

      // Yesterday's historical orders to make daily comparison dynamic
      {
        id: 'ord-1477',
        order_number: '#D-1477',
        service_type: 'Dine In',
        details: 'Table T1 • 2 Guests',
        customer_name: 'Doraswamy Raju',
        customer_phone: '9876543210',
        subtotal: 333.33,
        tax_amount: 16.67,
        discount_amount: 0.00,
        total_amount: 350.00,
        status: 'Completed',
        payment_status: 'Paid',
        payment_method: 'UPI',
        created_at: `${yesterdayDateStr} 14:15:00`,
        items: [
          { itemId: 'it-irani-tea', name: 'IRANI TEA', qty: 5, rate: 20, amount: 100 },
          { itemId: 'it-bun-maska', name: 'Classic Maska Bun', qty: 4, rate: 35, amount: 140 },
          { itemId: 'it-aloo-samosa', name: 'Crispy Aloo Samosa (2 pcs)', qty: 2, rate: 40, amount: 80 },
          { itemId: 'it-osmania', name: 'Osmania Biscuits (4 pcs)', qty: 1, rate: 25, amount: 25 }
        ]
      },
      {
        id: 'ord-1476',
        order_number: '#T-1476',
        service_type: 'Takeaway',
        details: 'Counter Pickup',
        customer_name: 'Walk-in Guest',
        customer_phone: '',
        subtotal: 171.43,
        tax_amount: 8.57,
        discount_amount: 0.00,
        total_amount: 180.00,
        status: 'Completed',
        payment_status: 'Paid',
        payment_method: 'Cash',
        created_at: `${yesterdayDateStr} 16:30:00`,
        items: [
          { itemId: 'it-zafrani-chai', name: 'ZAFRANI CHAI', qty: 2, rate: 50, amount: 100 },
          { itemId: 'it-ginger-tea', name: 'GINGER TEA', qty: 2, rate: 25, amount: 50 },
          { itemId: 'it-butter-cookies', name: 'Butter Cookies (Plate)', qty: 1, rate: 30, amount: 30 }
        ]
      }
    ];

    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, service_type, details, customer_name, customer_phone,
        subtotal, tax_amount, discount_amount, total_amount, status, payment_status, payment_method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (id, order_id, item_id, item_name, quantity, rate, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      for (const ord of initialOrders) {
        insertOrderStmt.run(
          ord.id,
          ord.order_number,
          ord.service_type,
          ord.details,
          ord.customer_name,
          ord.customer_phone,
          ord.subtotal,
          ord.tax_amount,
          ord.discount_amount,
          ord.total_amount,
          ord.status,
          ord.payment_status,
          ord.payment_method,
          ord.created_at
        );

        for (let i = 0; i < ord.items.length; i++) {
          const it = ord.items[i];
          insertItemStmt.run(
            `${ord.id}-it-${i + 1}`,
            ord.id,
            it.itemId || 'it-irani-tea',
            it.name,
            it.qty,
            it.rate,
            it.amount
          );
        }
      }
    } catch (seedErr) {
      console.warn('[DB] Initial order seeding note:', seedErr);
    }
  }

  // 5. Seed inventory if empty
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

  // 6. Settings default values
  const settingsCount: any = db.prepare('SELECT COUNT(*) as c FROM settings').get();
  if (settingsCount.c === 0) {
    const defaultSettings = [
      { key: 'outletName', value: 'Chai Wala Original' },
      { key: 'branchAddress', value: 'Shop #4, Near Clock Tower, Tirupati, AP' },
      { key: 'fssaiNumber', value: '10123028000451' },
      { key: 'gstNumber', value: '37AAAAA0000A1Z5' },
      { key: 'paperWidth', value: '80mm' },
      { key: 'footerMessage', value: 'Thank you for visiting! Have a fresh cutting chai day ☕' },
      { key: 'autoPrintToken', value: 'true' }
    ];
    for (const s of defaultSettings) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(s.key, s.value);
    }
  }
}
