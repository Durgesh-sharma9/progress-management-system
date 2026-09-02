import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-soft-xl text-xs">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0]?.name}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px] py-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color || item.fill }}
            />
            <span className="text-slate-500 font-medium">{item.name}:</span>
            <span className="font-bold font-mono text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ProjectAnalytics = ({ project, phases = [] }) => {
  const total = phases.length;
  const completed = phases.filter((p) => p.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Developer distribution data for Bar Chart
  const developerData = (project?.developers || []).map((dev) => {
    const devPhases = phases.filter(
      (p) => (p.developerId?._id || p.developerId) === dev._id
    );
    const devCompleted = devPhases.filter((p) => p.completed).length;
    const devPending = devPhases.length - devCompleted;

    return {
      name: dev.name?.split(' ')[0] || 'Dev',
      fullName: dev.name,
      Completed: devCompleted,
      Pending: devPending,
      Total: devPhases.length,
    };
  });

  // Pie chart data
  const pieData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-5">
      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-5 text-white shadow-soft-md shadow-emerald-500/20">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono tracking-tight">{completionRate}%</p>
          <div className="mt-1 flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span>{completed} of {total} delivered</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {completionRate === 100 ? 'Delivered' : 'In Track'}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-5 text-white shadow-soft-md shadow-brand-500/20">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-100 uppercase tracking-wider">
              Assigned Team
            </span>
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono tracking-tight">
            {project?.developers?.length || 0}
          </p>
          <p className="mt-1 text-xs text-brand-100 font-medium">Active team developers</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-5 text-white shadow-soft-md shadow-amber-500/20">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">
              Pending Phases
            </span>
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono tracking-tight">{pending}</p>
          <p className="mt-1 text-xs text-amber-100 font-medium">Awaiting developer completion</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Developer Workload & Progress Bar Chart */}
        <div className="glass-card rounded-2xl p-5 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Developer Phase Distribution
                </h4>
                <p className="text-[11px] text-slate-500">Done vs Pending per engineer</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {developerData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No developer phase data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={developerData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <Bar
                    dataKey="Completed"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="Pending"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Phase Status Donut Chart */}
        <div className="glass-card rounded-2xl p-5 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Project Completion Ratio
                </h4>
                <p className="text-[11px] text-slate-500">Total {total} phases tracked</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {total === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No phases created yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;

