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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5088;

// Initialize Database
initDatabase();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve user uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Chai Wala Original - Restrove POS API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Register All Modules
app.use('/api/wallet', walletRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/customers', customersRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[Chai Wala POS] Backend Server running on port ${PORT}`);
});
