const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    punchIn: {
      time: {
        type: Date,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      distanceMeters: {
        type: Number,
      },
      isWithinGeofence: {
        type: Boolean,
        default: true,
      },
      deviceInfo: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
    },
    punchOut: {
      time: {
        type: Date,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      distanceMeters: {
        type: Number,
      },
      isWithinGeofence: {
        type: Boolean,
        default: true,
      },
      workSummary: {
        type: String,
        default: '',
      },
    },
    totalWorkingMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Out of Zone', 'Absent'],
      default: 'Present',
    },
    isManualOverride: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a developer has 1 record per calendar day
attendanceSchema.index({ developer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
