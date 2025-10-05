const express = require('express');
const router = express.Router();
const tokenService = require('../services/agora/tokenService');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Create a new whiteboard room
router.post('/rooms', authenticate, async (req, res, next) => {
  try {
    const { name, limit = 0, isRecord = false } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    // In a real implementation, you would save the room to your database
    const room = {
      uuid: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      limit,
      isRecord,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      status: 'active',
      participantCount: 0,
      maxParticipants: limit > 0 ? limit : null
    };
    
    // Save room to database here
    // Example: await db.collection('whiteboardRooms').insertOne(room);
    
    res.status(201).json({
      success: true,
      data: room,
      message: 'Whiteboard room created successfully'
    });
  } catch (error) {
    console.error('Error creating whiteboard room:', error);
    next(error);
  }
});

// Get room token
router.get('/rooms/:roomUuid/token', authenticate, async (req, res, next) => {
  try {
    const { roomUuid } = req.params;
    const { userId, role = 'writer' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID is required' 
      });
    }
    
    // In a real implementation, you would verify the user has access to this room
    // and the requested role is valid
    
    const token = tokenService.generateWhiteboardToken(roomUuid, userId, role);
    
    res.json({
      success: true,
      data: {
        token: token.token,
        uuid: roomUuid,
        expireTime: token.expireTime,
        role,
        userId
      },
      message: 'Token generated successfully'
    });
  } catch (error) {
    console.error('Error generating whiteboard token:', error);
    next(error);
  }
});

// Document conversion
router.post('/convert', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }
    
    const { originalname, mimetype, buffer } = req.file;
    const { type = 'dynamic' } = req.body; // 'dynamic' or 'static'
    
    // In a real implementation, you would upload the file to Agora's conversion service
    const taskUuid = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate file upload and conversion
    // In a real implementation, you would use Agora's SDK to start the conversion
    
    res.status(202).json({
      success: true,
      data: {
        taskUuid,
        status: 'processing',
        progress: 0,
        type,
        originalName: originalname,
        mimeType: mimetype,
        fileSize: buffer.length,
        createdAt: new Date().toISOString()
      },
      message: 'Document conversion started'
    });
    
  } catch (error) {
    console.error('Error processing document conversion:', error);
    next(error);
  }
});

// Get conversion status
router.get('/convert/status/:taskUuid', authenticate, async (req, res, next) => {
  try {
    const { taskUuid } = req.params;
    
    // In a real implementation, you would check the conversion status
    // from Agora's API or your database
    
    // Simulate checking conversion status
    // For demo purposes, we'll return a random status
    const statuses = ['processing', 'completed', 'failed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const response = {
      taskUuid,
      status,
      progress: status === 'completed' ? 100 : Math.floor(Math.random() * 100),
      updatedAt: new Date().toISOString()
    };
    
    if (status === 'completed') {
      response.url = `https://your-cdn.example.com/converted/${taskUuid}/index.html`;
      response.pages = Math.floor(Math.random() * 10) + 1;
    } else if (status === 'failed') {
      response.error = 'Conversion failed due to an unknown error';
    }
    
    res.json({
      success: true,
      data: response,
      message: `Conversion status: ${status}`
    });
    
  } catch (error) {
    console.error('Error getting conversion status:', error);
    next(error);
  }
});

// Error handling middleware
router.use((err, req, res) => {
  console.error('Whiteboard API error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = router;
