import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    default: () => Math.floor(10000 + Math.random() * 90000).toString() // 5 digit code
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  subject: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Classroom', classroomSchema); 