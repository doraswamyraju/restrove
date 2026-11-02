import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase, db } from './config/database';
import { walletRouter } from './modules/wallet/wallet.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { ordersRouter } from './modules/orders/orders.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5088;

// Initialize Database
initDatabase();

// CORS Settings
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://restrove.sriddha.com,http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for initial setup
    }
  },
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
    service: 'Restrove POS API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Modular API Routes
app.use('/api/wallet', walletRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/orders', ordersRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server on Port 5088
app.listen(PORT, () => {
  console.log(`[Restrove] Backend Server running strictly on port ${PORT}`);
  console.log(`[Restrove] Accessible for Web, Android, Desktop and iOS`);
});
