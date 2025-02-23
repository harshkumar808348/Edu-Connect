import express from 'express';
import { auth } from '../middleware/auth.js';
import Classroom from '../models/Classroom.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

const router = express.Router();

// Create classroom (Teacher only)
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create classrooms' });
    }

    const { name, subject } = req.body;
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classroom = new Classroom({
      name,
      subject,
      teacher: teacher._id
    });

    await classroom.save();
    
    // Add classroom to teacher's classrooms
    teacher.classrooms.push(classroom._id);
    await teacher.save();

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join classroom (Student only)
router.post('/join', auth, async (req, res) => {
  try {
    if (req.user.type !== 'student') {
      return res.status(403).json({ message: 'Only students can join classrooms' });
    }

    const { code } = req.body;
    const classroom = await Classroom.findOne({ code });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is already in the classroom
    if (classroom.students.includes(student._id)) {
      return res.status(400).json({ message: 'Already joined this classroom' });
    }

    // Add student to classroom
    classroom.students.push(student._id);
    await classroom.save();

    // Add classroom to student's joinedClassrooms
    student.joinedClassrooms.push(classroom._id);
    await student.save();

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's classrooms
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const classrooms = await Classroom.find({ teacher: req.user.id })
      .populate('students', 'name email');

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's joined classrooms
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.type !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = await Student.findById(req.user.id)
      .populate({
        path: 'joinedClassrooms',
        populate: {
          path: 'teacher',
          select: 'name email'
        }
      });

    res.json(student.joinedClassrooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 