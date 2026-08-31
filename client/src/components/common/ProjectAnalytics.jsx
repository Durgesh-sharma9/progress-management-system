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
} from 'lucide-react';

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
    <div className="space-y-4">
      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-sm shadow-emerald-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
              Completion Rate
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          </div>
          <p className="text-2xl font-extrabold mt-1 font-mono">{completionRate}%</p>
          <p className="text-[11px] text-emerald-100">
            {completed} of {total} delivered
          </p>
        </div>

        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl p-4 text-white shadow-sm shadow-brand-600/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-100 uppercase tracking-wider">
              Team Members
            </span>
            <TrendingUp className="h-4 w-4 text-brand-200" />
          </div>
          <p className="text-2xl font-extrabold mt-1 font-mono">
            {project?.developers?.length || 0}
          </p>
          <p className="text-[11px] text-brand-100">Assigned developers</p>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-sm shadow-amber-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider">
              Pending Phases
            </span>
            <Clock className="h-4 w-4 text-amber-200" />
          </div>
          <p className="text-2xl font-extrabold mt-1 font-mono">{pending}</p>
          <p className="text-[11px] text-amber-100">Awaiting completion</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Developer Workload & Progress Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-bold text-slate-900">
                Developer Phase Distribution
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Done vs Pending
            </span>
          </div>

          <div className="h-48 w-full">
            {developerData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No developer data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={developerData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '6px 10px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
                  />
                  <Bar
                    dataKey="Completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Phase Status Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-bold text-slate-900">
                Project Completion Ratio
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Total {total} Phases
            </span>
          </div>

          <div className="h-48 w-full">
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
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '6px 10px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
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
