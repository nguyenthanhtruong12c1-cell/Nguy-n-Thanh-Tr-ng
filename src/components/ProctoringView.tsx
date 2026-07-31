import React, { useState } from 'react';
import { Student, Task, ProctorLog } from '../types';
import {
  ShieldAlert,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Filter,
  Monitor,
  Activity,
  Search,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface ProctoringViewProps {
  students: Student[];
  tasks: Task[];
  onSelectStudent?: (studentId: number) => void;
}

export const ProctoringView: React.FC<ProctoringViewProps> = ({
  students,
  tasks,
  onSelectStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedClass !== 'all' && t.class !== selectedClass) return false;
    if (selectedTaskId !== 'all' && t.id.toString() !== selectedTaskId) return false;
    return true;
  });

  // Calculate proctoring stats
  let totalSubmissions = 0;
  let totalViolations = 0;
  let activeStudentsCount = 0;

  const studentMonitors: Array<{
    student: Student;
    task: Task;
    submission?: any;
    status: 'safe' | 'warning' | 'submitted';
    tabSwitches: number;
    logs: ProctorLog[];
  }> = [];

  students.forEach(st => {
    if (selectedClass !== 'all' && st.class !== selectedClass) return;
    if (searchTerm && !st.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) return;

    // Find tasks for this student's class
    const stTasks = tasks.filter(t => t.class === st.class);

    stTasks.forEach(tk => {
      if (selectedTaskId !== 'all' && tk.id.toString() !== selectedTaskId) return;

      const sub = tk.submissions[st.id];
      const switches = sub?.tabSwitchCount || 0;
      const logs = sub?.proctorLogs || [];

      let status: 'safe' | 'warning' | 'submitted' = 'safe';
      if (sub && !sub.redoing) {
        status = 'submitted';
        totalSubmissions++;
      } else if (switches > 0) {
        status = 'warning';
        totalViolations++;
        activeStudentsCount++;
      } else {
        activeStudentsCount++;
      }

      studentMonitors.push({
        student: st,
        task: tk,
        submission: sub,
        status,
        tabSwitches: switches,
        logs,
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-red-200/80 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-red-950 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
            Bảng Giám Sát Live & Chống Gian Lận
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Theo dõi thời gian thực hoạt động màn hình, chuyển tab và lịch sử vi phạm thi của học sinh
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-100/80 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-900">
          <Activity className="w-4 h-4 text-red-600 animate-ping" />
          <span>LIVE PROCTORING ACTIVE</span>
        </div>
      </div>

      {/* OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase block">Tổng Lượt Thi</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{studentMonitors.length}</div>
          <span className="text-[11px] text-slate-400">Danh sách bài tập & thi</span>
        </div>

        <div className="glass-card p-4 border border-emerald-200 bg-emerald-50/60">
          <span className="text-xs font-bold text-emerald-800 uppercase block">Đã Nộp Bài</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{totalSubmissions}</div>
          <span className="text-[11px] text-emerald-600">Bài thi đã hoàn tất</span>
        </div>

        <div className="glass-card p-4 border border-amber-200 bg-amber-50/60">
          <span className="text-xs font-bold text-amber-900 uppercase block">Đang Làm Bài</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{activeStudentsCount}</div>
          <span className="text-[11px] text-amber-600">Đang thao tác trên màn hình</span>
        </div>

        <div className="glass-card p-4 border border-red-200 bg-red-50/60">
          <span className="text-xs font-bold text-red-900 uppercase block">Cảnh Báo Chuyển Tab</span>
          <div className="text-2xl font-black text-red-600 mt-1">{totalViolations}</div>
          <span className="text-[11px] text-red-700 font-bold">Học sinh có vết vi phạm</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-card p-4 border border-slate-200/90 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Lọc theo:</span>
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-800 outline-none w-full sm:w-auto"
        >
          <option value="all">Tất cả Khối / Lớp</option>
          {Array.from(new Set(tasks.map(t => t.class))).map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        {/* Task Filter */}
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-800 outline-none w-full sm:w-auto"
        >
          <option value="all">Tất cả Bài Thi / Bài Tập</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.title} ({t.class})</option>
          ))}
        </select>

        {/* Search Student */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 font-medium text-xs bg-white outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* STUDENT MONITOR CARDS GRID */}
      {studentMonitors.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <Monitor className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
          <p className="font-bold text-slate-600">Chưa có dữ liệu giám sát thi phù hợp bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentMonitors.map(({ student, task, submission, status, tabSwitches, logs }, idx) => {
            const isSubmitted = status === 'submitted';
            const isWarning = tabSwitches > 0;

            return (
              <div
                key={`${student.id}_${task.id}_${idx}`}
                className={`glass-card rounded-2xl border-2 p-5 shadow-sm space-y-4 transition ${
                  isWarning
                    ? 'border-red-400 bg-red-50/30'
                    : isSubmitted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Header Info */}
                <div className="flex justify-between items-start gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-md">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>{student.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                          {student.class}
                        </span>
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 truncate max-w-xs mt-0.5">
                        Đề: {task.title}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black tracking-wide flex items-center gap-1.5 shadow-2xs ${
                      isSubmitted
                        ? 'bg-emerald-600 text-white'
                        : isWarning
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ NỘP BÀI
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> VI PHẠM (RỜI TAB)
                      </>
                    ) : (
                      <>
                        <Monitor className="w-3.5 h-3.5" /> ĐANG THI AN TOÀN
                      </>
                    )}
                  </span>
                </div>

                {/* LIVE SIMULATED SCREEN PREVIEW FRAME */}
                <div className="rounded-xl bg-slate-950 p-3 text-slate-100 shadow-inner font-mono text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Monitor className="w-3.5 h-3.5 text-blue-400" />
                      Màn hình xem trước của {student.name}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Stream
                    </span>
                  </div>

                  {/* Screen snapshot status */}
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Trạng thái cửa sổ:</span>
                      <span className={`font-bold ${isWarning ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isWarning ? `⚠️ Phát hiện chuyển tab (${tabSwitches} lần)` : '🟢 Focus cửa sổ bài thi'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Cấu hình thời gian:</span>
                      <span className="text-amber-300 font-bold">
                        {task.durationMinutes ? `${task.durationMinutes} phút` : 'Tự do'}
                      </span>
                    </div>

                    {submission?.answer && (
                      <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-300">
                        <span className="text-slate-400 block mb-0.5">Nội dung bài làm gần nhất:</span>
                        <p className="bg-slate-950 p-2 rounded text-emerald-300 italic line-clamp-2">
                          "{submission.answer}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PROCTOR LOGS TIMELINE */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> Nhật ký thao tác thi ({logs.length} sự kiện):
                  </span>

                  {logs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Chưa ghi nhận sự kiện vi phạm nào.</p>
                  ) : (
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {logs.map((log, lIdx) => (
                        <div
                          key={lIdx}
                          className={`text-[11px] p-1.5 rounded flex items-center justify-between font-medium ${
                            log.type === 'warning'
                              ? 'bg-red-100 text-red-900 font-bold border border-red-200'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span className="truncate pr-2">• {log.event}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-2 pt-1">
                  {onSelectStudent && (
                    <button
                      onClick={() => onSelectStudent(student.id)}
                      className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" /> Xem trang hồ sơ học sinh
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
