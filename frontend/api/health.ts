import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../backend/src/config/mongodb.config';
import { errorHandler } from '../../backend/src/middleware/errorHandler';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Handle different HTTP methods
    switch (request.method) {
      case 'GET':
        return response.status(200).json({ status: 'API is running' });
      default:
        return response.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return errorHandler(error, request, response);
  }
}