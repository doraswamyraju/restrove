import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './config/database';
import { walletRouter } from './modules/wallet/wallet.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { inventoryRouter } from './modules/inventory/inventory.routes';
import { reportsRouter } from './modules/reports/reports.routes';
import { customersRouter } from './modules/users/customers.routes';
import { settingsRouter } from './modules/settings/settings.routes';
import { digitalMenuRouter } from './modules/catalog/digitalMenu.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5088;

// Initialize Database with WAL mode and initial seeds
initDatabase();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Chai Wala Original - Restrove POS API',
    port: PORT,
    database: 'SQLite WAL (Active)',
    timestamp: new Date().toISOString()
  });
});

// Live Database API Routes
app.use('/api/wallet', walletRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/digital-menu', digitalMenuRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[Chai Wala POS] Running strictly on port ${PORT}`);
});
