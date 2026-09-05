const mongoose = require('mongoose');

const workspaceConfigSchema = new mongoose.Schema(
  {
    workspaceName: {
      type: String,
      required: true,
      trim: true,
      default: 'Main Office',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        default: 0,
      },
      longitude: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    radiusMeters: {
      type: Number,
      required: true,
      default: 100, // 100 meters default geofence radius
      min: 10,
      max: 50000,
    },
    geofenceEnabled: {
      type: Boolean,
      default: true,
    },
    workStartTime: {
      type: String,
      default: '09:30', // HH:MM in 24hr format
    },
    workEndTime: {
      type: String,
      default: '18:30', // HH:MM in 24hr format
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15, // 15 mins grace before marked 'Late'
    },
    minHoursFullDay: {
      type: Number,
      default: 8,
    },
    minHoursHalfDay: {
      type: Number,
      default: 4,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkspaceConfig', workspaceConfigSchema);
