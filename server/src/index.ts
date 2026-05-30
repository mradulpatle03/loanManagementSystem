import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';
import borrowerRoutes from './routes/borrower.routes';
import salesRoutes from './routes/sales.routes';
import sanctionRoutes from './routes/sanction.routes';
import disbursementRoutes from './routes/disbursement.routes';
import collectionRoutes from './routes/collection.routes';

import { errorHandler, notFound } from './middleware/error.middleware';

dotenv.config();
import { validateEnv } from './config/env';
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ message: 'LMS API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sanction', sanctionRoutes);
app.use('/api/disbursement', disbursementRoutes);
app.use('/api/collection', collectionRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect DB + start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

export default app;