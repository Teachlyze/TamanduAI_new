// src/pages/api/cache/clear.js
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all cache keys
    const keys = await redisCache.client.keys('*');
    let clearedKeys = 0;

    if (keys.length > 0) {
      clearedKeys = keys.length;
      await redisCache.client.del(keys);
    }

    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      clearedKeys: clearedKeys
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
