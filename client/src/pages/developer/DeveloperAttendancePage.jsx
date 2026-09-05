import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  getCurrentGPSLocation,
  calculateDistanceInMeters,
  formatDistance,
  formatWorkingMinutes,
} from '../../utils/geoUtils';
import Modal from '../../components/common/Modal';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
  Compass,
  History,
  TrendingUp,
  LogIn,
  LogOut,
  FileText,
  RefreshCw,
  Info,
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

  // Punch Action States
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [isPunchingOut, setIsPunchingOut] = useState(false);
  const [isPunchOutModalOpen, setIsPunchOutModalOpen] = useState(false);
  const [workSummary, setWorkSummary] = useState('');

  // History State
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'history'
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Elapsed Timer Ref
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  // Compute live elapsed work timer if punched in & not punched out
  useEffect(() => {
    if (attendance?.punchIn?.time && !attendance?.punchOut?.time) {
      const punchInDate = new Date(attendance.punchIn.time);
      const updateElapsed = () => {
        const diffSecs = Math.max(0, Math.floor((new Date().getTime() - punchInDate.getTime()) / 1000));
        setElapsedSeconds(diffSecs);
      };
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else if (attendance?.totalWorkingMinutes) {
      setElapsedSeconds(attendance.totalWorkingMinutes * 60);
    }
  }, [attendance]);

  // Fetch History when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setAttendance(res.data.data.attendance);
        setWorkspace(res.data.data.workspace);

        // Once workspace is loaded, acquire GPS position
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
        setIsInsideGeofence(dist <= (ws.radiusMeters || 100));
      }
    } catch (err) {
      setGpsError(err.message || 'Unable to retrieve GPS coordinates.');
    } finally {
      setGpsLoading(false);
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

  const handlePunchIn = async () => {
    // If we don't have fresh coordinates, try to get them first
    let loc = currentCoords;
    if (!loc) {
      try {
        setGpsLoading(true);
        loc = await getCurrentGPSLocation();
        setCurrentCoords(loc);
      } catch (err) {
        error(err.message || 'Location permission required to punch in.');
        setGpsLoading(false);
        return;
      } finally {
        setGpsLoading(false);
      }
    }

    setIsPunchingIn(true);
    try {
      const res = await api.post('/attendance/punch-in', {
        latitude: loc.latitude,
        longitude: loc.longitude,
        deviceInfo: navigator.userAgent || 'Web Browser',
      });
      if (res.data.success) {
        success(res.data.message || 'Punch In Successful!');
        setAttendance(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Punch In failed. Please verify your location.');
    } finally {
      setIsPunchingIn(false);
    }
  };

  const handlePunchOutSubmit = async (e) => {
    e.preventDefault();
    let loc = currentCoords;
    if (!loc) {
      try {
        loc = await getCurrentGPSLocation();
        setCurrentCoords(loc);
      } catch (err) {
        // Continue with punchout even if optional GPS fails
      }
    }

    setIsPunchingOut(true);
    try {
      const res = await api.post('/attendance/punch-out', {
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        workSummary: workSummary.trim(),
      });
      if (res.data.success) {
        success(res.data.message || 'Punch Out Successful!');
        setAttendance(res.data.data);
        setIsPunchOutModalOpen(false);
        setWorkSummary('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Punch Out failed.');
    } finally {
      setIsPunchingOut(false);
    }
  };

  // Helper formatting for live timer
  const formatTimerDigits = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isPunchedIn = Boolean(attendance?.punchIn?.time);
  const isPunchedOut = Boolean(attendance?.punchOut?.time);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-soft-xs">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Developer Attendance
              </h1>
              <p className="text-[11px] text-slate-500">
                GPS Geo-fenced Workspace Check-in & Time Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span>Punch Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Punch In/Out Terminal Card (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-soft-md bg-gradient-to-b from-white to-slate-50/50 flex flex-col items-center text-center relative overflow-hidden">
              {/* Background ambient blur */}
              <div
                className={`absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-30 pointer-events-none transition-all ${
                  isPunchedOut
                    ? 'bg-blue-400'
                    : isPunchedIn
                    ? 'bg-emerald-400'
                    : isInsideGeofence
                    ? 'bg-brand-400'
                    : 'bg-amber-400'
                }`}
              />

              {/* Live Time Display */}
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
                {isPunchedOut ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Shift Completed Today ({formatWorkingMinutes(attendance.totalWorkingMinutes)})
                  </span>
                ) : isPunchedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Punched In • Shift in Progress ({attendance.status})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    Not Punched In Yet Today
                  </span>
                )}
              </div>

              {/* Live Elapsed Shift Timer if in progress */}
              {isPunchedIn && !isPunchedOut && (
                <div className="my-3 p-3 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 w-full max-w-sm text-center shadow-soft-xs">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800">
                    Live Active Work Timer
                  </p>
                  <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 mt-0.5">
                    {formatTimerDigits(elapsedSeconds)}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Punched in at {new Date(attendance.punchIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {/* GPS Live Geofence Radar Box */}
              <div className="w-full max-w-md my-4 p-3.5 rounded-2xl border transition-all text-left bg-white/90 shadow-soft-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Live Geofence Radar
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
                          : 'bg-amber-50/90 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isInsideGeofence ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold">
                            {isInsideGeofence
                              ? 'Inside Workspace Geofence'
                              : 'Outside Allowed Workspace Zone'}
                          </p>
                          <p className="text-[11px] opacity-80">
                            {formatDistance(distanceToOffice)} away from{' '}
                            <span className="font-semibold">{workspace?.name || 'Office'}</span> (Max: {formatDistance(workspace?.radiusMeters || 100)})
                          </p>
                        </div>
                      </div>
                    </div>

                    {currentCoords && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                        <span>Accuracy: ±{Math.round(currentCoords.accuracy || 0)}m</span>
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

              {/* Big Action Buttons */}
              <div className="w-full max-w-md pt-2">
                {!isPunchedIn ? (
                  <button
                    onClick={handlePunchIn}
                    disabled={isPunchingIn || gpsLoading || (workspace?.geofenceEnabled && !isInsideGeofence)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-soft-lg shadow-emerald-500/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isPunchingIn ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying & Checking In...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Punch In to Office</span>
                      </>
                    )}
                  </button>
                ) : !isPunchedOut ? (
                  <button
                    onClick={() => setIsPunchOutModalOpen(true)}
                    disabled={isPunchingOut}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base shadow-soft-lg shadow-rose-500/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Punch Out & End Shift</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold text-center border border-slate-200">
                    🎉 You have completed your work shift for today!
                  </div>
                )}

                {workspace?.geofenceEnabled && !isPunchedIn && !isInsideGeofence && (
                  <p className="text-[11px] text-amber-700 mt-2 flex items-center justify-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    You must be within {formatDistance(workspace?.radiusMeters || 100)} of the workspace to punch in.
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
                  Assigned Workspace
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Workspace Name</p>
                  <p className="font-bold text-slate-800 mt-0.5">{workspace?.name || 'Main Office'}</p>
                </div>

                {workspace?.address && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Address</p>
                    <p className="text-slate-600 text-xs mt-0.5">{workspace.address}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Allowed Radius</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      {formatDistance(workspace?.radiusMeters || 100)}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Shift Start</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      {workspace?.workStartTime || '09:30 AM'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/70 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>GPS Geofence active & verified</span>
                </div>
              </div>
            </div>

            {/* Today's Punch Card Details */}
            {attendance && (
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 bg-white shadow-soft-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileText className="h-4 w-4 text-brand-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Today's Punch Details
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  {attendance.punchIn?.time && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                          <LogIn className="h-3 w-3" /> Punch In
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {new Date(attendance.punchIn.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Distance: {formatDistance(attendance.punchIn.distanceMeters)} from office
                      </p>
                    </div>
                  )}

                  {attendance.punchOut?.time && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                          <LogOut className="h-3 w-3" /> Punch Out
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {new Date(attendance.punchOut.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {attendance.punchOut.workSummary && (
                        <p className="text-[10px] text-slate-600 italic mt-1 line-clamp-2">
                          "{attendance.punchOut.workSummary}"
                        </p>
                      )}
                    </div>
                  )}

                  {attendance.totalWorkingMinutes > 0 && (
                    <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-900">Total Work Time</span>
                      <span className="text-xs font-mono font-extrabold text-brand-700">
                        {formatWorkingMinutes(attendance.totalWorkingMinutes)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History & Logs Tab */
        <div className="space-y-4">
          {/* History Controls & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Days Logged</p>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                {historyStats?.totalDays || 0}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-emerald-600">Present Days</p>
              <p className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
                {historyStats?.totalPresent || 0}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-amber-600">Late Days</p>
              <p className="text-xl font-extrabold text-amber-600 font-mono mt-0.5">
                {historyStats?.totalLate || 0}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
              <p className="text-[10px] font-bold uppercase text-brand-600">Total Hours Worked</p>
              <p className="text-xl font-extrabold text-brand-600 font-mono mt-0.5">
                {historyStats?.totalHours || 0}h
              </p>
            </div>
          </div>

          {/* Month/Year Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft-xs">
            <h3 className="text-xs font-bold text-slate-800">Monthly Attendance History</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-brand-500"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
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

          {/* History Records Table / Cards */}
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
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Punch In</th>
                      <th className="py-3 px-4">Punch Out</th>
                      <th className="py-3 px-4">Work Duration</th>
                      <th className="py-3 px-4">Geofence Distance</th>
                      <th className="py-3 px-4">Work Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'Late'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : rec.status === 'Half Day'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {rec.punchIn?.time
                            ? new Date(rec.punchIn.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {rec.punchOut?.time
                            ? new Date(rec.punchOut.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {formatWorkingMinutes(rec.totalWorkingMinutes)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {rec.punchIn?.distanceMeters !== undefined
                            ? formatDistance(rec.punchIn.distanceMeters)
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={rec.punchOut?.workSummary || ''}>
                          {rec.punchOut?.workSummary || '-'}
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

      {/* Punch Out Work Summary Modal */}
      <Modal
        isOpen={isPunchOutModalOpen}
        onClose={() => setIsPunchOutModalOpen(false)}
        title="Complete Today's Shift"
        subtitle="Provide a brief summary of tasks delivered today before punching out."
        maxWidth="md"
      >
        <form onSubmit={handlePunchOutSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Working Time:</span>
              <span className="font-mono font-extrabold text-emerald-700 text-sm">
                {formatTimerDigits(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Work Summary / Deliverables (Optional)
            </label>
            <textarea
              rows={3}
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="e.g. Finished Phase 4 Authentication API & resolved responsive layout bugs..."
              className="block w-full rounded-xl border border-slate-300/80 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPunchOutModalOpen(false)}
              className="rounded-xl border border-slate-300/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPunchingOut}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-soft-md shadow-rose-500/25 hover:from-rose-500 hover:to-pink-500 transition-all disabled:opacity-50"
            >
              {isPunchingOut ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording Punch Out...
                </>
              ) : (
                'Confirm Punch Out'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeveloperAttendancePage;
