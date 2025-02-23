import express from 'express';
import { auth } from '../middleware/auth.js';
import Whiteboard from '../models/Whiteboard.js';

const router = express.Router();

// Create whiteboard session
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { classroomId } = req.body;
    const whiteboard = new Whiteboard({
      classroom: classroomId,
      teacher: req.user.id
    });

    await whiteboard.save();
    res.status(201).json(whiteboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active whiteboard for classroom
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    console.log('Fetching whiteboard for classroom:', req.params.classroomId);
    const whiteboard = await Whiteboard.findOne({
      classroom: req.params.classroomId,
      isActive: true
    });
    console.log('Found whiteboard:', whiteboard);
    res.json(whiteboard);
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get whiteboard data
router.get('/:id', auth, async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    res.json(whiteboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update whiteboard data
router.put('/:id', auth, async (req, res) => {
  try {
    const { drawingData } = req.body;
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    if (req.user.type !== 'teacher' || whiteboard.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    whiteboard.drawingData = drawingData;
    await whiteboard.save();
    
    res.json(whiteboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request permission
router.post('/:id/request-permission', auth, async (req, res) => {
  try {
    if (req.user.type !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if student already has permission
    if (whiteboard.approvedStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Permission already granted' });
    }

    // Add to pending permissions if not already there
    const pendingRequest = whiteboard.pendingPermissions.find(
      p => p.student.toString() === req.user.id
    );
    
    if (!pendingRequest) {
      whiteboard.pendingPermissions.push({
        student: req.user.id,
        status: 'pending'
      });
      await whiteboard.save();
    }

    res.json({ message: 'Permission requested' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject permission (teacher only)
router.put('/:id/permission/:studentId', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body; // 'approved' or 'rejected'
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    const pendingRequest = whiteboard.pendingPermissions.find(
      p => p.student.toString() === req.params.studentId
    );

    if (!pendingRequest) {
      return res.status(404).json({ message: 'Permission request not found' });
    }

    pendingRequest.status = status;

    if (status === 'approved') {
      whiteboard.approvedStudents.push(req.params.studentId);
    }

    await whiteboard.save();
    res.json({ message: `Permission ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending permissions (teacher only)
router.get('/:id/permissions', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const whiteboard = await Whiteboard.findById(req.params.id)
      .populate('pendingPermissions.student', 'name email');
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    res.json(whiteboard.pendingPermissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 