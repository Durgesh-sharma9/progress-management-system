const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a phase title'],
      trim: true,
      maxlength: [150, 'Phase title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Phase must belong to a project'],
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Phase must belong to a developer'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query by project, developer & order
PhaseSchema.index({ projectId: 1, developerId: 1, order: 1 });
PhaseSchema.index({ projectId: 1, order: 1 });

module.exports = mongoose.model('Phase', PhaseSchema);
