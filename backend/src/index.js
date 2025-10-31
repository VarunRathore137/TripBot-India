import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import itineraryRoutes from './routes/itinerary.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

import config from './config/app.js';

const app = express();

// Import middleware
import { limiter, securityMiddleware } from './middleware/security.js';
import logger, { requestLogger } from './utils/logger.js';

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply logging middleware
app.use(requestLogger);

// Apply security middleware
app.use(limiter);
app.use(securityMiddleware);

// Log startup
logger.info(`Server starting in ${config.nodeEnv} mode...`);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TripBot API' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
import connectDB from './config/database.js';
connectDB();

// Start server
app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});