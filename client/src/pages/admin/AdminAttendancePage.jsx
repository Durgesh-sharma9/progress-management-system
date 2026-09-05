import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  getCurrentGPSLocation,
  formatDistance,
} from '../../utils/geoUtils';
import Modal from '../../components/common/Modal';
import {
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar as CalendarIcon,
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
  RefreshCw,
  Info,
  Navigation,
  Plus,
  Trash2,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  User,
  TrendingUp,
} from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminAttendancePage = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'calendar' (Monthly Report) | 'holidays' | 'settings'

  // Live Today Overview State
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [attendanceData, setAttendanceData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [developerFilter, setDeveloperFilter] = useState('All');

  // Monthly Report & Calendar State
  const [selectedStaffId, setSelectedStaffId] = useState('All');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);

  // Holiday Management State
  const [holidays, setHolidays] = useState([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayFormData, setHolidayFormData] = useState({
    date: getLocalDateString(),
    title: '',
    description: '',
  });
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isDeletingHoliday, setIsDeletingHoliday] = useState(false);

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
  });

  // Manual Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideItem, setOverrideItem] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('Present');
  const [overridePunchInTime, setOverridePunchInTime] = useState('09:30');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchConfig();
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchMonthlyCalendar();
    } else if (activeTab === 'holidays') {
      fetchHolidaysList();
    }
  }, [activeTab, calendarMonth, calendarYear]);

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

  const generateFallbackCalendarDays = (year, month, devsCount = 0, currentRoster = []) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPadded = String(month).padStart(2, '0');
    const todayStr = getLocalDateString();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();

      let presentCount = 0;
      let attendees = [];

      if (dateStr === todayStr && currentRoster && currentRoster.length > 0) {
        const presentList = currentRoster.filter(
          (r) => r.status === 'Present' && r.punchIn?.time
        );
        presentCount = presentList.length;
        attendees = presentList.map((r) => ({
          developerId: r.developer?._id,
          developerName: r.developer?.name,
          punchInTime: r.punchIn?.time,
          distanceMeters: r.punchIn?.distanceMeters,
        }));
      }

      const effectiveDevs = devsCount || (currentRoster ? currentRoster.length : 0);
      const presentRate =
        effectiveDevs > 0 ? Math.round((presentCount / effectiveDevs) * 100) : 0;

      days.push({
        date: dateStr,
        dayNumber: d,
        dayOfWeek,
        isSunday: dayOfWeek === 0,
        isHoliday: false,
        holiday: null,
        totalDevelopers: effectiveDevs,
        presentCount,
        absentCount: Math.max(0, effectiveDevs - presentCount),
        presentRate,
        attendees,
      });
    }

    return {
      year,
      month,
      totalDevelopers: devsCount || (currentRoster ? currentRoster.length : 0),
      calendarDays: days,
      holidays: [],
    };
  };

  const [calendarData, setCalendarData] = useState(() =>
    generateFallbackCalendarDays(new Date().getFullYear(), new Date().getMonth() + 1)
  );

  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleClearAllAttendance = async () => {
    if (!window.confirm('Are you sure you want to clear/delete ALL attendance records from the database? This cannot be undone.')) {
      return;
    }
    setIsClearingAll(true);
    try {
      const res = await api.delete('/attendance/admin/clear-all');
      if (res.data.success) {
        success(res.data.message || 'All attendance records have been cleared.');
        fetchOverview();
        fetchMonthlyCalendar();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to clear attendance records');
    } finally {
      setIsClearingAll(false);
    }
  };

  const fetchMonthlyCalendar = async () => {
    try {
      setCalendarLoading(true);
      const res = await api.get(
        `/attendance/admin/monthly-calendar?year=${calendarYear}&month=${calendarMonth}`
      );
      if (res.data.success && res.data.data) {
        setCalendarData(res.data.data);
      }
    } catch (err) {
      console.warn('Backend calendar route warming up, using fallback calendar data:', err);
      // Construct fallback month grid with current live roster overlay
      setCalendarData((prev) => {
        const devs = attendanceData?.summary?.totalDevelopers || prev?.totalDevelopers || 0;
        const roster = attendanceData?.roster || [];
        return generateFallbackCalendarDays(calendarYear, calendarMonth, devs, roster);
      });
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchHolidaysList = async () => {
    try {
      const res = await api.get(`/attendance/holidays?year=${calendarYear}`);
      if (res.data.success) {
        setHolidays(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
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
      success('📍 Office GPS coordinates captured successfully!');
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

  // Holiday Actions
  const openAddHolidayModal = (prefillDate = null) => {
    setHolidayFormData({
      date: prefillDate || getLocalDateString(),
      title: '',
      description: '',
    });
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!holidayFormData.date || !holidayFormData.title.trim()) {
      error('Please provide both date and holiday name');
      return;
    }

    setIsSavingHoliday(true);
    try {
      const res = await api.post('/attendance/holidays', holidayFormData);
      if (res.data.success) {
        success(res.data.message || 'Holiday saved successfully');
        setIsHolidayModalOpen(false);
        if (activeTab === 'calendar') fetchMonthlyCalendar();
        if (activeTab === 'holidays') fetchHolidaysList();
        fetchOverview();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save holiday');
    } finally {
      setIsSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to remove this holiday?')) return;
    setIsDeletingHoliday(true);
    try {
      const res = await api.delete(`/attendance/holidays/${holidayId}`);
      if (res.data.success) {
        success('Holiday removed');
        if (activeTab === 'calendar') fetchMonthlyCalendar();
        if (activeTab === 'holidays') fetchHolidaysList();
        fetchOverview();
      }
    } catch (err) {
      error('Failed to remove holiday');
    } finally {
      setIsDeletingHoliday(false);
    }
  };

  // Month navigation helpers & constraints
  const now = new Date();
  const currentYearNow = now.getFullYear();
  const currentMonthNow = now.getMonth() + 1;
  const isCurrentMonth =
    calendarYear === currentYearNow && calendarMonth === currentMonthNow;

  const availableMonths = useMemo(() => {
    const list = [];
    const tempDate = new Date(currentYearNow, currentMonthNow - 1, 1);
    for (let i = 0; i < 24; i++) {
      const y = tempDate.getFullYear();
      const m = tempDate.getMonth() + 1;
      list.push({
        year: y,
        month: m,
        value: `${y}-${m}`,
        label: `${MONTH_NAMES[m - 1]} ${y}${i === 0 ? ' (Current Month)' : ''}`,
      });
      tempDate.setMonth(tempDate.getMonth() - 1);
    }
    return list;
  }, [currentYearNow, currentMonthNow]);

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (
      calendarYear > currentYearNow ||
      (calendarYear === currentYearNow && calendarMonth >= currentMonthNow)
    ) {
      return;
    }
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const developersList = useMemo(() => {
    if (calendarData?.developers && calendarData.developers.length > 0) {
      return calendarData.developers;
    }
    if (attendanceData?.roster && attendanceData.roster.length > 0) {
      return attendanceData.roster.map((r) => ({
        _id: r.developer._id,
        name: r.developer.name,
        email: r.developer.email,
      }));
    }
    return [];
  }, [calendarData?.developers, attendanceData?.roster]);

  const monthlyAnalytics = useMemo(() => {
    const days = calendarData?.calendarDays || [];
    const todayStr = getLocalDateString();

    // Past or current working days (not future, not Sunday, not Holiday)
    const activeWorkingDays = days.filter(
      (d) => d.date <= todayStr && !d.isSunday && !d.isHoliday
    );
    const totalWorkingDays = activeWorkingDays.length;
    const holidaysCount = days.filter((d) => d.isHoliday).length;
    const sundaysCount = days.filter((d) => d.isSunday).length;

    if (selectedStaffId === 'All') {
      const totalStaff = developersList.length || calendarData?.totalDevelopers || 0;

      const staffBreakdown = developersList.map((dev) => {
        const devIdStr = dev._id ? dev._id.toString() : '';
        const devDays = activeWorkingDays.filter((d) =>
          d.attendees?.some((a) => String(a.developerId) === devIdStr)
        );
        const presentCount = devDays.length;
        const absentCount = Math.max(0, totalWorkingDays - presentCount);
        const rate =
          totalWorkingDays > 0 ? Math.round((presentCount / totalWorkingDays) * 100) : 0;
        return {
          ...dev,
          presentCount,
          absentCount,
          rate,
        };
      });

      const totalPossibleAttendance = totalStaff * totalWorkingDays;
      const totalMarkedAttendance = staffBreakdown.reduce((sum, s) => sum + s.presentCount, 0);
      const avgTeamRate =
        totalPossibleAttendance > 0
          ? Math.round((totalMarkedAttendance / totalPossibleAttendance) * 100)
          : 0;

      return {
        mode: 'team',
        totalStaff,
        totalWorkingDays,
        totalMarkedAttendance,
        avgTeamRate,
        holidaysCount,
        sundaysCount,
        staffBreakdown,
      };
    } else {
      const selectedDev = developersList.find((d) => String(d._id) === String(selectedStaffId));
      const devDays = activeWorkingDays.filter((d) =>
        d.attendees?.some((a) => String(a.developerId) === String(selectedStaffId))
      );
      const presentCount = devDays.length;
      const absentCount = Math.max(0, totalWorkingDays - presentCount);
      const rate =
        totalWorkingDays > 0 ? Math.round((presentCount / totalWorkingDays) * 100) : 0;

      const punchIns = devDays
        .map(
          (d) =>
            d.attendees?.find((a) => String(a.developerId) === String(selectedStaffId))
              ?.punchInTime
        )
        .filter(Boolean);

      let avgPunchIn = '--:--';
      if (punchIns.length > 0) {
        const totalMinutes = punchIns.reduce((acc, t) => {
          const dt = new Date(t);
          return acc + (dt.getHours() * 60 + dt.getMinutes());
        }, 0);
        const avgMins = Math.round(totalMinutes / punchIns.length);
        const hrs = Math.floor(avgMins / 60);
        const mins = avgMins % 60;
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        const h12 = hrs % 12 || 12;
        avgPunchIn = `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
      }

      return {
        mode: 'staff',
        staff: selectedDev || { name: 'Staff Member', email: '' },
        totalWorkingDays,
        presentCount,
        absentCount,
        rate,
        avgPunchIn,
        holidaysCount,
        sundaysCount,
      };
    }
  }, [calendarData, selectedStaffId, developersList]);

  const openDayDetails = (day) => {
    setSelectedDayDetails(day);
    setIsDayDetailsModalOpen(true);
  };

  const openOverrideModal = (item) => {
    setOverrideItem(item);
    setOverrideStatus(item.status === 'Present' ? 'Present' : 'Absent');
    setOverridePunchInTime(
      item.punchIn?.time
        ? new Date(item.punchIn.time).toTimeString().slice(0, 5)
        : '09:30'
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

      if (overrideStatus === 'Present') {
        inDateTime = overridePunchInTime
          ? new Date(`${dateStr}T${overridePunchInTime}:00`)
          : new Date();
      }

      const res = await api.post('/attendance/admin/manual', {
        developerId: overrideItem.developer._id,
        date: dateStr,
        status: overrideStatus,
        punchInTime: inDateTime,
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

  const radiusPresets = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Compute blank leading days for calendar grid
  const firstDayOfMonthWeekday = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0 = Sun

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
              Attendance & Calendar Console
            </h1>
            <p className="text-xs text-slate-500">
              Live Roster, Monthly Attendance Report & Analytics, Holidays & Geofence Settings
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
            <span>Today's Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
            <span>Month Wise Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'holidays'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PartyPopper className="h-3.5 w-3.5 text-pink-600" />
            <span>Holiday Management</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-600" />
            <span>Workspace Geofence</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TODAY'S LIVE ROSTER */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          {attendanceData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Engineers</p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {attendanceData.summary.totalDevelopers}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-emerald-600">Present</p>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                  {attendanceData.summary.presentCount}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-rose-600">Absent</p>
                <p className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono mt-0.5">
                  {attendanceData.summary.absentCount}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                <p className="text-[10px] font-bold uppercase text-brand-600">Attendance Rate</p>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-700 font-mono mt-0.5">
                  {attendanceData.summary.presentRate}%
                </p>
              </div>
            </div>
          )}

          {/* Holiday Alert Banner if Today is declared a Holiday */}
          {attendanceData?.holiday && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/90 flex items-center justify-between gap-3 text-purple-900 shadow-soft-xs">
              <div className="flex items-center gap-2.5">
                <PartyPopper className="h-5 w-5 text-purple-600 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold">
                    🎉 Declared Holiday: {attendanceData.holiday.title}
                  </p>
                  {attendanceData.holiday.description && (
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      {attendanceData.holiday.description}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-purple-200/70 text-purple-800">
                Official Holiday
              </span>
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

            {/* Date Picker */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="date"
                  max={getLocalDateString()}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    const maxVal = getLocalDateString();
                    setSelectedDate(val > maxVal ? maxVal : val);
                  }}
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

          {/* Roster Cards */}
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
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" />
                              <span>Absent</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Check-in Details Box */}
                      <div className="space-y-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Attendance Time:
                          </span>
                          <span className={`font-mono font-bold ${isPresent ? 'text-emerald-800' : 'text-slate-500'}`}>
                            {item.punchIn?.time
                              ? new Date(item.punchIn.time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Absent'}
                          </span>
                        </div>

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

                      {/* Admin Notes if present */}
                      {item.adminNotes && (
                        <div className="mb-2 p-2 rounded-lg bg-purple-50/70 border border-purple-200/70 text-[10px] text-purple-900">
                          <p className="font-bold text-[9px] uppercase tracking-wider text-purple-700 mb-0.5">
                            Note:
                          </p>
                          <p className="line-clamp-2">{item.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {item.isManualOverride ? '⚠️ Adjusted by Admin' : isPresent ? 'GPS Verified' : 'Pending'}
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
      )}

      {/* VIEW 2: MONTHLY ATTENDANCE REPORT & ANALYTICS */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Top Control Bar: Staff Selector, Month/Year Picker & Actions */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 bg-white border border-slate-200/90 shadow-soft-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left Controls: Staff Filter + Month Picker */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
              {/* Staff Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <Users className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Staff:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">👥 All Staff (Team Overview)</option>
                  {developersList.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      👤 {dev.name} ({dev.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month & Year Navigation + Dropdown (Previous Months & Current Month) */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <select
                  value={`${calendarYear}-${calendarMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setCalendarYear(y);
                    setCalendarMonth(m);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-900 px-1 py-1 focus:outline-none cursor-pointer"
                >
                  {availableMonths.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isCurrentMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  title={isCurrentMonth ? "Future months disabled" : "Next Month"}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAddHolidayModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-soft-xs hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 shrink-0"
              >
                <PartyPopper className="h-3.5 w-3.5" />
                <span>Declare a Holiday</span>
              </button>
              <button
                type="button"
                onClick={fetchMonthlyCalendar}
                disabled={calendarLoading}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                title="Refresh Report"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${calendarLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Monthly Attendance Analytics Section */}
          {monthlyAnalytics.mode === 'staff' ? (
            /* Case 1: Individual Staff Member Analytics */
            <div className="space-y-3">
              {/* Staff Banner */}
              <div className="glass-card rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-purple-50 via-white to-brand-50 border border-purple-200/80 shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-soft-xs shrink-0">
                    {monthlyAnalytics.staff?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {monthlyAnalytics.staff?.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        Staff Report
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{monthlyAnalytics.staff?.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStaffId('All')}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 px-3 py-1.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 transition-colors self-start sm:self-auto"
                >
                  ← Back to All Staff
                </button>
              </div>

              {/* 4 Analytics Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Present Days</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                    {monthlyAnalytics.presentCount} <span className="text-xs text-slate-400 font-sans font-normal">/ {monthlyAnalytics.totalWorkingDays}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Working Days</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-rose-600">Absent Days</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-rose-600 font-mono mt-0.5">
                    {monthlyAnalytics.absentCount}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Unmarked days</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-purple-600">Attendance Rate</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-purple-700 font-mono mt-0.5">
                    {monthlyAnalytics.rate}%
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        monthlyAnalytics.rate >= 80 ? 'bg-emerald-500' : monthlyAnalytics.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, monthlyAnalytics.rate)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-indigo-600">Avg In-Time</p>
                  <p className="text-base sm:text-xl font-extrabold text-indigo-700 font-mono mt-0.5 truncate">
                    {monthlyAnalytics.avgPunchIn}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Morning punch-in</p>
                </div>
              </div>
            </div>
          ) : (
            /* Case 2: All Staff Team Analytics & Staff Breakdown */
            <div className="space-y-3">
              {/* 4 Team Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Staff</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {monthlyAnalytics.totalStaff}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Engineers</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Working Days</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-slate-800 font-mono mt-0.5">
                    {monthlyAnalytics.totalWorkingDays}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">This Month</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-purple-600">Team Rate</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-purple-700 font-mono mt-0.5">
                    {monthlyAnalytics.avgTeamRate}%
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all"
                      style={{ width: `${Math.min(100, monthlyAnalytics.avgTeamRate)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-soft-xs text-center">
                  <p className="text-[10px] font-bold uppercase text-pink-600">Holidays & Off</p>
                  <p className="text-lg sm:text-2xl font-extrabold text-pink-700 font-mono mt-0.5">
                    {monthlyAnalytics.holidaysCount + monthlyAnalytics.sundaysCount}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {monthlyAnalytics.holidaysCount} Hol. + {monthlyAnalytics.sundaysCount} Sun.
                  </p>
                </div>
              </div>

              {/* Staff Monthly Breakdown Table */}
              {monthlyAnalytics.staffBreakdown?.length > 0 && (
                <div className="glass-card rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs overflow-hidden">
                  <div className="p-3 sm:p-3.5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span>Staff Attendance Performance ({MONTH_NAMES[calendarMonth - 1]} {calendarYear})</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Tap staff to view individual calendar
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {monthlyAnalytics.staffBreakdown.map((dev) => (
                      <div
                        key={dev._id}
                        onClick={() => setSelectedStaffId(dev._id)}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-purple-50/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {dev.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate hover:text-purple-700">
                              {dev.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{dev.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-extrabold font-mono text-slate-800">
                              {dev.presentCount}/{monthlyAnalytics.totalWorkingDays} Days
                            </span>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                  dev.rate >= 80
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : dev.rate >= 50
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {dev.rate}%
                              </span>
                            </div>
                          </div>

                          <span className="text-xs text-purple-600 font-bold hidden sm:inline">
                            View Calendar →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar Section with Compact, Mobile-Responsive Design */}
          {calendarLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
              <p className="text-xs text-slate-400">Loading attendance calendar...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs overflow-hidden">
              {/* Calendar Section Header */}
              <div className="px-3 sm:px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
                  {selectedStaffId === 'All'
                    ? `Team Monthly Calendar (${MONTH_NAMES[calendarMonth - 1]} ${calendarYear})`
                    : `${monthlyAnalytics.staff?.name}'s Attendance Calendar`}
                </span>
                {selectedStaffId !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedStaffId('All')}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900"
                  >
                    View All Staff
                  </button>
                )}
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center text-[10px] sm:text-xs font-extrabold text-slate-600 py-1.5 sm:py-2">
                <span className="text-rose-600">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-indigo-600">Sat</span>
              </div>

              {/* Compact Day Cells Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                {/* Blank Leading Cells */}
                {Array.from({ length: firstDayOfMonthWeekday }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-14 sm:h-18 md:h-20 bg-slate-50/30 p-1" />
                ))}

                {/* Days of the Month */}
                {calendarData?.calendarDays?.map((day) => {
                  const todayStr = getLocalDateString();
                  const isToday = day.date === todayStr;
                  const isFuture = day.date > todayStr;

                  // Find staff attendee if a specific staff member is selected
                  const staffAttendee =
                    selectedStaffId !== 'All'
                      ? day.attendees?.find(
                          (a) => String(a.developerId) === String(selectedStaffId)
                        )
                      : null;
                  const isStaffPresent = Boolean(staffAttendee);

                  return (
                    <div
                      key={day.date}
                      onClick={isFuture && !day.isHoliday ? undefined : () => openDayDetails(day)}
                      className={`h-14 sm:h-18 md:h-20 p-1 sm:p-1.5 transition-all flex flex-col justify-between relative group ${
                        isFuture && !day.isHoliday
                          ? 'bg-slate-50/40 opacity-40 cursor-not-allowed select-none'
                          : 'cursor-pointer hover:bg-purple-50/40'
                      } ${
                        day.isHoliday
                          ? 'bg-purple-50/60'
                          : selectedStaffId !== 'All' && !isFuture && !day.isSunday
                          ? isStaffPresent
                            ? 'bg-emerald-50/40'
                            : 'bg-rose-50/30'
                          : day.isSunday
                          ? 'bg-rose-50/20'
                          : 'bg-white'
                      } ${isToday ? 'ring-2 ring-brand-500 ring-inset shadow-soft-xs' : ''}`}
                    >
                      {/* Top bar: Day number & Holiday Badge */}
                      <div className="flex items-start justify-between gap-0.5">
                        <span
                          className={`font-mono text-[10px] sm:text-xs font-extrabold h-4 w-4 sm:h-5 sm:w-5 rounded flex items-center justify-center ${
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
                            className="text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 truncate max-w-[50px] sm:max-w-[80px]"
                            title={day.holiday?.title}
                          >
                            🎉 {day.holiday?.title}
                          </span>
                        )}
                      </div>

                      {/* Middle: Status Display (Staff specific OR Team overall) */}
                      <div className="my-auto overflow-hidden">
                        {day.isHoliday ? (
                          <span className="text-[8px] sm:text-[9px] font-bold text-purple-700 hidden sm:block">
                            Holiday
                          </span>
                        ) : isFuture ? (
                          <span className="text-[8px] sm:text-[9px] text-slate-400 italic">
                            {day.isSunday ? 'Off' : 'Upcoming'}
                          </span>
                        ) : day.isSunday ? (
                          <span className="text-[8px] sm:text-[9px] text-slate-400 italic">
                            Weekly Off
                          </span>
                        ) : selectedStaffId !== 'All' ? (
                          /* Individual Staff Status */
                          isStaffPresent ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 truncate max-w-full">
                              <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-emerald-600 shrink-0" />
                              <span className="truncate">
                                {staffAttendee.punchInTime
                                  ? new Date(staffAttendee.punchInTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Present'}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-rose-100 text-rose-700">
                              Absent
                            </span>
                          )
                        ) : (
                          /* Team Overview Status */
                          day.presentCount > 0 ? (
                            <div className="space-y-0.5">
                              <span
                                className={`inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded ${
                                  day.presentRate >= 80
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                <span>{day.presentCount}/{day.totalDevelopers}</span>
                              </span>

                              {/* Attendee Avatar Initial Circles on sm+ */}
                              <div className="hidden md:flex items-center gap-0.5 overflow-hidden">
                                {day.attendees.slice(0, 2).map((att, i) => (
                                  <span
                                    key={i}
                                    className="h-3.5 w-3.5 rounded-full bg-emerald-600 text-[7px] font-bold text-white flex items-center justify-center shrink-0"
                                    title={`${att.developerName}`}
                                  >
                                    {att.developerName?.charAt(0)}
                                  </span>
                                ))}
                                {day.attendees.length > 2 && (
                                  <span className="text-[7px] text-slate-400 font-bold">
                                    +{day.attendees.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[8px] sm:text-[9px] text-slate-400 italic">
                              0 Present
                            </span>
                          )
                        )}
                      </div>

                      {/* Bottom action: Details hint on hover */}
                      <div className="flex items-center justify-end text-[8px] sm:text-[9px] text-slate-400 group-hover:text-purple-600 transition-colors">
                        {(!isFuture || day.isHoliday) && (
                          <span className="hidden sm:inline">Details →</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: HOLIDAY MANAGEMENT LIST */}
      {activeTab === 'holidays' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 bg-white border border-slate-200/90 shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Company Holidays ({calendarYear})
              </h2>
              <p className="text-xs text-slate-500">
                Manage declared public holidays, festival leaves, and office off-days.
              </p>
            </div>

            <button
              onClick={() => openAddHolidayModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-soft-xs hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Holiday</span>
            </button>
          </div>

          {holidays.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <PartyPopper className="h-10 w-10 text-purple-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No holidays declared yet for {calendarYear}</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "+ Add New Holiday" to declare a holiday on the calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {holidays.map((h) => (
                <div
                  key={h._id}
                  className="glass-card rounded-2xl p-4 bg-white border border-purple-200/80 shadow-soft-xs flex flex-col justify-between hover:shadow-soft-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                        {h.date}
                      </span>
                      <button
                        onClick={() => handleDeleteHoliday(h._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Holiday"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <PartyPopper className="h-4 w-4 text-purple-600 shrink-0" />
                      <span>{h.title}</span>
                    </h3>

                    {h.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {h.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                    <span className="font-semibold text-purple-600">Declared Holiday</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: WORKSPACE GEOFENCE SETTINGS */}
      {activeTab === 'settings' && (
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
                  Engineers outside this radius will be blocked from marking attendance.
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                {radiusPresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setConfigForm({ ...configForm, radiusMeters: r })}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
                      configForm.radiusMeters === r
                        ? 'bg-slate-900 text-white border-slate-900 shadow-soft-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r < 1000 ? `${r}m` : `${r / 1000} KM`}
                  </button>
                ))}
              </div>

              {/* Custom Input & Range Slider */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Custom Radius (in Meters):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="500000"
                      step="50"
                      value={configForm.radiusMeters}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          radiusMeters: Math.max(10, parseInt(e.target.value, 10) || 100),
                        })
                      }
                      className="w-28 px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-xs font-mono font-bold text-brand-600">
                      = {formatDistance(configForm.radiusMeters)}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100000"
                  step="50"
                  value={Math.min(configForm.radiusMeters, 100000)}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      radiusMeters: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-soft-md shadow-purple-500/25 transition-all disabled:opacity-50"
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

      {/* Day Details Inspection Modal */}
      <Modal
        isOpen={isDayDetailsModalOpen}
        onClose={() => setIsDayDetailsModalOpen(false)}
        title={`Attendance on ${selectedDayDetails?.date || ''}`}
        subtitle={
          selectedDayDetails?.isHoliday
            ? `🎉 Declared Holiday: ${selectedDayDetails.holiday?.title}`
            : `${selectedDayDetails?.presentCount || 0}/${selectedDayDetails?.totalDevelopers || 0} Engineers Present (${selectedDayDetails?.presentRate || 0}%)`
        }
        maxWidth="md"
      >
        <div className="space-y-3">
          {selectedDayDetails?.isHoliday && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <PartyPopper className="h-4 w-4 text-purple-600" />
                <span>Holiday: {selectedDayDetails.holiday?.title}</span>
              </p>
              {selectedDayDetails.holiday?.description && (
                <p className="text-purple-700 mt-1">{selectedDayDetails.holiday.description}</p>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(!selectedDayDetails?.attendees || selectedDayDetails.attendees.length === 0) ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No attendance records for this date.
              </p>
            ) : (
              selectedDayDetails.attendees.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {att.developerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{att.developerName}</p>
                      <p className="text-[10px] text-slate-400">
                        {att.distanceMeters !== undefined ? `${formatDistance(att.distanceMeters)} from office` : 'Verified'}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {new Date(att.punchInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDayDetailsModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Declare Holiday Modal */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Declare a Holiday"
        subtitle="Mark a calendar date as a company holiday or festive leave."
        maxWidth="md"
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Holiday Date *
            </label>
            <input
              type="date"
              required
              value={holidayFormData.date}
              onChange={(e) => setHolidayFormData({ ...holidayFormData, date: e.target.value })}
              className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold text-slate-800 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Holiday Title / Name *
            </label>
            <input
              type="text"
              required
              value={holidayFormData.title}
              onChange={(e) => setHolidayFormData({ ...holidayFormData, title: e.target.value })}
              placeholder="e.g. Diwali / Republic Day / Annual Outing"
              className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={holidayFormData.description}
              onChange={(e) => setHolidayFormData({ ...holidayFormData, description: e.target.value })}
              placeholder="e.g. Office closed on occasion of Festival..."
              className="block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingHoliday}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-soft-xs hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
            >
              {isSavingHoliday ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Holiday...
                </>
              ) : (
                'Save Holiday'
              )}
            </button>
          </div>
        </form>
      </Modal>

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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {overrideStatus === 'Present' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Attendance Time
              </label>
              <input
                type="time"
                value={overridePunchInTime}
                onChange={(e) => setOverridePunchInTime(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Notes / Reason
            </label>
            <textarea
              rows={2}
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              placeholder="e.g. Approved attendance manual override..."
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
