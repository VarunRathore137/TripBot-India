import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    return response.status(200).json({
      status: 'success',
      message: 'Test API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelRegion: process.env.VERCEL_REGION
    });
  } catch (error) {
    console.error('API Error:', error);
    return response.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}