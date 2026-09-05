const Attendance = require('../models/Attendance');
const WorkspaceConfig = require('../models/WorkspaceConfig');
const User = require('../models/User');
const { calculateDistanceInMeters, formatDistance } = require('../utils/geoUtils');

// Helper to get formatted YYYY-MM-DD string for a date in IST/Local
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
        latitude: 28.6139, // Default sample coords (can be updated by admin via GPS)
        longitude: 77.2090,
      },
      radiusMeters: 100,
      address: 'Main Tech Park, Tech Zone',
      geofenceEnabled: true,
      workStartTime: '09:30',
      workEndTime: '18:30',
      gracePeriodMinutes: 15,
      minHoursFullDay: 8,
      minHoursHalfDay: 4,
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
      workStartTime,
      workEndTime,
      gracePeriodMinutes,
      minHoursFullDay,
      minHoursHalfDay,
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
    if (workStartTime !== undefined) config.workStartTime = workStartTime;
    if (workEndTime !== undefined) config.workEndTime = workEndTime;
    if (gracePeriodMinutes !== undefined) config.gracePeriodMinutes = Number(gracePeriodMinutes);
    if (minHoursFullDay !== undefined) config.minHoursFullDay = Number(minHoursFullDay);
    if (minHoursHalfDay !== undefined) config.minHoursHalfDay = Number(minHoursHalfDay);

    config.updatedBy = req.user._id;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Workspace geofence settings updated successfully',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Developer Punch In with GPS verification
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
        message: 'GPS location is required to punch in. Please enable location services.',
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
        message: `You are outside the workspace zone (${formatDistance(distance)} away). Allowed radius is ${formatDistance(config.radiusMeters)}. Please be within the workspace to punch in.`,
        data: {
          distanceMeters: distance,
          radiusMeters: config.radiusMeters,
          isWithinGeofence: false,
        },
      });
    }

    // Check if already punched in today
    let attendance = await Attendance.findOne({ developer: developerId, date: today });
    if (attendance && attendance.punchIn && attendance.punchIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already punched in for today.',
        data: attendance,
      });
    }

    const now = new Date();

    // Determine status (Present vs Late)
    let status = 'Present';
    if (config.workStartTime) {
      const [startHour, startMin] = config.workStartTime.split(':').map(Number);
      const shiftStartTime = new Date(now);
      shiftStartTime.setHours(startHour, startMin + (config.gracePeriodMinutes || 0), 0, 0);

      if (now > shiftStartTime) {
        status = 'Late';
      }
    }

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
    attendance.status = status;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punch In successful! Status: ${status} (${formatDistance(distance)} from office)`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Developer Punch Out with optional work summary
// @route   POST /api/attendance/punch-out
// @access  Private (Developer & Admin)
exports.punchOut = async (req, res, next) => {
  try {
    const { latitude, longitude, workSummary } = req.body;
    const developerId = req.user._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ developer: developerId, date: today });
    if (!attendance || !attendance.punchIn || !attendance.punchIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You must punch in first before punching out.',
      });
    }

    if (attendance.punchOut && attendance.punchOut.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already punched out for today.',
        data: attendance,
      });
    }

    const config = await getOrCreateWorkspaceConfig();
    let distance = 0;
    let isWithin = true;

    if (latitude !== undefined && longitude !== undefined) {
      distance = calculateDistanceInMeters(
        Number(latitude),
        Number(longitude),
        config.location.latitude,
        config.location.longitude
      );
      isWithin = distance <= config.radiusMeters;
    }

    const now = new Date();
    const punchInTime = new Date(attendance.punchIn.time);
    const diffMs = now.getTime() - punchInTime.getTime();
    const totalMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));

    attendance.punchOut = {
      time: now,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      distanceMeters: distance,
      isWithinGeofence: isWithin,
      workSummary: workSummary || '',
    };
    attendance.totalWorkingMinutes = totalMinutes;

    // Check if working hours indicate Half Day
    const totalHours = totalMinutes / 60;
    if (totalHours < (config.minHoursHalfDay || 4) && attendance.status !== 'Late') {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punch Out recorded! Total work time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
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
          workStartTime: config.workStartTime,
          workEndTime: config.workEndTime,
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

    // Aggregate statistics
    const totalPresent = records.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
    const totalLate = records.filter((r) => r.status === 'Late').length;
    const totalHalfDay = records.filter((r) => r.status === 'Half Day').length;
    const totalMinutes = records.reduce((acc, r) => acc + (r.totalWorkingMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    res.status(200).json({
      success: true,
      data: {
        records,
        stats: {
          totalDays: records.length,
          totalPresent,
          totalLate,
          totalHalfDay,
          totalMinutes,
          totalHours,
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
      if (att) {
        return {
          developer: {
            _id: dev._id,
            name: dev.name,
            email: dev.email,
          },
          attendanceId: att._id,
          date: att.date,
          status: att.status,
          punchIn: att.punchIn,
          punchOut: att.punchOut,
          totalWorkingMinutes: att.totalWorkingMinutes,
          adminNotes: att.adminNotes,
          isManualOverride: att.isManualOverride,
          hasPunchedIn: Boolean(att.punchIn && att.punchIn.time),
          hasPunchedOut: Boolean(att.punchOut && att.punchOut.time),
        };
      }

      return {
        developer: {
          _id: dev._id,
          name: dev.name,
          email: dev.email,
        },
        attendanceId: null,
        date: targetDate,
        status: 'Absent',
        punchIn: null,
        punchOut: null,
        totalWorkingMinutes: 0,
        adminNotes: '',
        isManualOverride: false,
        hasPunchedIn: false,
        hasPunchedOut: false,
      };
    });

    // Summary counts
    const totalDevelopers = developers.length;
    const presentCount = roster.filter((r) => r.status === 'Present').length;
    const lateCount = roster.filter((r) => r.status === 'Late').length;
    const halfDayCount = roster.filter((r) => r.status === 'Half Day').length;
    const absentCount = roster.filter((r) => r.status === 'Absent').length;
    const punchedInActive = roster.filter((r) => r.hasPunchedIn && !r.hasPunchedOut).length;

    res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        workspace: config,
        summary: {
          totalDevelopers,
          presentCount,
          lateCount,
          halfDayCount,
          absentCount,
          punchedInActive,
          presentRate: totalDevelopers > 0 ? Math.round(((presentCount + lateCount + halfDayCount) / totalDevelopers) * 100) : 0,
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
    const { developerId, date, status, punchInTime, punchOutTime, adminNotes } = req.body;

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

    if (status) attendance.status = status;
    if (adminNotes !== undefined) attendance.adminNotes = adminNotes;
    attendance.isManualOverride = true;

    if (punchInTime) {
      attendance.punchIn = {
        ...(attendance.punchIn || {}),
        time: new Date(punchInTime),
        isWithinGeofence: true,
      };
    }

    if (punchOutTime) {
      attendance.punchOut = {
        ...(attendance.punchOut || {}),
        time: new Date(punchOutTime),
        isWithinGeofence: true,
      };

      if (attendance.punchIn && attendance.punchIn.time) {
        const diffMs = new Date(punchOutTime).getTime() - new Date(attendance.punchIn.time).getTime();
        attendance.totalWorkingMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
      }
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record manually updated by Admin',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
