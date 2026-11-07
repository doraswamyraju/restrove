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

  // Ensure migrations for new columns
  try { db.prepare('ALTER TABLE items ADD COLUMN image_url TEXT').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE items ADD COLUMN tag TEXT DEFAULT "Fresh"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE items ADD COLUMN image_emoji TEXT DEFAULT "☕"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE inventory_items ADD COLUMN category TEXT DEFAULT "Raw Materials"').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE order_items ADD COLUMN notes TEXT').run(); } catch (e) {}
  try { db.prepare("ALTER TABLE orders ADD COLUMN details TEXT DEFAULT 'Counter Pickup'").run(); } catch (e) {}

  seedFullChaiwalaMenu();
}

function seedFullChaiwalaMenu() {
  const categoriesData = [
    { id: 'cat-tea', name: 'Tea', slug: 'tea', sort: 1 },
    { id: 'cat-malai-bun', name: 'Malai Bun', slug: 'malai-bun', sort: 2 },
    { id: 'cat-icecream-juices', name: 'Ice Cream & Juices', slug: 'icecream-juices', sort: 3 },
    { id: 'cat-fruits-icecream', name: 'Fruits With Ice Cream', slug: 'fruits-icecream', sort: 4 },
    { id: 'cat-shake-icecream', name: 'Shake With Ice Cream', slug: 'shake-icecream', sort: 5 },
    { id: 'cat-icecream-scoop', name: 'Ice Cream Scoop', slug: 'icecream-scoop', sort: 6 },
    { id: 'cat-icecream-sundae', name: 'Ice Cream Sundae', slug: 'icecream-sundae', sort: 7 },
    { id: 'cat-mojito', name: 'Mojito', slug: 'mojito', sort: 8 },
    { id: 'cat-falloda', name: 'Falloda', slug: 'falloda', sort: 9 },
    { id: 'cat-lassi', name: 'Lassi', slug: 'lassi', sort: 10 },
    { id: 'cat-sizzlers', name: 'Sizzlers', slug: 'sizzlers', sort: 11 },
    { id: 'cat-shake', name: 'Shake', slug: 'shake', sort: 12 },
    { id: 'cat-biryani', name: 'Biryani', slug: 'biryani', sort: 13 },
    { id: 'cat-haleem', name: 'Haleem Wala', slug: 'haleem-wala', sort: 14 }
  ];

  const itemsData = [
    // 1. Tea
    { cat: 'cat-tea', name: 'Chaiwla Chai', price: 20, emoji: '☕', tag: 'Special', desc: 'The Perfect proportion of tea, milk, sugar, herbs and spices.' },
    { cat: 'cat-tea', name: 'Irani Tea', price: 20, emoji: '☕', tag: 'Bestseller', desc: 'Slowly brewed with authentic spiced tea decoction.' },
    { cat: 'cat-tea', name: 'Tea', price: 15, emoji: '☕', tag: 'Regular', desc: 'Classic piping hot milk tea.' },
    { cat: 'cat-tea', name: 'Elachi Tea', price: 25, emoji: '🫖', tag: 'Fragrant', desc: 'A perfect blend of milk & fresh cardamom.' },
    { cat: 'cat-tea', name: 'Ginger Tea', price: 25, emoji: '🫖', tag: 'Immunity', desc: 'Delicious immunity booster with fresh crushed ginger.' },
    { cat: 'cat-tea', name: 'Lemon Tea', price: 20, emoji: '🍋', tag: 'Fresh', desc: 'Tangy lemon and honey black tea.' },
    { cat: 'cat-tea', name: 'Green Tea', price: 25, emoji: '🍵', tag: 'Antioxidant', desc: 'Antioxidant-packed warm whole leaf brew.' },
    { cat: 'cat-tea', name: 'Black Tea', price: 15, emoji: '🍵', tag: 'Classic', desc: 'Pure black tea liquor.' },
    { cat: 'cat-tea', name: 'Zafrani Chai', price: 35, emoji: '✨', tag: 'Royal Saffron', desc: 'Brewed with pure Iranian saffron strands.' },
    { cat: 'cat-tea', name: 'Pineapple Tea', price: 25, emoji: '🍍', tag: 'Flavored', desc: 'Tropical fruit infusion tea.' },
    { cat: 'cat-tea', name: 'Sugar Less Tea', price: 20, emoji: '☕', tag: 'Diet', desc: 'Fresh brewed diabetic-friendly chai.' },
    { cat: 'cat-tea', name: 'Filter Coffee', price: 30, emoji: '☕', tag: 'South Indian', desc: 'Traditional filter decoction with frothed milk.' },
    { cat: 'cat-tea', name: 'Black Coffee', price: 25, emoji: '☕', tag: 'Classic', desc: 'Rich roasted brew without chicory.' },
    { cat: 'cat-tea', name: 'Sugar Less Coffee', price: 30, emoji: '☕', tag: 'Diet', desc: 'Unsweetened aromatic filter brew.' },
    { cat: 'cat-tea', name: 'Milk', price: 25, emoji: '🥛', tag: 'Fresh', desc: 'Pure hot buffalo milk.' },
    { cat: 'cat-tea', name: 'Badam Milk', price: 40, emoji: '🥛', tag: 'Rich', desc: 'Crushed almonds and saffron flavored hot milk.' },
    { cat: 'cat-tea', name: 'Turmeric Milk', price: 35, emoji: '🥛', tag: 'Immunity', desc: 'Haldi golden milk.' },
    { cat: 'cat-tea', name: 'Biscuit Single', price: 5, emoji: '🍪', tag: 'Osmania', desc: 'Hyderabadi Osmania Biscuit.' },
    { cat: 'cat-tea', name: 'Biscuits - 1N', price: 25, emoji: '🍪', tag: 'Plate', desc: 'Plate of 4 fresh bakery biscuits.' },
    { cat: 'cat-tea', name: 'Samosa', price: 20, emoji: '🥟', tag: 'Hot', desc: 'Crispy fried potato spiced samosa.' },
    { cat: 'cat-tea', name: 'Water Bottle 1lt', price: 20, emoji: '💧', tag: 'Chilled', desc: 'Packaged drinking water 1 Liter.' },
    { cat: 'cat-tea', name: '1/2 Water', price: 10, emoji: '💧', tag: '500ml', desc: '500ml drinking water.' },

    // 2. Malai Bun
    { cat: 'cat-malai-bun', name: 'Malai Bun', price: 40, emoji: '🍞', tag: 'Fresh Malai', desc: 'Soft bun smothered with thick sweet malai cream.' },
    { cat: 'cat-malai-bun', name: 'Parcel Malai Bun', price: 45, emoji: '🍞', tag: 'Takeaway', desc: 'Packed fresh for travel.' },
    { cat: 'cat-malai-bun', name: 'Plain Bun', price: 20, emoji: '🍞', tag: 'Bakery', desc: 'Toasted bakery bun.' },

    // 3. Ice Cream & Juices
    { cat: 'cat-icecream-juices', name: 'Apple Juice', price: 70, emoji: '🍎', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Banana Juice', price: 50, emoji: '🍌', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Black Grapes', price: 70, emoji: '🍇', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Butter Fruit', price: 90, emoji: '🥑', tag: 'Avocado' },
    { cat: 'cat-icecream-juices', name: 'Butter Milk', price: 30, emoji: '🥛', tag: 'Cooler' },
    { cat: 'cat-icecream-juices', name: 'Chickoo', price: 60, emoji: '🥔', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Chocolate', price: 80, emoji: '🍫', tag: 'Chilled' },
    { cat: 'cat-icecream-juices', name: 'Cool Drinks', price: 40, emoji: '🥤', tag: 'Can/Bottle' },
    { cat: 'cat-icecream-juices', name: 'Dragon Fruit', price: 90, emoji: '🐉', tag: 'Exotic' },
    { cat: 'cat-icecream-juices', name: 'Ginger Lime', price: 40, emoji: '🍋', tag: 'Refreshing' },
    { cat: 'cat-icecream-juices', name: 'Jaljeera', price: 35, emoji: '🌿', tag: 'Digestive' },
    { cat: 'cat-icecream-juices', name: 'Kiwi', price: 90, emoji: '🥝', tag: 'Exotic' },
    { cat: 'cat-icecream-juices', name: 'Lime Juice', price: 35, emoji: '🍋', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Lime Soda', price: 45, emoji: '🥤', tag: 'Fizz' },
    { cat: 'cat-icecream-juices', name: 'Mango', price: 70, emoji: '🥭', tag: 'Seasonal' },
    { cat: 'cat-icecream-juices', name: 'Masala Soda', price: 45, emoji: '🥤', tag: 'Spiced' },
    { cat: 'cat-icecream-juices', name: 'Musambi', price: 60, emoji: '🍊', tag: 'Sweet Lime' },
    { cat: 'cat-icecream-juices', name: 'Muskmelon', price: 60, emoji: '🍈', tag: 'Hydrating' },
    { cat: 'cat-icecream-juices', name: 'Orange Juice', price: 70, emoji: '🍊', tag: 'Vitamin C' },
    { cat: 'cat-icecream-juices', name: 'Papaya', price: 50, emoji: '🍈', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Pineapple', price: 60, emoji: '🍍', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Pomegranate', price: 80, emoji: '🍎', tag: 'Pure' },
    { cat: 'cat-icecream-juices', name: 'Strawberry', price: 80, emoji: '🍓', tag: 'Fresh' },
    { cat: 'cat-icecream-juices', name: 'Vanilla Ice Cream', price: 50, emoji: '🍨', tag: 'Scoop' },
    { cat: 'cat-icecream-juices', name: 'Water Melon Lime', price: 50, emoji: '🍉', tag: 'Cooler' },
    { cat: 'cat-icecream-juices', name: 'Watermelon', price: 50, emoji: '🍉', tag: 'Hydrating' },

    // 4. Fruits With Ice Cream
    { cat: 'cat-fruits-icecream', name: 'Fruit Bowl Salad', price: 90, emoji: '🥗', tag: 'Mixed Fruit' },
    { cat: 'cat-fruits-icecream', name: 'Fruit Salad With Icecream', price: 120, emoji: '🍨', tag: 'Popular' },
    { cat: 'cat-fruits-icecream', name: 'Honey Moon Salad With Ice Cream', price: 140, emoji: '🍨', tag: 'Special' },
    { cat: 'cat-fruits-icecream', name: 'Lychee Salad With Ice Cream', price: 130, emoji: '🍨', tag: 'Exotic' },
    { cat: 'cat-fruits-icecream', name: 'Rainbow Salad With Ice Cream', price: 150, emoji: '🍨', tag: 'Supreme' },

    // 5. Shake With Ice Cream
    { cat: 'cat-shake-icecream', name: 'Cadburry Mud', price: 130, emoji: '🍫', tag: 'Rich' },
    { cat: 'cat-shake-icecream', name: 'Chocolate Mud', price: 120, emoji: '🍫', tag: 'Thick' },
    { cat: 'cat-shake-icecream', name: 'Five Star Mud', price: 130, emoji: '🍫', tag: 'Caramel' },
    { cat: 'cat-shake-icecream', name: 'Mississippi Mud', price: 140, emoji: '🍫', tag: 'Bestseller' },
    { cat: 'cat-shake-icecream', name: 'Nutella Mud', price: 150, emoji: '🍫', tag: 'Premium' },
    { cat: 'cat-shake-icecream', name: 'Oreo Mud', price: 130, emoji: '🍪', tag: 'Crunchy' },

    // 6. Ice Cream Sundae
    { cat: 'cat-icecream-sundae', name: 'Butter Scotch Fudge', price: 110, emoji: '🍨', tag: 'Crunchy' },
    { cat: 'cat-icecream-sundae', name: 'Chocolate Brownie', price: 130, emoji: '🍰', tag: 'Hot & Cold' },
    { cat: 'cat-icecream-sundae', name: 'Chocolate Fudge', price: 110, emoji: '🍨', tag: 'Fudge' },
    { cat: 'cat-icecream-sundae', name: 'Choconut Sundae', price: 120, emoji: '🍨', tag: 'Nutty' },
    { cat: 'cat-icecream-sundae', name: 'Death By Chocolate', price: 160, emoji: '🍫', tag: 'Signature' },
    { cat: 'cat-icecream-sundae', name: 'Dry Fruit Sundae', price: 140, emoji: '🍨', tag: 'Loaded' },
    { cat: 'cat-icecream-sundae', name: 'Gad Bud', price: 130, emoji: '🍨', tag: 'Classic' },
    { cat: 'cat-icecream-sundae', name: 'Mango Fudge', price: 110, emoji: '🥭', tag: 'Mango' },
    { cat: 'cat-icecream-sundae', name: 'Mexican Brownie', price: 140, emoji: '🍰', tag: 'Spicy Choco' },
    { cat: 'cat-icecream-sundae', name: 'Nutella Brownie', price: 150, emoji: '🍰', tag: 'Nutella' },
    { cat: 'cat-icecream-sundae', name: 'Nutella Fudge', price: 130, emoji: '🍨', tag: 'Nutella' },
    { cat: 'cat-icecream-sundae', name: 'Roasted Almond', price: 120, emoji: '🍨', tag: 'Almonds' },
    { cat: 'cat-icecream-sundae', name: 'Vanilla Fudge', price: 90, emoji: '🍨', tag: 'Fudge' },

    // 7. Mojito
    { cat: 'cat-mojito', name: 'Apple Mojito', price: 90, emoji: '🍏', tag: 'Minty' },
    { cat: 'cat-mojito', name: 'Blue Berry Mojito', price: 100, emoji: '🫐', tag: 'Berry' },
    { cat: 'cat-mojito', name: 'Blue Mojito', price: 90, emoji: '🌊', tag: 'Curacao' },
    { cat: 'cat-mojito', name: 'Mango Mojito', price: 90, emoji: '🥭', tag: 'Tropical' },
    { cat: 'cat-mojito', name: 'Mint Leaves', price: 80, emoji: '🌿', tag: 'Virgin' },
    { cat: 'cat-mojito', name: 'Passion Fruit Mojito', price: 110, emoji: '🍹', tag: 'Exotic' },
    { cat: 'cat-mojito', name: 'Pineapple Mojito', price: 90, emoji: '🍍', tag: 'Tropical' },
    { cat: 'cat-mojito', name: 'Virgin Pepper Short', price: 80, emoji: '🌶️', tag: 'Zesty' },
    { cat: 'cat-mojito', name: 'Watermelon Mojito', price: 90, emoji: '🍉', tag: 'Cooling' },

    // 8. Falloda
    { cat: 'cat-falloda', name: 'Arabian Falooda', price: 130, emoji: '🍧', tag: 'Special' },
    { cat: 'cat-falloda', name: 'Fruit Falooda', price: 110, emoji: '🍧', tag: 'Fresh Fruits' },
    { cat: 'cat-falloda', name: 'Kesar Falooda', price: 120, emoji: '🍧', tag: 'Saffron' },
    { cat: 'cat-falloda', name: 'Kulfi Falooda', price: 130, emoji: '🍧', tag: 'Desi Kulfi' },
    { cat: 'cat-falloda', name: 'Pista Falooda', price: 120, emoji: '🍧', tag: 'Pistachio' },
    { cat: 'cat-falloda', name: 'Plain Falooda', price: 90, emoji: '🍧', tag: 'Rose' },
    { cat: 'cat-falloda', name: 'Rose Milk', price: 50, emoji: '🥛', tag: 'Chilled' },
    { cat: 'cat-falloda', name: 'Royal Falooda', price: 140, emoji: '🍧', tag: 'Supreme' },

    // 9. Lassi
    { cat: 'cat-lassi', name: 'Butter Scotch Lassi', price: 70, emoji: '🥛', tag: 'Crunch' },
    { cat: 'cat-lassi', name: 'Chocolate Lassi', price: 70, emoji: '🍫', tag: 'Choco' },
    { cat: 'cat-lassi', name: 'Dry Fruit Lassi', price: 90, emoji: '🥜', tag: 'Loaded' },
    { cat: 'cat-lassi', name: 'Fruit Lassi', price: 80, emoji: '🍓', tag: 'Fresh Fruit' },
    { cat: 'cat-lassi', name: 'Lychee Lassi', price: 80, emoji: '🥛', tag: 'Exotic' },
    { cat: 'cat-lassi', name: 'Mango Lassi', price: 70, emoji: '🥭', tag: 'King' },
    { cat: 'cat-lassi', name: 'Saffron Lassi', price: 80, emoji: '✨', tag: 'Kesar' },
    { cat: 'cat-lassi', name: 'Strawberry Lassi', price: 70, emoji: '🍓', tag: 'Berry' },
    { cat: 'cat-lassi', name: 'Sweet Lassi', price: 50, emoji: '🥛', tag: 'Traditional' },

    // 10. Sizzlers
    { cat: 'cat-sizzlers', name: 'Butter Scotch Sizzler', price: 160, emoji: '🔥', tag: 'Sizzling' },
    { cat: 'cat-sizzlers', name: 'Chocolate Sizzler', price: 160, emoji: '🔥', tag: 'Hot Choco' },
    { cat: 'cat-sizzlers', name: 'Sizzling Brownie', price: 180, emoji: '🔥', tag: 'Bestseller' },

    // 11. Shake
    { cat: 'cat-shake', name: 'Apple Shake', price: 80, emoji: '🍎', tag: 'Thick' },
    { cat: 'cat-shake', name: 'Apple Shake A', price: 90, emoji: '🍎', tag: 'Special' },
    { cat: 'cat-shake', name: 'Banana Shake', price: 60, emoji: '🍌', tag: 'Energy' },
    { cat: 'cat-shake', name: 'Black Current Shake', price: 80, emoji: '🫐', tag: 'Currant' },
    { cat: 'cat-shake', name: 'Blue Berry Shake', price: 90, emoji: '🫐', tag: 'Berry' },
    { cat: 'cat-shake', name: 'Butter Fruit Shake', price: 100, emoji: '🥑', tag: 'Avocado' },
    { cat: 'cat-shake', name: 'Butter Scotch Shake', price: 80, emoji: '🥤', tag: 'Crunch' },
    { cat: 'cat-shake', name: 'Cadbery Shake', price: 90, emoji: '🍫', tag: 'Cadbury' },
    { cat: 'cat-shake', name: 'Chocolate Shake', price: 80, emoji: '🍫', tag: 'Classic' },
    { cat: 'cat-shake', name: 'Dry Fruit Shake', price: 110, emoji: '🥜', tag: 'Dry Fruits' },
    { cat: 'cat-shake', name: 'Kesar Pista Shake', price: 90, emoji: '✨', tag: 'Rich' },
    { cat: 'cat-shake', name: 'Kit Kat Shake', price: 90, emoji: '🍫', tag: 'KitKat' },
    { cat: 'cat-shake', name: 'Lychee & Lychee Shake', price: 90, emoji: '🥤', tag: 'Lychee' },
    { cat: 'cat-shake', name: 'Lychee & Mango Shake', price: 90, emoji: '🥭', tag: 'Fusion' },
    { cat: 'cat-shake', name: 'Mango Shake', price: 80, emoji: '🥭', tag: 'Mango' },
    { cat: 'cat-shake', name: 'Mango-Banna Shake', price: 80, emoji: '🍌', tag: 'Twin' },
    { cat: 'cat-shake', name: 'Mango-Strawberry Shake', price: 90, emoji: '🍓', tag: 'Fusion' },
    { cat: 'cat-shake', name: 'Mixed Fruit Shake', price: 80, emoji: '🍹', tag: 'Healthy' },
    { cat: 'cat-shake', name: 'Musk Melon Shake', price: 70, emoji: '🍈', tag: 'Melon' },
    { cat: 'cat-shake', name: 'Nutella Shake', price: 110, emoji: '🍫', tag: 'Nutella' },
    { cat: 'cat-shake', name: 'Oreo Shake', price: 90, emoji: '🍪', tag: 'Oreo' },
    { cat: 'cat-shake', name: 'Papaya Shake', price: 60, emoji: '🍈', tag: 'Fresh' },
    { cat: 'cat-shake', name: 'Peanut Butter Shake', price: 90, emoji: '🥜', tag: 'Protein' },
    { cat: 'cat-shake', name: 'Pineapple Shake', price: 70, emoji: '🍍', tag: 'Fresh' },
    { cat: 'cat-shake', name: 'Pista Shake', price: 80, emoji: '🥤', tag: 'Pistachio' },
    { cat: 'cat-shake', name: 'Red Velvet Shake', price: 100, emoji: '🍰', tag: 'Velvet' },
    { cat: 'cat-shake', name: 'Strawberry Shake', price: 80, emoji: '🍓', tag: 'Berry' },
    { cat: 'cat-shake', name: 'Vanilla Shake', price: 70, emoji: '🍨', tag: 'Classic' },

    // 12. Biryani & Haleem
    { cat: 'cat-biryani', name: 'Hyderabadi Dum Biryani', price: 160, emoji: '🍲', tag: 'Special' },
    { cat: 'cat-biryani', name: 'Chicken Biryani Single', price: 120, emoji: '🍗', tag: 'Single' },
    { cat: 'cat-haleem', name: 'Special Mutton Haleem', price: 180, emoji: '🥣', tag: 'Desi Ghee' },
    { cat: 'cat-haleem', name: 'Chicken Haleem', price: 140, emoji: '🥣', tag: 'Rich' }
  ];

  // Upsert categories
  const catStmt = db.prepare(`
    INSERT INTO categories (id, name, slug, sort_order, is_active)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, sort_order=excluded.sort_order
  `);
  for (const c of categoriesData) {
    catStmt.run(c.id, c.name, c.slug, c.sort);
  }

  // Upsert items
  const itemStmt = db.prepare(`
    INSERT INTO items (id, category_id, name, price, is_veg, image_emoji, tag, description, is_available)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, price=excluded.price, tag=excluded.tag, image_emoji=excluded.image_emoji, description=excluded.description
  `);

  let idx = 1;
  for (const it of itemsData) {
    const itemId = `it-cw-${idx++}`;
    itemStmt.run(itemId, it.cat, it.name, it.price, it.emoji, it.tag, it.desc || '');
  }

  // Ensure default settings exist
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
