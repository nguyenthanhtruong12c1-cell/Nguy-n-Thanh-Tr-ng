import React, { useState } from 'react';
import { Student, ALL_CLASSES } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Users, Award, Filter, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface TuitionAnalyticsProps {
  students: Student[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#f97316', '#14b8a6'];

export const TuitionAnalytics: React.FC<TuitionAnalyticsProps> = ({ students }) => {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Filter students if class selected
  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter(s => s.class === selectedClass);

  // Helper to parse date string "DD/MM/YYYY"
  const parseDateStr = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return {
      day: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10),
    };
  };

  // Build Monthly Data for Selected Year (Months 1-12)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const monthLabel = `Tháng ${monthIndex}`;

    let totalRevenue = 0;
    let totalSessions = 0;

    filteredStudents.forEach(st => {
      const studentFee = st.fee || 100000;
      let studentSessionsInMonth = 0;

      (st.attendanceDates || []).forEach(dateStr => {
        const parsed = parseDateStr(dateStr);
        if (parsed && parsed.year === selectedYear && parsed.month === monthIndex) {
          studentSessionsInMonth++;
        }
      });

      totalSessions += studentSessionsInMonth;
      totalRevenue += studentSessionsInMonth * studentFee;
    });

    return {
      month: monthLabel,
      monthNum: monthIndex,
      revenue: totalRevenue,
      sessions: totalSessions,
      revenueInMillions: totalRevenue / 1000000,
    };
  });

  // Calculate Class Breakdown Data for Selected Year
  const classBreakdownData = ALL_CLASSES.map((clsName, idx) => {
    let classRevenue = 0;
    let classSessions = 0;
    let studentCount = 0;

    students
      .filter(s => s.class === clsName)
      .forEach(st => {
        studentCount++;
        const fee = st.fee || 100000;
        let sessions = 0;
        (st.attendanceDates || []).forEach(dStr => {
          const parsed = parseDateStr(dStr);
          if (parsed && parsed.year === selectedYear) {
            sessions++;
          }
        });
        classSessions += sessions;
        classRevenue += sessions * fee;
      });

    return {
      name: clsName,
      revenue: classRevenue,
      sessions: classSessions,
      students: studentCount,
      color: COLORS[idx % COLORS.length],
    };
  }).filter(item => item.students > 0 || item.revenue > 0);

  // Overall statistics
  const yearTotalRevenue = monthlyData.reduce((acc, curr) => acc + curr.revenue, 0);
  const currentMonthRevenue = monthlyData.find(m => m.monthNum === currentMonthNum)?.revenue || 0;
  const yearTotalSessions = monthlyData.reduce((acc, curr) => acc + curr.sessions, 0);
  const activeStudentsCount = filteredStudents.length;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-sans">
          <p className="font-bold text-blue-400 mb-1">{label} ({selectedYear})</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-300">Tổng doanh thu:</span>
              <span className="font-black text-emerald-400">
                {data.revenue.toLocaleString('vi-VN')} ₫
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-300">Số buổi dạy:</span>
              <span className="font-bold text-amber-300">{data.sessions} buổi</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Formatter for Y-axis (e.g., 1M ₫, 500k ₫)
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} triệu`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            Thống Kê Học Phí Trung Tâm
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Biểu đồ doanh thu học phí thu được theo các tháng trong năm
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Year Select */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="p-1.5 text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(yr => (
                <option key={yr} value={yr}>Năm {yr}</option>
              ))}
            </select>
          </div>

          {/* Class Select */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-1.5 text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {ALL_CLASSES.map(cls => (
                <option key={cls} value={cls}>Lớp {cls}</option>
              ))}
            </select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                chartType === 'bar' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
              title="Biểu đồ Cột"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                chartType === 'area' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
              title="Biểu đồ Miền"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Year Revenue */}
        <div className="glass-card p-4 border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Tổng Thu Năm {selectedYear}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">
            {yearTotalRevenue.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Tổng cộng 12 tháng năm {selectedYear}
          </div>
        </div>

        {/* Current Month Revenue */}
        <div className="glass-card p-4 border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Doanh Thu Tháng {currentMonthNum}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950">
            {currentMonthRevenue.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Tháng hiện tại năm {selectedYear}
          </div>
        </div>

        {/* Total Sessions */}
        <div className="glass-card p-4 border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Tổng Buổi Học Đã Dạy
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950">
            {yearTotalSessions} <span className="text-sm font-bold text-purple-700">buổi</span>
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Trên tổng số {activeStudentsCount} học sinh
          </div>
        </div>

        {/* Active Students */}
        <div className="glass-card p-4 border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Số Học Sinh Theo Dõi
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {activeStudentsCount} <span className="text-sm font-bold text-amber-700">học sinh</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {selectedClass === 'all' ? 'Tất cả các khối lớp' : `Lớp ${selectedClass}`}
          </div>
        </div>
      </div>

      {/* Main Recharts Monthly Chart */}
      <div className="glass-card p-4 sm:p-6 shadow-sm border border-slate-200/90 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Doanh Thu Học Phí Hàng Tháng (VNĐ)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Thống kê chi tiết số tiền thu được theo từng tháng trong năm {selectedYear}
            </p>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 600 }} />
                <Bar
                  dataKey="revenue"
                  name="Doanh Thu Học Phí (VNĐ)"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            ) : (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 600 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh Thu Học Phí (VNĐ)"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Breakdown by Class */}
      {classBreakdownData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart per class */}
          <div className="glass-card p-4 sm:p-5 shadow-sm border border-slate-200 bg-white">
            <h3 className="text-base font-black text-slate-800 mb-1 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Doanh Thu Theo Lớp Học ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              So sánh tổng học phí giữa các khối lớp trong trung tâm
            </p>

            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classBreakdownData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Học phí']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}
                  />
                  <Bar dataKey="revenue" name="Học phí (VNĐ)" radius={[6, 6, 0, 0]}>
                    {classBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table list breakdown */}
          <div className="glass-card p-4 sm:p-5 shadow-sm border border-slate-200 bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800 mb-1">
                Chi Tiết Thu Theo Lớp
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-3">
                Thống kê số lượng học sinh, số buổi và học phí từng lớp
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-2">Lớp</th>
                      <th className="pb-2 text-center">Học sinh</th>
                      <th className="pb-2 text-center">Buổi học</th>
                      <th className="pb-2 text-right">Tổng học phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {classBreakdownData.map((clsItem) => (
                      <tr key={clsItem.name} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: clsItem.color }} />
                          {clsItem.name}
                        </td>
                        <td className="py-2.5 text-center font-bold text-slate-600">
                          {clsItem.students}
                        </td>
                        <td className="py-2.5 text-center font-bold text-amber-700">
                          {clsItem.sessions}
                        </td>
                        <td className="py-2.5 text-right font-black text-emerald-700">
                          {clsItem.revenue.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 flex justify-between items-center">
              <span>Tổng trung tâm ({selectedYear}):</span>
              <span className="text-sm font-black text-emerald-800">
                {yearTotalRevenue.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
