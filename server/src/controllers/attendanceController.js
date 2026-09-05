const Attendance = require('../models/Attendance');
const WorkspaceConfig = require('../models/WorkspaceConfig');
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const { calculateDistanceInMeters, formatDistance } = require('../utils/geoUtils');

// Helper to get formatted YYYY-MM-DD string for a date in Indian Standard Time (Asia/Kolkata)
const getTodayDateString = (dateObj = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateObj));
  } catch (e) {
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
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
    const { latitude, longitude, accuracy, deviceInfo, address } = req.body;
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

    const allowedRadius = config.radiusMeters || 100;
    const accuracyNum = Number(accuracy) || 0;

    // Within zone if direct distance <= allowedRadius,
    // OR if distance is covered within the device's accuracy uncertainty margin
    const isWithin =
      distance <= allowedRadius ||
      (accuracyNum > 0 && distance <= allowedRadius + accuracyNum);

    // Strict check if geofence is enabled
    if (config.geofenceEnabled && !isWithin) {
      return res.status(400).json({
        success: false,
        message: `You are outside the workspace zone (${formatDistance(distance)} away). Allowed radius is ${formatDistance(allowedRadius)}. Please be within the workspace to mark attendance.`,
        data: {
          distanceMeters: distance,
          radiusMeters: allowedRadius,
          accuracy: accuracyNum,
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

// @desc    Get Today's Attendance State for logged-in user (including holiday check)
// @route   GET /api/attendance/today
// @access  Private (Developer & Admin)
exports.getMyAttendanceToday = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const developerId = req.user._id;

    const [attendance, config, holiday] = await Promise.all([
      Attendance.findOne({ developer: developerId, date: today }),
      getOrCreateWorkspaceConfig(),
      Holiday.findOne({ date: today }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        attendance: attendance || null,
        holiday: holiday || null,
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
    let holidayQuery = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
      holidayQuery.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const monthPadded = String(month).padStart(2, '0');
      const prefix = `${year}-${monthPadded}`;
      query.date = { $regex: `^${prefix}` };
      holidayQuery.date = { $regex: `^${prefix}` };
    }

    const [records, holidays] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }),
      Holiday.find(holidayQuery).sort({ date: 1 }),
    ]);

    const totalPresent = records.filter((r) => r.status === 'Present').length;

    res.status(200).json({
      success: true,
      data: {
        records,
        holidays,
        stats: {
          totalDays: records.length,
          totalPresent,
          totalHolidays: holidays.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Developer Monthly Calendar View (Developer's personal attendance calendar)
// @route   GET /api/attendance/my-calendar
// @access  Private (Developer & Admin)
exports.getDeveloperMonthlyCalendar = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const developerId = req.user._id;

    const monthPadded = String(month).padStart(2, '0');
    const prefix = `${year}-${monthPadded}`;

    const [myRecords, holidays] = await Promise.all([
      Attendance.find({ developer: developerId, date: { $regex: `^${prefix}` } }),
      Holiday.find({ date: { $regex: `^${prefix}` } }).sort({ date: 1 }),
    ]);

    const holidayMap = new Map();
    holidays.forEach((h) => holidayMap.set(h.date, h));

    const attendanceMap = new Map();
    myRecords.forEach((att) => attendanceMap.set(att.date, att));

    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarDays = [];

    let totalPresentDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0 = Sun

      const holiday = holidayMap.get(dateStr) || null;
      const record = attendanceMap.get(dateStr) || null;
      const isPresent = Boolean(record && record.status === 'Present' && record.punchIn?.time);

      if (isPresent) totalPresentDays++;

      calendarDays.push({
        date: dateStr,
        dayNumber: d,
        dayOfWeek,
        isSunday: dayOfWeek === 0,
        isHoliday: Boolean(holiday),
        holiday,
        isMarked: isPresent,
        status: isPresent ? 'Present' : (record ? record.status : 'Absent'),
        punchIn: record ? record.punchIn : null,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        year,
        month,
        totalPresentDays,
        daysInMonth,
        calendarDays,
        holidays,
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

    const [developers, config, holiday] = await Promise.all([
      User.find({ role: 'developer' }).select('_id name email createdAt').sort({ name: 1 }),
      getOrCreateWorkspaceConfig(),
      Holiday.findOne({ date: targetDate }),
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
        holiday: holiday || null,
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

// @desc    Admin Monthly Calendar View (Grid of Days with attendance counts & holidays)
// @route   GET /api/attendance/admin/monthly-calendar
// @access  Private (Admin only)
exports.getAdminMonthlyCalendar = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;

    const monthPadded = String(month).padStart(2, '0');
    const prefix = `${year}-${monthPadded}`;

    const [developers, holidays, attendanceRecords] = await Promise.all([
      User.find({ role: 'developer' }).select('_id name email'),
      Holiday.find({ date: { $regex: `^${prefix}` } }).sort({ date: 1 }),
      Attendance.find({ date: { $regex: `^${prefix}` } }).populate('developer', '_id name email'),
    ]);

    const totalDevelopers = developers.length;

    // Create maps for quick lookup
    const holidayMap = new Map();
    holidays.forEach((h) => holidayMap.set(h.date, h));

    const attendanceByDateMap = new Map();
    attendanceRecords.forEach((att) => {
      if (!attendanceByDateMap.has(att.date)) {
        attendanceByDateMap.set(att.date, []);
      }
      attendanceByDateMap.get(att.date).push(att);
    });

    // Compute number of days in this month
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarDays = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0 = Sun, 6 = Sat

      const holiday = holidayMap.get(dateStr) || null;
      const dayRecords = attendanceByDateMap.get(dateStr) || [];

      const presentRecords = dayRecords.filter((r) => r.status !== 'Absent' && r.punchIn?.time);
      const presentCount = presentRecords.length;
      const absentCount = Math.max(0, totalDevelopers - presentCount);
      const presentRate = totalDevelopers > 0 ? Math.round((presentCount / totalDevelopers) * 100) : 0;

      calendarDays.push({
        date: dateStr,
        dayNumber: d,
        dayOfWeek,
        isSunday: dayOfWeek === 0,
        isHoliday: Boolean(holiday),
        holiday: holiday,
        totalDevelopers,
        presentCount,
        absentCount,
        presentRate,
        attendees: presentRecords.map((r) => ({
          _id: r._id,
          developerId: r.developer?._id ? r.developer._id.toString() : null,
          developerName: r.developer?.name,
          developerEmail: r.developer?.email,
          status: r.status,
          punchInTime: r.punchIn?.time,
          punchOutTime: r.punchOut?.time,
          distanceMeters: r.punchIn?.distanceMeters,
          deviceInfo: r.punchIn?.deviceInfo,
          address: r.punchIn?.address,
          totalWorkingMinutes: r.totalWorkingMinutes,
          isManualOverride: r.isManualOverride,
          adminNotes: r.adminNotes,
        })),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        year,
        month,
        totalDevelopers,
        developers: developers.map((d) => ({
          _id: d._id,
          name: d.name,
          email: d.email,
        })),
        calendarDays,
        holidays,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Holidays
// @route   GET /api/attendance/holidays
// @access  Private (Admin & Developer)
exports.getHolidays = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let query = {};
    if (year && month) {
      const monthPadded = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthPadded}` };
    } else if (year) {
      query.date = { $regex: `^${year}` };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.status(200).json({
      success: true,
      data: holidays,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or Update a Holiday
// @route   POST /api/attendance/holidays
// @access  Private (Admin only)
exports.createOrUpdateHoliday = async (req, res, next) => {
  try {
    const { date, title, description } = req.body;

    if (!date || !title) {
      return res.status(400).json({
        success: false,
        message: 'Date and Title are required to declare a holiday.',
      });
    }

    let holiday = await Holiday.findOne({ date });
    if (holiday) {
      holiday.title = title.trim();
      holiday.description = description ? description.trim() : '';
      holiday.createdBy = req.user._id;
      await holiday.save();
    } else {
      holiday = await Holiday.create({
        date,
        title: title.trim(),
        description: description ? description.trim() : '',
        createdBy: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Holiday "${title}" declared for ${date}`,
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Holiday
// @route   DELETE /api/attendance/holidays/:id
// @access  Private (Admin only)
exports.deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }

    await holiday.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Holiday removed successfully',
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

// @desc    Clear All Attendance Records from Database
// @route   DELETE /api/attendance/admin/clear-all
// @access  Private (Admin only)
exports.clearAllAttendance = async (req, res, next) => {
  try {
    const result = await Attendance.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} attendance records from database.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

