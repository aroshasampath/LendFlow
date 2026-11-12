import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' })); // Body limit prevents payload flooding
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns service status, MongoDB connection health, uptime, and timestamp.
 */
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = isDbConnected ? 'healthy' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;

  return res.status(statusCode).json({
    status,
    message: isDbConnected
      ? 'LendFlow service is operating normally.'
      : 'Service is temporarily degraded. Database is not connected.',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[mongoose.connection.readyState] || 'unknown',
      target: 'lendflow',
    },
  });
});

// Root welcome check
app.get('/', (req, res) => {
  res.json({
    name: 'LendFlow API',
    version: '1.0.0',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested resource could not be found.',
  });
});

// Centralized Safe Error Handling Middleware
app.use((err, req, res, next) => {
  // Safe console log on backend only
  console.error('[Unhandled Error]', err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong on our side. Please try again later.'
        : err.message || 'Internal server error occurred.',
  });
});

// Initialize Database and Start Server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'YOUR_MONGODB_CONNECTION_STRING') {
      await connectDB();
    } else {
      console.warn(
        '\n[Configuration Notice] MONGODB_URI is currently set to placeholder in backend/.env.' +
        '\nUpdate backend/.env with your MongoDB Atlas connection string to connect to the database.\n'
      );
    }

    app.listen(PORT, () => {
      console.log(`[LendFlow Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[LendFlow Server] Health check available at: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('[Startup Failure] Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

