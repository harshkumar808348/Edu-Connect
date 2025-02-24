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
const allowedOrigins = [
  'https://edu-connect-zy9f.vercel.app',
  'https://edu-connect-gamma.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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
// Add this before your routes
app.options('*', cors()); // Enable pre-flight for all routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/chat', chatRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
  socket.on('join-chat', async (chatId) => {
    try {
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

      socket.join(chatId);
      socket.emit('joined-chat', { chatId });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error joining chat:', error);
      }
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('send-message', async (data) => {
    try {
      const { chatId, message, sender } = data;

      if (!chatId || !message || !sender) {
        return;
      }

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error handling message:', error);
      }
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('error', (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Socket error:', error);
    }
  });

  socket.on('disconnect', () => {
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
