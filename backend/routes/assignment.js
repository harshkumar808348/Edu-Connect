import express from 'express';
import auth from '../middleware/auth.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import crypto from 'crypto';
import PDFParser from 'pdf2json';
import docxReader from 'docx-reader';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Images, and Text files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to calculate SHA-256 hash
const calculateHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

// Updated function to extract text from PDF pages
const extractPDFPages = async (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const pages = pdfData.Pages.map((page, index) => {
          const text = page.Texts.map(text => 
            decodeURIComponent(text.R[0].T)
          ).join(' ');
          
          return {
            pageNumber: index + 1,
            content: text.trim()
          };
        });

        resolve(pages.filter(page => page.content.length > 0));
      } catch (error) {
        console.error('PDF parsing error:', error);
        // Return single page with available content if parsing fails
        resolve([{
          pageNumber: 1,
          content: buffer.toString('utf-8')
        }]);
      }
    });

    pdfParser.on("pdfParser_dataError", (error) => {
      console.error('PDF parsing error:', error);
      // Return single page with available content if parsing fails
      resolve([{
        pageNumber: 1,
        content: buffer.toString('utf-8')
      }]);
    });

    pdfParser.parseBuffer(buffer);
  });
};

// Function to extract text from DOCX
const extractDOCXContent = async (buffer) => {
  const content = await docxReader.readContent(buffer);
  // Split content into pages (assuming page breaks or sections)
  const pages = content.split('\f'); // Form feed character as page separator
  return pages.map((text, index) => ({
    pageNumber: index + 1,
    content: text
  }));
};

// Function to check for similar submissions
const checkPlagiarism = async (newSubmission, assignmentId) => {
  const existingSubmissions = await Submission.find({
    assignment: assignmentId,
    _id: { $ne: newSubmission._id }
  });

  const similarSubmissions = [];

  for (const existing of existingSubmissions) {
    const matchedPages = [];
    let matchCount = 0;

    // Compare hashes for each attachment and page
    for (const newAttachment of newSubmission.attachments) {
      for (const existingAttachment of existing.attachments) {
        // Compare overall content hash
        if (newAttachment.contentHash === existingAttachment.contentHash) {
          matchCount++;
        }

        // Compare page hashes
        for (const newPageHash of newAttachment.pageHashes) {
          for (const existingPageHash of existingAttachment.pageHashes) {
            if (newPageHash.hash === existingPageHash.hash) {
              matchedPages.push({
                sourcePageNumber: newPageHash.pageNumber,
                targetPageNumber: existingPageHash.pageNumber,
                hash: newPageHash.hash
              });
            }
          }
        }
      }
    }

    if (matchedPages.length > 0) {
      const matchPercentage = (matchedPages.length / newSubmission.attachments.reduce(
        (total, att) => total + att.pageHashes.length, 0
      )) * 100;

      similarSubmissions.push({
        submission: existing._id,
        matchPercentage,
        matchedPages
      });
    }
  }

  return similarSubmissions;
};

// Function to check for duplicate submissions
const checkDuplicateSubmission = async (assignmentId, pageHashes, contentHash) => {
  const existingSubmissions = await Submission.find({
    assignment: assignmentId,
    'attachments.contentHash': contentHash
  }).populate('student', 'name');

  if (existingSubmissions.length > 0) {
    return {
      isDuplicate: true,
      originalSubmission: existingSubmissions[0]
    };
  }

  // Check for page-level duplicates
  const pageHashSubmissions = await Submission.find({
    assignment: assignmentId,
    'attachments.pageHashes.hash': { 
      $in: pageHashes.map(ph => ph.hash) 
    }
  }).populate('student', 'name');

  if (pageHashSubmissions.length > 0) {
    const duplicatePages = [];
    pageHashSubmissions.forEach(submission => {
      submission.attachments.forEach(attachment => {
        attachment.pageHashes.forEach(ph => {
          if (pageHashes.some(newPh => newPh.hash === ph.hash)) {
            duplicatePages.push({
              pageNumber: ph.pageNumber,
              studentName: submission.student.name
            });
          }
        });
      });
    });

    if (duplicatePages.length > 0) {
      return {
        isDuplicate: true,
        partialMatch: true,
        duplicatePages,
        matchPercentage: (duplicatePages.length / pageHashes.length) * 100
      };
    }
  }

  return { isDuplicate: false };
};

// Create assignment (Teacher only)
router.post('/create', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, dueDate, classroomId } = req.body;
    const attachments = [];

    // Upload files to Cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const base64Data = file.buffer.toString('base64');
          const dataUri = `data:${file.mimetype};base64,${base64Data}`;
          const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'auto',
            folder: 'assignments'
          });
          attachments.push({
            url: result.secure_url,
            filename: file.originalname
          });
        } catch (uploadError) {
          return res.status(400).json({ 
            message: 'Error uploading file: ' + uploadError.message 
          });
        }
      }
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate: new Date(dueDate),
      classroom: classroomId,
      attachments
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

// Get classroom assignments
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      classroom: req.params.classroomId
    })
    .sort({ createdAt: -1 })
    .populate('classroom', 'name');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment route
router.post('/submit/:assignmentId', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (req.user.type !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { comment } = req.body;
    const attachments = [];
    let hasDuplicates = false;
    let duplicateInfo = null;

    // Process each uploaded file
    for (const file of req.files) {
      if (file.mimetype === 'application/pdf') {
        console.log('Processing PDF file:', file.originalname);
        
        // Extract text and generate hashes
        const pageContents = await extractPDFPages(file.buffer);
        const pageHashes = pageContents.map(page => ({
          pageNumber: page.pageNumber,
          hash: calculateHash(page.content)
        }));
        const fullContent = pageContents.map(p => p.content).join('');
        const contentHash = calculateHash(fullContent);

        // Check for duplicates
        const duplicateCheck = await checkDuplicateSubmission(
          req.params.assignmentId,
          pageHashes,
          contentHash
        );

        if (duplicateCheck.isDuplicate) {
          if (duplicateCheck.partialMatch) {
            return res.status(400).json({
              message: 'Partial plagiarism detected',
              details: {
                matchPercentage: duplicateCheck.matchPercentage,
                duplicatePages: duplicateCheck.duplicatePages
              }
            });
          } else {
            return res.status(400).json({
              message: 'Duplicate assignment detected',
              details: {
                originalSubmission: {
                  studentName: duplicateCheck.originalSubmission.student.name,
                  submissionDate: duplicateCheck.originalSubmission.createdAt
                }
              }
            });
          }
        }

        // If no duplicates, proceed with upload
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            resource_type: 'auto',
            folder: 'submissions'
          }
        );

        attachments.push({
          url: result.secure_url,
          filename: file.originalname,
          pageHashes: pageHashes,
          contentHash: contentHash
        });

      } else {
        // Handle non-PDF files
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            resource_type: 'auto',
            folder: 'submissions'
          }
        );

        attachments.push({
          url: result.secure_url,
          filename: file.originalname
        });
      }
    }

    // Create submission only if no duplicates found
    const submission = new Submission({
      assignment: req.params.assignmentId,
      student: req.user.id,
      comment,
      attachments
    });

    await submission.save();

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: {
        id: submission._id,
        attachments: attachments.map(att => ({
          filename: att.filename,
          url: att.url,
          pageHashes: att.pageHashes,
          contentHash: att.contentHash
        }))
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      message: 'Error submitting assignment',
      error: error.message 
    });
  }
});

// Get assignment submissions (Teacher only)
router.get('/submissions/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Submission.find({
      assignment: req.params.assignmentId
    })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 