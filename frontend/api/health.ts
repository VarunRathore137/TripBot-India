import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options
const options: mongoose.ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions;

// Connection function
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    // If already connected, use the existing connection
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI as string, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Basic error handling for missing MongoDB URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Connect to MongoDB
    await connectDB();

    // Handle different HTTP methods
    switch (request.method) {
      case 'GET':
        return response.status(200).json({
          status: 'success',
          message: 'API is running',
          timestamp: new Date().toISOString(),
          mongoStatus: mongoose.connection.readyState
        });
      default:
        return response.status(405).json({
          status: 'error',
          message: 'Method not allowed',
          allowedMethods: ['GET']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    // Return a structured error response
    return response.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } finally {
    // Clean up MongoDB connection if needed
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.connection.close();
    }
  }
}