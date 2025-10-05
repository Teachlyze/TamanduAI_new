// src/pages/api/cache/stats.js
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const stats = await redisCache.getCacheStats();

    if (!stats) {
      return res.status(503).json({
        error: 'Redis not available',
        message: 'Cache service is currently unavailable'
      });
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
