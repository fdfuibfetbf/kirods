const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users and their sessions
const connectedUsers = new Map();
const userSessions = new Map();
const typingUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining a chat session
  socket.on('join-session', async (data) => {
    const { sessionId, userId, userName, userEmail, isAdmin } = data;
    
    try {
      // Store user info
      connectedUsers.set(socket.id, {
        userId,
        userName,
        userEmail,
        sessionId,
        isAdmin,
        lastSeen: Date.now()
      });

      // Join the session room
      socket.join(sessionId);
      
      // Store session mapping
      if (!userSessions.has(sessionId)) {
        userSessions.set(sessionId, new Set());
      }
      userSessions.get(sessionId).add(socket.id);

      // Notify others in the session about user joining
      socket.to(sessionId).emit('user-joined', {
        userId,
        userName,
        isAdmin,
        timestamp: Date.now()
      });

      // Send current online users in this session
      const sessionUsers = Array.from(userSessions.get(sessionId) || [])
        .map(socketId => connectedUsers.get(socketId))
        .filter(user => user);

      socket.emit('session-users', sessionUsers);

      console.log(`${userName} joined session ${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    const { sessionId, message, sender } = data;
    const user = connectedUsers.get(socket.id);

    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      // Save message to database
      const { data: savedMessage, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          message,
          sender,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      // Broadcast message to all users in the session
      io.to(sessionId).emit('receive-message', {
        ...savedMessage,
        userName: user.userName,
        timestamp: Date.now()
      });

      // Stop typing indicator for this user
      const typingKey = `${sessionId}-${user.userId}`;
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        socket.to(sessionId).emit('user-stopped-typing', {
          userId: user.userId,
          userName: user.userName
        });
      }

      console.log(`Message sent in session ${sessionId} by ${user.userName}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('start-typing', (data) => {
    const { sessionId } = data;
    const user = connectedUsers.get(socket.id);

    if (!user) return;

    const typingKey = `${sessionId}-${user.userId}`;
    typingUsers.set(typingKey, {
      userId: user.userId,
      userName: user.userName,
      sessionId,
      timestamp: Date.now()
    });

    // Broadcast typing indicator to others in the session
    socket.to(sessionId).emit('user-typing', {
      userId: user.userId,
      userName: user.userName,
      timestamp: Date.now()
    });

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        socket.to(sessionId).emit('user-stopped-typing', {
          userId: user.userId,
          userName: user.userName
        });
      }
    }, 3000);
  });

  socket.on('stop-typing', (data) => {
    const { sessionId } = data;
    const user = connectedUsers.get(socket.id);

    if (!user) return;

    const typingKey = `${sessionId}-${user.userId}`;
    if (typingUsers.has(typingKey)) {
      typingUsers.delete(typingKey);
      socket.to(sessionId).emit('user-stopped-typing', {
        userId: user.userId,
        userName: user.userName
      });
    }
  });

  // Handle marking messages as read
  socket.on('mark-messages-read', async (data) => {
    const { sessionId, messageIds } = data;
    const user = connectedUsers.get(socket.id);

    if (!user || !messageIds.length) return;

    try {
      // Update messages as read in database
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;

      // Notify others about read status
      socket.to(sessionId).emit('messages-read', {
        messageIds,
        readBy: user.userId,
        readByName: user.userName,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle session status updates
  socket.on('update-session-status', async (data) => {
    const { sessionId, status } = data;
    const user = connectedUsers.get(socket.id);

    if (!user || !user.isAdmin) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Broadcast status update to all users in session
      io.to(sessionId).emit('session-status-updated', {
        sessionId,
        status,
        updatedBy: user.userName,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error updating session status:', error);
      socket.emit('error', { message: 'Failed to update session status' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      const { sessionId, userId, userName } = user;
      
      // Remove from session
      if (userSessions.has(sessionId)) {
        userSessions.get(sessionId).delete(socket.id);
        if (userSessions.get(sessionId).size === 0) {
          userSessions.delete(sessionId);
        }
      }

      // Remove typing indicator
      const typingKey = `${sessionId}-${userId}`;
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        socket.to(sessionId).emit('user-stopped-typing', {
          userId,
          userName
        });
      }

      // Notify others about user leaving
      socket.to(sessionId).emit('user-left', {
        userId,
        userName,
        timestamp: Date.now()
      });

      console.log(`${userName} disconnected from session ${sessionId}`);
    }

    connectedUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Clean up old typing indicators periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, typing] of typingUsers.entries()) {
    if (now - typing.timestamp > 5000) { // 5 seconds timeout
      typingUsers.delete(key);
      io.to(typing.sessionId).emit('user-stopped-typing', {
        userId: typing.userId,
        userName: typing.userName
      });
    }
  }
}, 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: connectedUsers.size,
    activeSessions: userSessions.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});