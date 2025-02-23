import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import classroomRoutes from './routes/classroom.js';
import assignmentRoutes from './routes/assignment.js';
import chatRoutes from './routes/chat.js';
import { Server } from 'socket.io';
import Chat from './models/Chat.js';
import User from './models/User.js';
import './models/Classroom.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/chat', chatRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Add Socket.IO middleware for authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      socket.user = decoded;
      next();
    });
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

let messageQueue = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User:', socket.user);

  socket.on('join-chat', async (chatId) => {
    try {
      // Verify user has access to this chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const hasAccess = chat.participants.some(p => 
        p.toString() === socket.user.id
      );

      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      console.log(`Socket ${socket.id} joining chat:`, chatId);
      socket.join(chatId);
      socket.emit('joined-chat', { chatId });
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('send-message', async (data) => {
    try {
      console.log('Received message data:', data);
      const { chatId, message, sender } = data;

      if (!chatId || !message || !sender) {
        console.error('Invalid message data:', data);
        return;
      }

      // Verify sender is the authenticated user
      if (sender._id !== socket.user.id) {
        socket.emit('error', { message: 'Unauthorized sender' });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const newMessage = {
        sender: socket.user.id,
        content: message,
        timestamp: new Date()
      };

      chat.messages.push(newMessage);
      await chat.save();
      
      // Broadcast message to all users in the chat
      const populatedMessage = {
        ...newMessage,
        sender: {
          _id: socket.user.id,
          name: socket.user.name,
          type: socket.user.type
        }
      };

      io.to(chatId).emit('receive-message', populatedMessage);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Save messages to database every 30 seconds
setInterval(async () => {
  for (const chatId in messageQueue) {
    if (messageQueue[chatId].length > 0) {
      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.messages.push(...messageQueue[chatId]);
          await chat.save();
          messageQueue[chatId] = [];
        }
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }
}, 30000);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Server error:', error);
});
