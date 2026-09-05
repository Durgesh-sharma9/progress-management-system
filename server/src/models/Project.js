const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Completed'],
    default: 'Planning',
  },
  projectType: {
    type: String,
    enum: ['Standalone', 'Group'],
    default: 'Standalone',
  },
  category: {
    type: String,
    enum: [
      'Web App',
      'Android App',
      'General Website',
      'Backend API',
      'Mobile App',
      'AI / ML',
      'E-Commerce',
      'Full Stack',
      'Desktop App',
      'Other',
    ],
    default: 'Web App',
  },
  techStack: [
    {
      type: String,
      trim: true,
    },
  ],
  adminRemarks: {
    type: String,
    trim: true,
    default: '',
  },
  developers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
