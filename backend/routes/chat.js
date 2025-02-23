import express from 'express';
import { auth } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Classroom from '../models/Classroom.js';
import User from '../models/User.js';

const router = express.Router();

// Get classroom chat history
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    console.log('Fetching chat for classroom:', req.params.classroomId);
    console.log('User:', req.user);

    const chat = await Chat.findOne({ 
      classroom: req.params.classroomId,
      type: 'classroom'
    })
    .populate({
      path: 'messages.sender',
      model: 'User',
      select: 'name type'
    })
    .populate({
      path: 'participants',
      model: 'User',
      select: 'name type'
    });

    if (!chat) {
      console.log('Creating new chat room');
      // Create new chat room if it doesn't exist
      const classroom = await Classroom.findById(req.params.classroomId)
        .populate('teacher')
        .populate('students');
      
      if (!classroom) {
        console.log('Classroom not found:', req.params.classroomId);
        return res.status(404).json({ message: 'Classroom not found' });
      }

      const newChat = new Chat({
        classroom: req.params.classroomId,
        participants: [classroom.teacher, ...classroom.students],
        type: 'classroom',
        messages: []
      });

      await newChat.save();
      console.log('New chat room created:', newChat._id);
      return res.json(newChat);
    }

    console.log('Found existing chat:', chat._id);
    res.json(chat);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get private chat history
router.get('/private/:userId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      type: 'private',
      participants: { 
        $all: [req.user.id, req.params.userId]
      }
    })
    .populate('messages.sender', 'name type')
    .populate('participants', 'name type');

    if (!chat) {
      const newChat = new Chat({
        participants: [req.user.id, req.params.userId],
        type: 'private'
      });
      await newChat.save();
      return res.json(newChat);
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save chat messages
router.post('/save', auth, async (req, res) => {
  try {
    const { chatId, messages } = req.body;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push(...messages);
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 