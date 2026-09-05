import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import {
  getCurrentGPSLocation,
  calculateDistanceInMeters,
  formatDistance,
} from '../../utils/geoUtils';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Calendar as CalendarIcon,
  ShieldCheck,
  Building2,
  Compass,
  History,
  LogIn,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  XCircle,
} from 'lucide-react';

const DeveloperAttendancePage = () => {
  const { success, error } = useToast();

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Workspace & Today's Attendance
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [workspace, setWorkspace] = useState(null);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [distanceToOffice, setDistanceToOffice] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);

  // Marking Attendance State
  const [isMarking, setIsMarking] = useState(false);

  // Tabs State: 'terminal' | 'calendar' | 'history'
  const [activeTab, setActiveTab] = useState('terminal');

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);

  const generateFallbackCalendarDays = (year, month, todayAtt = null) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPadded = String(month).padStart(2, '0');
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    let totalPresent = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();

      const isToday = dateStr === todayStr;
      const isMarked = Boolean(isToday && todayAtt?.punchIn?.time);
      if (isMarked) totalPresent++;

      days.push({
        date: dateStr,
        dayNumber: d,
        dayOfWeek,
        isSunday: dayOfWeek === 0,
        isHoliday: false,
        holiday: null,
        isMarked,
        status: isMarked ? 'Present' : (isToday ? 'Pending' : 'Absent'),
        punchIn: isMarked ? todayAtt.punchIn : null,
      });
    }

    return {
      year,
      month,
      totalPresentDays: totalPresent,
      daysInMonth,
      calendarDays: days,
      holidays: [],
    };
  };

  const [calendarData, setCalendarData] = useState(() =>
    generateFallbackCalendarDays(new Date().getFullYear(), new Date().getMonth() + 1)
  );

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    fetchTodayData();
  }, []);

  // Fetch Tab Specific Data
  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchMyCalendar();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, calendarMonth, calendarYear, selectedMonth, selectedYear]);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setAttendance(res.data.data.attendance);
        setWorkspace(res.data.data.workspace);

        if (res.data.data.workspace?.location) {
          acquireLiveLocation(res.data.data.workspace);
        }
      }
    } catch (err) {
      error('Failed to load attendance info');
    } finally {
      setLoading(false);
    }
  };

  const acquireLiveLocation = async (ws = workspace) => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentGPSLocation();
      setCurrentCoords(coords);

      if (ws?.location) {
        const dist = calculateDistanceInMeters(
          coords.latitude,
          coords.longitude,
          ws.location.latitude,
          ws.location.longitude
        );
        setDistanceToOffice(dist);
        const allowedRadius = ws.radiusMeters || 100;
        const accuracy = coords.accuracy || 0;
        // Inside geofence if direct distance is within radius OR within device accuracy margin
        const isWithin = dist <= allowedRadius || (accuracy > 0 && dist <= allowedRadius + accuracy);
        setIsInsideGeofence(isWithin);
      }
    } catch (err) {
      setGpsError(err.message || 'Unable to retrieve GPS coordinates.');
    } finally {
      setGpsLoading(false);
    }
  };

  const fetchMyCalendar = async () => {
    try {
      setCalendarLoading(true);
      const res = await api.get(
        `/attendance/my-calendar?year=${calendarYear}&month=${calendarMonth}`
      );
      if (res.data.success && res.data.data) {
        setCalendarData(res.data.data);
      }
    } catch (err) {
      console.warn('My calendar API warming up, using fallback with today attendance:', err);
      setCalendarData(generateFallbackCalendarDays(calendarYear, calendarMonth, attendance));
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get(
        `/attendance/my-history?month=${selectedMonth}&year=${selectedYear}`
      );
      if (res.data.success) {
        setHistoryRecords(res.data.data.records);
        setHistoryStats(res.data.data.stats);
      }
    } catch (err) {
      error('Failed to load attendance history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    let loc = currentCoords;
    if (!loc) {
      try {
        setGpsLoading(true);
        loc = await getCurrentGPSLocation();
        setCurrentCoords(loc);
      } catch (err) {
        error(err.message || 'Location permission required to mark attendance.');
        setGpsLoading(false);
        return;
      } finally {
        setGpsLoading(false);
      }
    }

    setIsMarking(true);
    try {
      const res = await api.post('/attendance/punch-in', {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        deviceInfo: navigator.userAgent || 'Web Browser',
      });
      if (res.data.success) {
        success('Attendance marked successfully!');
        setAttendance(res.data.data);
        if (activeTab === 'calendar') fetchMyCalendar();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Attendance marking failed. Please verify your location.');
    } finally {
      setIsMarking(false);
    }
  };

  const isMarkedToday = Boolean(attendance?.punchIn?.time);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const firstDayOfMonthWeekday = new Date(calendarYear, calendarMonth - 1, 1).getDay();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-soft-xs shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Developer Attendance
            </h1>
            <p className="text-[11px] text-slate-500">
              GPS Geo-fenced Workspace Daily Check-in & Personal Calendar
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl shrink-0 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-brand-600" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
            <span>My Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5 text-brand-600" />
            <span>My Logs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHECK-IN RADAR */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Attendance Check-in Card (2 Cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-4 sm:p-7 border border-slate-200/90 shadow-soft-md bg-gradient-to-b from-white to-slate-50/50 flex flex-col items-center text-center relative overflow-hidden">
              {/* Background ambient blur */}
              <div
                className={`absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-30 pointer-events-none transition-all ${
                  isMarkedToday
                    ? 'bg-emerald-400'
                    : isInsideGeofence
                    ? 'bg-brand-400'
                    : 'bg-amber-400'
                }`}
              />

              {/* Date & Time */}
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-brand-600" />
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="my-3">
                {isMarkedToday ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Attendance Marked at{' '}
                    {new Date(attendance.punchIn.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Attendance Not Marked Yet
                  </span>
                )}
              </div>

              {/* GPS Live Geofence Radar Box */}
              <div className="w-full max-w-md my-4 p-3.5 rounded-2xl border transition-all text-left bg-white/90 shadow-soft-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Live Location Radar
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => acquireLiveLocation()}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50 p-1"
                    title="Refresh GPS Position"
                  >
                    <RefreshCw className={`h-3 w-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh GPS</span>
                  </button>
                </div>

                {gpsLoading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                    <span>Detecting your live GPS coordinates...</span>
                  </div>
                ) : gpsError ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">GPS Error</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">{gpsError}</p>
                    </div>
                  </div>
                ) : distanceToOffice !== null ? (
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isInsideGeofence
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                          : workspace?.geofenceEnabled === false
                          ? 'bg-blue-50/90 border-blue-200 text-blue-900'
                          : 'bg-amber-50/90 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isInsideGeofence ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : workspace?.geofenceEnabled === false ? (
                          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold">
                            {isInsideGeofence
                              ? 'Inside Workspace Geofence'
                              : workspace?.geofenceEnabled === false
                              ? 'Geofence Optional (Marking Allowed)'
                              : 'Outside Allowed Workspace Zone'}
                          </p>
                          <p className="text-[11px] opacity-80">
                            {formatDistance(distanceToOffice)} away from{' '}
                            <span className="font-semibold">{workspace?.workspaceName || workspace?.name || 'Office'}</span> (Allowed: {formatDistance(workspace?.radiusMeters || 100)})
                          </p>
                        </div>
                      </div>
                    </div>

                    {currentCoords && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          {currentCoords.accuracy < 100
                            ? `GPS Verified (±${Math.round(currentCoords.accuracy)}m)`
                            : `Device Location Verified`}
                        </span>
                        <span>
                          {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">GPS location not captured yet</p>
                )}
              </div>

              {/* Main Action Button */}
              <div className="w-full max-w-md pt-2">
                {!isMarkedToday ? (
                  <button
                    onClick={handleMarkAttendance}
                    disabled={isMarking || gpsLoading || (workspace?.geofenceEnabled !== false && !isInsideGeofence)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-soft-lg shadow-emerald-500/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isMarking ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying & Marking Attendance...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Mark Today's Attendance</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Attendance Marked at{' '}
                      {new Date(attendance.punchIn.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {workspace?.geofenceEnabled !== false && !isMarkedToday && !isInsideGeofence && (
                  <p className="text-[11px] text-amber-700 mt-2 flex items-center justify-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    You must be within {formatDistance(workspace?.radiusMeters || 100)} of the workspace to mark attendance.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Info Cards (1 Col) */}
          <div className="space-y-4">
            {/* Workspace Geofence Info Card */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 bg-white shadow-soft-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="h-4 w-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Workspace Details
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Center Name:</span>
                  <span className="font-bold text-slate-800">
                    {workspace?.workspaceName || 'Main Office'}
                  </span>
                </div>

                {workspace?.address && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">
                      {workspace.address}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Allowed Radius:</span>
                  <span className="font-mono font-bold text-brand-600">
                    {formatDistance(workspace?.radiusMeters || 100)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Geofencing:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      workspace?.geofenceEnabled !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {workspace?.geofenceEnabled !== false ? 'Enforced' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Card */}
            {isMarkedToday && (
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-200/90 bg-emerald-50/50 shadow-soft-xs">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Today's Verified Check-in
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span>Check-in Timestamp:</span>
                    <span className="font-mono font-bold">
                      {new Date(attendance.punchIn.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {attendance.punchIn.distanceMeters !== undefined && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-800">
                      <span>Office Distance:</span>
                      <span className="font-mono">
                        {formatDistance(attendance.punchIn.distanceMeters)} away
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER PERSONAL MONTHLY CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Month Switcher & Quick Stats */}
          <div className="glass-card rounded-2xl p-4 bg-white border border-slate-200/90 shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-sans tracking-tight min-w-[180px] text-center">
                {monthNames[calendarMonth - 1]} {calendarYear}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Present: {calendarData?.totalPresentDays || 0} Days</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                <PartyPopper className="h-3.5 w-3.5 text-purple-600" />
                <span>Holidays: {calendarData?.holidays?.length || 0}</span>
              </span>
              <button
                type="button"
                onClick={fetchMyCalendar}
                disabled={calendarLoading}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                title="Refresh Calendar"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${calendarLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          {calendarLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              <p className="text-xs text-slate-400">Loading your attendance calendar...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[580px] sm:min-w-0">
                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-[11px] font-extrabold text-slate-600 py-2.5">
                    <span className="text-rose-600">Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span className="text-indigo-600">Sat</span>
                  </div>

                  {/* Day Cells */}
                  <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                    {/* Blank Leading Cells */}
                    {Array.from({ length: firstDayOfMonthWeekday }).map((_, idx) => (
                      <div key={`blank-${idx}`} className="h-24 sm:h-28 bg-slate-50/30 p-1.5" />
                    ))}

                    {/* Month Days */}
                    {calendarData?.calendarDays?.map((day) => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const isToday = day.date === todayStr;
                      const isFuture = day.date > todayStr;

                      return (
                        <div
                          key={day.date}
                          onClick={
                            isFuture && !day.isHoliday
                              ? undefined
                              : () => {
                                  setSelectedDayDetails(day);
                                  setIsDayDetailsModalOpen(true);
                                }
                          }
                          className={`h-24 sm:h-28 p-1.5 sm:p-2 transition-all flex flex-col justify-between relative group ${
                            isFuture && !day.isHoliday
                              ? 'bg-slate-50/40 opacity-40 cursor-not-allowed select-none'
                              : 'cursor-pointer hover:bg-brand-50/30'
                          } ${
                            day.isHoliday
                              ? 'bg-purple-50/50'
                              : day.isMarked
                              ? 'bg-emerald-50/30'
                              : day.isSunday
                              ? 'bg-rose-50/20'
                              : 'bg-white'
                          } ${isToday ? 'ring-2 ring-brand-500 ring-inset shadow-soft-xs' : ''}`}
                        >
                          {/* Top Bar: Date Number + Holiday / Status Badge */}
                          <div className="flex items-start justify-between">
                            <span
                              className={`font-mono text-xs sm:text-sm font-extrabold h-6 w-6 rounded-lg flex items-center justify-center ${
                                isToday
                                  ? 'bg-brand-600 text-white shadow-2xs'
                                  : day.isSunday
                                  ? 'text-rose-600'
                                  : isFuture
                                  ? 'text-slate-400'
                                  : 'text-slate-800'
                              }`}
                            >
                              {day.dayNumber}
                            </span>

                            {day.isHoliday && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200 truncate max-w-[70px] sm:max-w-[90px]"
                                title={day.holiday?.title}
                              >
                                🎉 {day.holiday?.title}
                              </span>
                            )}
                          </div>

                          {/* Middle: Day Status */}
                          <div className="my-auto">
                            {day.isHoliday ? (
                              <span className="text-[9px] font-bold text-purple-700">
                                Official Holiday
                              </span>
                            ) : isFuture ? (
                              <span className="text-[9px] text-slate-400 italic">
                                {day.isSunday ? 'Weekly Off' : 'Upcoming'}
                              </span>
                            ) : day.isMarked ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                  <span>
                                    {day.punchIn?.time
                                      ? new Date(day.punchIn.time).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : 'Present'}
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">
                                {day.isSunday ? 'Weekly Off' : isToday ? 'Pending Today' : 'Not Marked'}
                              </span>
                            )}
                          </div>

                          {/* Bottom Hint */}
                          <div className="text-right">
                            {(!isFuture || day.isHoliday) && (
                              <span className="text-[9px] text-slate-400 group-hover:text-brand-600 transition-colors">
                                Details →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Controls & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Recorded Logs</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                {historyStats?.totalDays || 0}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-emerald-600">Present Days Marked</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                {historyStats?.totalPresent || 0}
              </p>
            </div>
          </div>

          {/* Month/Year Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft-xs">
            <h3 className="text-xs font-bold text-slate-800">Monthly Attendance History</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-brand-500"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-brand-500"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* History Records Table */}
          {historyLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <p className="text-xs text-slate-400">Loading attendance logs...</p>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/90 p-6">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No attendance records found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No logs recorded for {selectedMonth}/{selectedYear}.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-soft-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Attendance Time</th>
                      <th className="py-3 px-4">Geofence Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-800 font-bold">
                          {rec.punchIn?.time
                            ? new Date(rec.punchIn.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {rec.punchIn?.distanceMeters !== undefined
                            ? `${formatDistance(rec.punchIn.distanceMeters)} from office`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Developer Day Inspection Modal */}
      <Modal
        isOpen={isDayDetailsModalOpen}
        onClose={() => setIsDayDetailsModalOpen(false)}
        title={`Attendance on ${selectedDayDetails?.date || ''}`}
        subtitle={
          selectedDayDetails?.isHoliday
            ? `🎉 Declared Holiday: ${selectedDayDetails.holiday?.title}`
            : selectedDayDetails?.isMarked
            ? '✅ Attendance Marked & Verified'
            : selectedDayDetails?.isSunday
            ? '🌴 Weekly Off (Sunday)'
            : '❌ Attendance Not Marked'
        }
        maxWidth="sm"
      >
        <div className="space-y-3">
          {selectedDayDetails?.isHoliday ? (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <PartyPopper className="h-4 w-4 text-purple-600" />
                <span>Holiday: {selectedDayDetails.holiday?.title}</span>
              </p>
              {selectedDayDetails.holiday?.description && (
                <p className="text-purple-700 mt-1">{selectedDayDetails.holiday.description}</p>
              )}
            </div>
          ) : selectedDayDetails?.isMarked ? (
            <div className="space-y-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Status:</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Present
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Check-in Time:</span>
                <span className="font-mono font-bold text-emerald-900">
                  {selectedDayDetails.punchIn?.time
                    ? new Date(selectedDayDetails.punchIn.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '-'}
                </span>
              </div>
              {selectedDayDetails.punchIn?.distanceMeters !== undefined && (
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/70 text-[11px] text-emerald-800">
                  <span>GPS Office Distance:</span>
                  <span className="font-mono">
                    {formatDistance(selectedDayDetails.punchIn.distanceMeters)} away
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
              <p className="font-semibold">
                {selectedDayDetails?.isSunday
                  ? '🌴 Sunday - Scheduled weekly holiday'
                  : 'No attendance marked for this date.'}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DeveloperAttendancePage;
