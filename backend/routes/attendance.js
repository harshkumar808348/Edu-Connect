import express from 'express';
import Attendance from '../models/Attendance.js';
import Classroom from '../models/Classroom.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Take attendance
router.post('/take', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { classroomId, date, records } = req.body;

    if (!classroomId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ 
        message: 'Invalid request data. Please provide classroomId, date, and records array' 
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      classroom: classroomId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance already taken for this date' 
      });
    }

    // Validate classroom exists and teacher has access
    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: req.user.id
    });

    if (!classroom) {
      return res.status(404).json({ 
        message: 'Classroom not found or you do not have access' 
      });
    }

    const attendance = new Attendance({
      classroom: classroomId,
      date: new Date(date),
      records: records.map(record => ({
        student: record.student,
        status: record.status
      })),
      teacher: req.user.id
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ 
      message: 'Server error while recording attendance',
      error: error.message 
    });
  }
});

// Get attendance for a classroom
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ classroom: req.params.classroomId })
      .populate('records.student', 'name email')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for a specific date
router.get('/classroom/:classroomId/date/:date', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      classroom: req.params.classroomId,
      date: new Date(req.params.date)
    }).populate('records.student', 'name email');
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 