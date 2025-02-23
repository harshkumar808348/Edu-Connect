import mongoose from 'mongoose';

const pageHashSchema = new mongoose.Schema({
  pageNumber: Number,
  hash: String
});

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  attachments: [{
    url: String,
    filename: String,
    pageHashes: [pageHashSchema], // Array of hashes for each page
    contentHash: String // Overall content hash
  }],
  similarSubmissions: [{
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    matchPercentage: Number,
    matchedPages: [{
      sourcePageNumber: Number,
      targetPageNumber: Number,
      hash: String
    }]
  }],
  comment: String,
  grade: Number,
  isPlagiarized: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema); 