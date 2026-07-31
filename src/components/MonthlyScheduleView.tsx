import React, { useState } from 'react';
import { Student, ALL_CLASSES } from '../types';
import { TuitionAnalytics } from './TuitionAnalytics';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Users,
  Plus,
  Check,
  Filter,
  X,
  CheckSquare,
  Square,
  Grid,
  List,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface MonthlyScheduleViewProps {
  students: Student[];
  onAddAttendance: (studentId: number, dateStr: string) => void;
  onDeleteAttendance: (studentId: number, index: number) => void;
}

export const MonthlyScheduleView: React.FC<MonthlyScheduleViewProps> = ({
  students,
  onAddAttendance,
  onDeleteAttendance,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped' | 'analytics'>('grid');
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month title
  const monthName = `Tháng ${month + 1}, ${year}`;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to build calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week offset: 0=Sunday, 1=Monday... We want Monday to be 0 offset
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday = index 6

  const daysInMonth = lastDayOfMonth.getDate();

  const calendarCells = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Filter students by selected class
  const filteredStudents = selectedClassFilter === 'all'
    ? students
    : students.filter(s => s.class === selectedClassFilter);

  // Helper to get formatted string DD/MM/YYYY
  const getFormattedDateStr = (dayNum: number) => {
    const d = dayNum.toString().padStart(2, '0');
    const m = (month + 1).toString().padStart(2, '0');
    return `${d}/${m}/${year}`;
  };

  // Map of dateStr -> list of students who attended on that date
  const getAttendingStudentsForDate = (dateStr: string) => {
    return filteredStudents.filter(s => s.attendanceDates && s.attendanceDates.includes(dateStr));
  };

  // Toggle student attendance for a date
  const handleToggleAttendance = (student: Student, dateStr: string) => {
    const existsIndex = student.attendanceDates.indexOf(dateStr);
    if (existsIndex >= 0) {
      onDeleteAttendance(student.id, existsIndex);
    } else {
      onAddAttendance(student.id, dateStr);
    }
  };

  // Batch toggle for all filtered students on a date
  const handleToggleAllForDate = (dateStr: string, addAll: boolean) => {
    filteredStudents.forEach(st => {
      const existsIndex = st.attendanceDates.indexOf(dateStr);
      if (addAll && existsIndex < 0) {
        onAddAttendance(st.id, dateStr);
      } else if (!addAll && existsIndex >= 0) {
        onDeleteAttendance(st.id, existsIndex);
      }
    });
  };

  // Batch toggle for a single class on a date
  const handleBatchToggleClass = (clsName: string, dateStr: string, addAll: boolean) => {
    const classStudents = students.filter(s => s.class === clsName);
    classStudents.forEach(st => {
      const existsIndex = st.attendanceDates.indexOf(dateStr);
      if (addAll && existsIndex < 0) {
        onAddAttendance(st.id, dateStr);
      } else if (!addAll && existsIndex >= 0) {
        onDeleteAttendance(st.id, existsIndex);
      }
    });
  };

  const todayStr = `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-blue-600" />
            Thời Khóa Biểu & Điểm Danh Hàng Loạt
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Sắp xếp học sinh theo ngày học & hỗ trợ điểm danh nhanh tích chọn checkbox hàng loạt
          </p>
        </div>

        {/* Filter & Navigation */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Ô Lịch
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grouped'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Nhóm Theo Ngày
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'analytics'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Biểu Đồ Học Phí
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="p-1.5 text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {ALL_CLASSES.map(cls => (
                <option key={cls} value={cls}>Lớp {cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition"
            >
              Hôm nay
            </button>
            <span className="font-extrabold text-xs sm:text-sm text-slate-800 px-2 min-w-[110px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode 3: Recharts Tuition Analytics View */}
      {viewMode === 'analytics' && (
        <TuitionAnalytics students={students} />
      )}

      {/* Mode 1: Calendar Grid View */}
      {viewMode === 'grid' && (
        <div className="glass-card p-3 sm:p-5 shadow-sm border border-white/90">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName, i) => (
              <div
                key={dayName}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg ${
                  i >= 5 ? 'text-amber-700 bg-amber-50/60' : 'text-slate-600 bg-slate-100/60'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="min-h-[85px] sm:min-h-[110px] bg-slate-50/30 rounded-xl" />;
              }

              const dateStr = getFormattedDateStr(dayNum);
              const attendingList = getAttendingStudentsForDate(dateStr);
              const count = attendingList.length;
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setActiveDateModal(dateStr)}
                  className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative ${
                    isToday
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                      : count > 0
                      ? 'bg-white/95 border-emerald-300 hover:border-emerald-500 shadow-2xs'
                      : 'bg-white/50 border-slate-200 hover:border-blue-300 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-black text-xs sm:text-sm px-2 py-0.5 rounded-md ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-700 group-hover:text-blue-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> {count} em
                      </span>
                    )}
                  </div>

                  {/* List preview of attending students grouped on this day */}
                  <div className="mt-1 space-y-1 overflow-hidden max-h-[55px] sm:max-h-[65px]">
                    {attendingList.slice(0, 3).map(st => (
                      <div
                        key={st.id}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-200 truncate font-bold flex items-center gap-1"
                      >
                        <CheckSquare className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{st.name}</span>
                        <span className="text-[9px] text-emerald-700 ml-auto font-semibold">({st.class})</span>
                      </div>
                    ))}
                    {count > 3 && (
                      <div className="text-[9px] text-slate-500 font-extrabold pl-1">
                        +{count - 3} em khác...
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mt-auto text-right">
                    ⚡ Điểm danh hàng loạt
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Grouped List View by Date */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Danh sách này sắp xếp tất cả học sinh theo từng ngày trong tháng {month + 1}/{year}. Bạn có thể tích chọn checkbox trực tiếp để điểm danh nhanh chóng.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => {
              const dateStr = getFormattedDateStr(dayNum);
              const attendingList = getAttendingStudentsForDate(dateStr);
              const isToday = dateStr === todayStr;

              // Check if all filtered students are attending
              const allAttending = filteredStudents.length > 0 && filteredStudents.every(s => s.attendanceDates.includes(dateStr));
              const someAttending = attendingList.length > 0;

              return (
                <div
                  key={dateStr}
                  className={`glass-card p-4 rounded-2xl border transition ${
                    isToday
                      ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/30'
                      : someAttending
                      ? 'border-emerald-200 bg-white/90 shadow-2xs'
                      : 'border-slate-200 bg-white/50'
                  }`}
                >
                  {/* Card Header for the Date */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {dayNum}/{month + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          Ngày {dateStr}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {attendingList.length}/{filteredStudents.length} học sinh có mặt
                        </span>
                      </div>
                    </div>

                    {/* Master Checkbox for this Date */}
                    {filteredStudents.length > 0 && (
                      <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={allAttending}
                          onChange={(e) => handleToggleAllForDate(dateStr, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Tất cả</span>
                      </label>
                    )}
                  </div>

                  {/* Student Checklist Grid */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {ALL_CLASSES.map(clsName => {
                      const classStudents = filteredStudents.filter(s => s.class === clsName);
                      if (classStudents.length === 0) return null;

                      const allClassAttending = classStudents.every(s => s.attendanceDates.includes(dateStr));

                      return (
                        <div key={clsName} className="border border-slate-100 rounded-xl p-2 bg-slate-50/70">
                          <div className="flex justify-between items-center mb-1.5 px-1">
                            <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                              Lớp {clsName} ({classStudents.length})
                            </span>
                            <button
                              onClick={() => handleBatchToggleClass(clsName, dateStr, !allClassAttending)}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              {allClassAttending ? 'Bỏ chọn lớp' : 'Chọn cả lớp'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {classStudents.map(st => {
                              const isAttending = st.attendanceDates.includes(dateStr);
                              return (
                                <label
                                  key={st.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition text-xs ${
                                    isAttending
                                      ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                      : 'bg-white border-slate-200 font-medium text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={isAttending}
                                      onChange={() => handleToggleAttendance(st, dateStr)}
                                      className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                                    />
                                    <span className="truncate">{st.name}</span>
                                  </div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    isAttending ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {isAttending ? 'Có mặt' : 'Vắng'}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Detail Modal */}
      {activeDateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Điểm danh & Lịch dạy ngày {activeDateModal}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tích chọn checkbox bên cạnh tên học sinh để thực hiện điểm danh hàng loạt
                </p>
              </div>
              <button
                onClick={() => setActiveDateModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Master Toggle Bar */}
              <div className="bg-blue-50/90 p-3 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs sm:text-sm text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-blue-300 shadow-2xs hover:bg-blue-100/50 transition">
                    <input
                      type="checkbox"
                      checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every(s => s.attendanceDates.includes(activeDateModal))
                      }
                      onChange={(e) => handleToggleAllForDate(activeDateModal, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Chọn tất cả tất cả học sinh ({filteredStudents.length} em)</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600">Theo lớp:</span>
                  {ALL_CLASSES.map(clsName => {
                    const classStudents = students.filter(s => s.class === clsName);
                    if (classStudents.length === 0) return null;
                    const allAttending = classStudents.every(s => s.attendanceDates.includes(activeDateModal));
                    return (
                      <button
                        key={clsName}
                        onClick={() => handleBatchToggleClass(clsName, activeDateModal, !allAttending)}
                        className={`px-2 py-1 text-xs rounded-lg transition font-bold ${
                          allAttending
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                        }`}
                      >
                        {allAttending ? `✓ Lớp ${clsName}` : `+ Lớp ${clsName}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Checklist Grid */}
              <div className="space-y-3">
                {ALL_CLASSES.map(clsName => {
                  const classStudents = filteredStudents.filter(s => s.class === clsName);
                  if (classStudents.length === 0) return null;

                  const allClassAttending = classStudents.every(s => s.attendanceDates.includes(activeDateModal));

                  return (
                    <div key={clsName} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700">
                            <input
                              type="checkbox"
                              checked={allClassAttending}
                              onChange={(e) => handleBatchToggleClass(clsName, activeDateModal, e.target.checked)}
                              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Lớp {clsName} ({classStudents.length} học sinh)</span>
                          </label>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {classStudents.filter(s => s.attendanceDates.includes(activeDateModal)).length}/{classStudents.length} có mặt
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {classStudents.map(st => {
                          const isAttending = st.attendanceDates.includes(activeDateModal);
                          return (
                            <label
                              key={st.id}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                                isAttending
                                  ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isAttending}
                                  onChange={() => handleToggleAttendance(st, activeDateModal)}
                                  className="w-4.5 h-4.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className={`text-sm font-bold ${isAttending ? 'text-emerald-950' : 'text-slate-800'}`}>
                                  {st.name}
                                </span>
                              </div>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                isAttending ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isAttending ? 'Có mặt' : 'Vắng'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveDateModal(null)}
                className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
              >
                Hoàn tất & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
