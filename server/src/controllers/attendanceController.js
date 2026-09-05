const Attendance = require('../models/Attendance');
const WorkspaceConfig = require('../models/WorkspaceConfig');
const User = require('../models/User');
const { calculateDistanceInMeters, formatDistance } = require('../utils/geoUtils');

// Helper to get formatted YYYY-MM-DD string for a date in local timezone
const getTodayDateString = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to ensure at least one WorkspaceConfig exists
const getOrCreateWorkspaceConfig = async () => {
  let config = await WorkspaceConfig.findOne();
  if (!config) {
    config = await WorkspaceConfig.create({
      workspaceName: 'Main Development Center',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
      radiusMeters: 100,
      address: 'Main Tech Park',
      geofenceEnabled: true,
    });
  }
  return config;
};

// @desc    Get Workspace Geofence Settings
// @route   GET /api/attendance/config
// @access  Private (Admin & Developer)
exports.getWorkspaceConfig = async (req, res, next) => {
  try {
    const config = await getOrCreateWorkspaceConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Workspace Geofence Settings
// @route   PUT /api/attendance/config
// @access  Private (Admin only)
exports.updateWorkspaceConfig = async (req, res, next) => {
  try {
    const {
      workspaceName,
      address,
      latitude,
      longitude,
      radiusMeters,
      geofenceEnabled,
    } = req.body;

    let config = await WorkspaceConfig.findOne();
    if (!config) {
      config = new WorkspaceConfig();
    }

    if (workspaceName !== undefined) config.workspaceName = workspaceName;
    if (address !== undefined) config.address = address;
    if (latitude !== undefined && longitude !== undefined) {
      config.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }
    if (radiusMeters !== undefined) config.radiusMeters = Number(radiusMeters);
    if (geofenceEnabled !== undefined) config.geofenceEnabled = Boolean(geofenceEnabled);

    config.updatedBy = req.user._id;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Workspace geofence settings saved',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Developer Mark Attendance with GPS Geofence verification
// @route   POST /api/attendance/punch-in
// @access  Private (Developer & Admin)
exports.punchIn = async (req, res, next) => {
  try {
    const { latitude, longitude, deviceInfo, address } = req.body;
    const developerId = req.user._id;
    const today = getTodayDateString();

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'GPS location is required to mark attendance. Please enable location services.',
      });
    }

    const config = await getOrCreateWorkspaceConfig();
    const officeLat = config.location.latitude;
    const officeLng = config.location.longitude;

    const distance = calculateDistanceInMeters(
      Number(latitude),
      Number(longitude),
      officeLat,
      officeLng
    );

    const isWithin = distance <= config.radiusMeters;

    // Strict check if geofence is enabled
    if (config.geofenceEnabled && !isWithin) {
      return res.status(400).json({
        success: false,
        message: `You are outside the workspace zone (${formatDistance(distance)} away). Allowed radius is ${formatDistance(config.radiusMeters)}. Please be within the workspace to mark attendance.`,
        data: {
          distanceMeters: distance,
          radiusMeters: config.radiusMeters,
          isWithinGeofence: false,
        },
      });
    }

    // Check if already marked attendance today
    let attendance = await Attendance.findOne({ developer: developerId, date: today });
    if (attendance && attendance.punchIn && attendance.punchIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked attendance for today.',
        data: attendance,
      });
    }

    const now = new Date();

    if (!attendance) {
      attendance = new Attendance({
        developer: developerId,
        date: today,
      });
    }

    attendance.punchIn = {
      time: now,
      latitude: Number(latitude),
      longitude: Number(longitude),
      distanceMeters: distance,
      isWithinGeofence: isWithin,
      deviceInfo: deviceInfo || '',
      address: address || '',
    };
    attendance.status = 'Present';

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Optional Punch Out (kept for backward compat)
// @route   POST /api/attendance/punch-out
// @access  Private (Developer & Admin)
exports.punchOut = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const attendance = await Attendance.findOne({ developer: req.user._id, date: today });
    res.status(200).json({
      success: true,
      message: 'Attendance recorded',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Today's Attendance State for logged-in user
// @route   GET /api/attendance/today
// @access  Private (Developer & Admin)
exports.getMyAttendanceToday = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const developerId = req.user._id;

    const [attendance, config] = await Promise.all([
      Attendance.findOne({ developer: developerId, date: today }),
      getOrCreateWorkspaceConfig(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        attendance: attendance || null,
        workspace: {
          name: config.workspaceName,
          address: config.address,
          location: config.location,
          radiusMeters: config.radiusMeters,
          geofenceEnabled: config.geofenceEnabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Developer Attendance History
// @route   GET /api/attendance/my-history
// @access  Private (Developer)
exports.getMyAttendanceHistory = async (req, res, next) => {
  try {
    const developerId = req.user._id;
    const { month, year, startDate, endDate } = req.query;

    let query = { developer: developerId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const monthPadded = String(month).padStart(2, '0');
      const prefix = `${year}-${monthPadded}`;
      query.date = { $regex: `^${prefix}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    const totalPresent = records.filter((r) => r.status === 'Present').length;

    res.status(200).json({
      success: true,
      data: {
        records,
        stats: {
          totalDays: records.length,
          totalPresent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Real-time Admin Attendance Overview (All Developers Today + Filters)
// @route   GET /api/attendance/admin/overview
// @access  Private (Admin only)
exports.getAdminAttendanceOverview = async (req, res, next) => {
  try {
    const { date, developerId, status } = req.query;
    const targetDate = date || getTodayDateString();

    const [developers, config] = await Promise.all([
      User.find({ role: 'developer' }).select('_id name email createdAt').sort({ name: 1 }),
      getOrCreateWorkspaceConfig(),
    ]);

    let attendanceQuery = { date: targetDate };
    if (developerId) attendanceQuery.developer = developerId;
    if (status && status !== 'All') attendanceQuery.status = status;

    const attendanceRecords = await Attendance.find(attendanceQuery).populate(
      'developer',
      '_id name email'
    );

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      if (att.developer) {
        attendanceMap.set(att.developer._id.toString(), att);
      }
    });

    // Build complete roster for target date
    const roster = developers.map((dev) => {
      const att = attendanceMap.get(dev._id.toString());
      if (att && att.punchIn && att.punchIn.time) {
        return {
          developer: {
            _id: dev._id,
            name: dev.name,
            email: dev.email,
          },
          attendanceId: att._id,
          date: att.date,
          status: 'Present',
          punchIn: att.punchIn,
          adminNotes: att.adminNotes,
          isManualOverride: att.isManualOverride,
          hasPunchedIn: true,
        };
      }

      return {
        developer: {
          _id: dev._id,
          name: dev.name,
          email: dev.email,
        },
        attendanceId: att?._id || null,
        date: targetDate,
        status: att?.status === 'Present' ? 'Present' : 'Absent',
        punchIn: att?.punchIn || null,
        adminNotes: att?.adminNotes || '',
        isManualOverride: att?.isManualOverride || false,
        hasPunchedIn: false,
      };
    });

    // Summary counts
    const totalDevelopers = developers.length;
    const presentCount = roster.filter((r) => r.status === 'Present').length;
    const absentCount = totalDevelopers - presentCount;

    res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        workspace: config,
        summary: {
          totalDevelopers,
          presentCount,
          absentCount,
          presentRate: totalDevelopers > 0 ? Math.round((presentCount / totalDevelopers) * 100) : 0,
        },
        roster,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Manual Attendance Override / Edit
// @route   POST /api/attendance/admin/manual
// @access  Private (Admin only)
exports.adminManualAttendanceUpdate = async (req, res, next) => {
  try {
    const { developerId, date, status, punchInTime, adminNotes } = req.body;

    if (!developerId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Developer ID and Date are required.',
      });
    }

    let attendance = await Attendance.findOne({ developer: developerId, date });
    if (!attendance) {
      attendance = new Attendance({
        developer: developerId,
        date,
      });
    }

    attendance.status = status || 'Present';
    if (adminNotes !== undefined) attendance.adminNotes = adminNotes;
    attendance.isManualOverride = true;

    if (status === 'Present') {
      const now = punchInTime ? new Date(punchInTime) : new Date();
      attendance.punchIn = {
        ...(attendance.punchIn || {}),
        time: now,
        isWithinGeofence: true,
      };
    } else {
      attendance.punchIn = undefined;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record updated by Admin',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
