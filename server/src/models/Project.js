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
    enum: ['Web App', 'Android App', 'General Website', 'Backend API', 'Other'],
    default: 'Web App',
  },
  techStack: [
    {
      type: String,
      trim: true,
    },
  ],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
