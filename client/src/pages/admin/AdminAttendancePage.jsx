import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  getCurrentGPSLocation,
  formatDistance,
  formatWorkingMinutes,
} from '../../utils/geoUtils';
import Modal from '../../components/common/Modal';
import {
  Users,
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
  Sliders,
  Filter,
  Search,
  Check,
  Edit2,
  UserCheck,
  UserX,
  FileSpreadsheet,
  RefreshCw,
  Info,
  Navigation,
} from 'lucide-react';

const AdminAttendancePage = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history' | 'settings'

  // Live Today Overview State
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [developerFilter, setDeveloperFilter] = useState('All');

  // Workspace Geofence Settings State
  const [configLoading, setConfigLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [configForm, setConfigForm] = useState({
    workspaceName: 'Main Development Center',
    address: '',
    latitude: 28.6139,
    longitude: 77.2090,
    radiusMeters: 100,
    geofenceEnabled: true,
    workStartTime: '09:30',
    workEndTime: '18:30',
    gracePeriodMinutes: 15,
    minHoursFullDay: 8,
    minHoursHalfDay: 4,
  });

  // Manual Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideItem, setOverrideItem] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('Present');
  const [overridePunchInTime, setOverridePunchInTime] = useState('');
  const [overridePunchOutTime, setOverridePunchOutTime] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchConfig();
  }, [selectedDate]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/admin/overview?date=${selectedDate}`);
      if (res.data.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err) {
      error('Failed to load attendance overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      const res = await api.get('/attendance/config');
      if (res.data.success && res.data.data) {
        const c = res.data.data;
        setConfigForm({
          workspaceName: c.workspaceName || 'Main Office',
          address: c.address || '',
          latitude: c.location?.latitude ?? 28.6139,
          longitude: c.location?.longitude ?? 77.2090,
          radiusMeters: c.radiusMeters || 100,
          geofenceEnabled: c.geofenceEnabled !== false,
          workStartTime: c.workStartTime || '09:30',
          workEndTime: c.workEndTime || '18:30',
          gracePeriodMinutes: c.gracePeriodMinutes || 15,
          minHoursFullDay: c.minHoursFullDay || 8,
          minHoursHalfDay: c.minHoursHalfDay || 4,
        });
      }
    } catch (err) {
      console.error('Failed to fetch workspace config:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCaptureCurrentGPS = async () => {
    setIsDetectingGps(true);
    try {
      const loc = await getCurrentGPSLocation();
      setConfigForm((prev) => ({
        ...prev,
        latitude: Number(loc.latitude.toFixed(6)),
        longitude: Number(loc.longitude.toFixed(6)),
      }));
      success(`📍 Coordinates captured! Accuracy: ±${Math.round(loc.accuracy || 0)}m`);
    } catch (err) {
      error(err.message || 'Failed to detect GPS location');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await api.put('/attendance/config', configForm);
      if (res.data.success) {
        success('Workspace Geofence settings saved successfully');
        fetchOverview();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const openOverrideModal = (item) => {
    setOverrideItem(item);
    setOverrideStatus(item.status || 'Present');
    setOverridePunchInTime(
      item.punchIn?.time
        ? new Date(item.punchIn.time).toTimeString().slice(0, 5)
        : '09:30'
    );
    setOverridePunchOutTime(
      item.punchOut?.time
        ? new Date(item.punchOut.time).toTimeString().slice(0, 5)
        : ''
    );
    setOverrideNotes(item.adminNotes || '');
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!overrideItem) return;

    setIsSubmittingOverride(true);
    try {
      const dateStr = overrideItem.date || selectedDate;
      let inDateTime = null;
      let outDateTime = null;

      if (overridePunchInTime) {
        inDateTime = new Date(`${dateStr}T${overridePunchInTime}:00`);
      }
      if (overridePunchOutTime) {
        outDateTime = new Date(`${dateStr}T${overridePunchOutTime}:00`);
      }

      const res = await api.post('/attendance/admin/manual', {
        developerId: overrideItem.developer._id,
        date: dateStr,
        status: overrideStatus,
        punchInTime: inDateTime,
        punchOutTime: outDateTime,
        adminNotes: overrideNotes,
      });

      if (res.data.success) {
        success('Attendance updated manually');
        setIsOverrideModalOpen(false);
        fetchOverview();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update record');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Filter roster
  const filteredRoster = (attendanceData?.roster || []).filter((item) => {
    const matchesSearch =
      item.developer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.developer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    const matchesDev =
      developerFilter === 'All' || item.developer._id === developerFilter;

    return matchesSearch && matchesStatus && matchesDev;
  });

  const radiusPresets = [50, 100, 200, 500, 1000];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-soft-xs shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Attendance & Geofence Console
            </h1>
            <p className="text-xs text-slate-500">
              Live GPS Developer Roster & Workspace Geofence Settings
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>Today's Live Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-brand-600" />
            <span>Attendance Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-purple-600" />
            <span>Workspace Geofence</span>
          </button>
        </div>
      </div>

      {activeTab === 'live' || activeTab === 'history' ? (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          {attendanceData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Engineers</p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {attendanceData.summary.totalDevelopers}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-emerald-600">Present (On Time)</p>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                  {attendanceData.summary.presentCount}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-amber-600">Late Arrivals</p>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono mt-0.5">
                  {attendanceData.summary.lateCount}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-rose-600">Absent / Not Punched</p>
                <p className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono mt-0.5">
                  {attendanceData.summary.absentCount}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase text-brand-600">Attendance Rate</p>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-700 font-mono mt-0.5">
                  {attendanceData.summary.presentRate}%
                </p>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 bg-white border border-slate-200/90 shadow-soft-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engineer name or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Date Picker (for history tab or custom date) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>

              <button
                type="button"
                onClick={fetchOverview}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Roster Cards / Table */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <p className="text-xs text-slate-400">Loading live attendance roster...</p>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No attendance records match your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredRoster.map((item) => {
                const isPresent = item.status === 'Present';
                const isLate = item.status === 'Late';
                const isAbsent = item.status === 'Absent';
                const isHalfDay = item.status === 'Half Day';

                return (
                  <div
                    key={item.developer._id}
                    className="glass-card rounded-2xl p-4 bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between hover:shadow-soft-md transition-all group"
                  >
                    <div>
                      {/* Developer Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl text-white flex items-center justify-center text-xs font-bold shadow-soft-xs shrink-0 ${
                              isPresent
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                                : isLate
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                                : isHalfDay
                                ? 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                                : 'bg-gradient-to-tr from-slate-400 to-slate-500'
                            }`}
                          >
                            {item.developer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {item.developer.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.developer.email}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLate
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : isHalfDay
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPresent && <CheckCircle2 className="h-3 w-3" />}
                          {isLate && <Clock className="h-3 w-3" />}
                          {isAbsent && <UserX className="h-3 w-3" />}
                          {item.status}
                        </span>
                      </div>

                      {/* Punch Details Box */}
                      <div className="space-y-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Punch In:
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.punchIn?.time
                              ? new Date(item.punchIn.time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Not Logged'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Punch Out:
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.punchOut?.time
                              ? new Date(item.punchOut.time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : item.hasPunchedIn
                              ? 'Active Working...'
                              : 'Not Logged'}
                          </span>
                        </div>

                        {item.totalWorkingMinutes > 0 && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                            <span className="text-[10px] font-bold text-brand-700 uppercase">
                              Work Duration:
                            </span>
                            <span className="font-mono font-extrabold text-brand-700">
                              {formatWorkingMinutes(item.totalWorkingMinutes)}
                            </span>
                          </div>
                        )}

                        {/* GPS Distance indicator */}
                        {item.punchIn?.distanceMeters !== undefined && (
                          <div className="pt-1 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <Compass className="h-3 w-3 text-brand-600" /> Geofence:
                            </span>
                            <span className="font-mono font-semibold text-slate-700">
                              {formatDistance(item.punchIn.distanceMeters)} from office
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Work Summary / Notes if present */}
                      {item.punchOut?.workSummary && (
                        <div className="mb-2 p-2 rounded-lg bg-blue-50/70 border border-blue-200/70 text-[10px] text-blue-900">
                          <p className="font-bold text-[9px] uppercase tracking-wider text-blue-700 mb-0.5">
                            Work Summary
                          </p>
                          <p className="line-clamp-2 italic">"{item.punchOut.workSummary}"</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Manual Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {item.isManualOverride ? '⚠️ Adjusted by Admin' : 'GPS Verified'}
                      </span>
                      <button
                        onClick={() => openOverrideModal(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 p-1 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Adjust</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Workspace Geofence Settings Tab */
        <div className="glass-card rounded-2xl p-5 sm:p-7 bg-white border border-slate-200/90 shadow-soft-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Workspace Location & Geofence Setup
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your office coordinates and allowed attendance radius for engineers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Strict Geofence:</span>
              <button
                type="button"
                onClick={() =>
                  setConfigForm((prev) => ({
                    ...prev,
                    geofenceEnabled: !prev.geofenceEnabled,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  configForm.geofenceEnabled ? 'bg-brand-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    configForm.geofenceEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Workspace / Office Name *
                </label>
                <input
                  type="text"
                  required
                  value={configForm.workspaceName}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, workspaceName: e.target.value })
                  }
                  placeholder="e.g. CodePilot HQ - Main Campus"
                  className="block w-full rounded-xl border border-slate-300/80 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Office Address (Optional)
                </label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, address: e.target.value })
                  }
                  placeholder="e.g. Sector 62, Noida, UP"
                  className="block w-full rounded-xl border border-slate-300/80 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* GPS Location Capture Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50/70 to-indigo-50/70 border border-brand-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    Office GPS Coordinates
                  </h3>
                  <p className="text-[11px] text-brand-700 mt-0.5">
                    Click the capture button to automatically use your device's current GPS location.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCaptureCurrentGPS}
                  disabled={isDetectingGps}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft-xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Capture My Current GPS</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Latitude (e.g. 28.613939)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={configForm.latitude}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Longitude (e.g. 77.209021)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={configForm.longitude}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Allowed Geofence Radius */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Allowed Geofence Radius: <span className="text-brand-600 font-mono font-extrabold">{formatDistance(configForm.radiusMeters)}</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Engineers outside this radius will be blocked from punching in.
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {radiusPresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setConfigForm({ ...configForm, radiusMeters: r })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      configForm.radiusMeters === r
                        ? 'bg-slate-900 text-white border-slate-900 shadow-soft-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r < 1000 ? `${r} Meters` : `${r / 1000} KM`}
                  </button>
                ))}
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={configForm.radiusMeters}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    radiusMeters: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            {/* Shift Timings */}
            <div className="pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Shift Timings & Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={configForm.workStartTime}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, workStartTime: e.target.value })
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Grace Period (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={configForm.gracePeriodMinutes}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        gracePeriodMinutes: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    value={configForm.workEndTime}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, workEndTime: e.target.value })
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-soft-md shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                {isSavingConfig ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  'Save Geofence Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Override Modal */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="Adjust Attendance Record"
        subtitle={`Manually adjust attendance for ${overrideItem?.developer?.name || 'Engineer'}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveOverride} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Attendance Status
            </label>
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
            >
              <option value="Present">Present (On Time)</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Punch In Time
              </label>
              <input
                type="time"
                value={overridePunchInTime}
                onChange={(e) => setOverridePunchInTime(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Punch Out Time
              </label>
              <input
                type="time"
                value={overridePunchOutTime}
                onChange={(e) => setOverridePunchOutTime(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Notes / Reason
            </label>
            <textarea
              rows={2}
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              placeholder="e.g. Approved work from home / GPS signal issue on mobile..."
              className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOverrideModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingOverride}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmittingOverride ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Adjustment'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAttendancePage;
