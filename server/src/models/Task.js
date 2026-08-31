const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  phaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true,
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
