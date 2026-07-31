import React, { useState, useEffect, useMemo } from 'react';
import { Student, Task, Question, ProctorLog } from '../types';
import { shuffleArray } from '../lib/storage';
import {
  CheckCircle2,
  RefreshCw,
  Send,
  Lock,
  HelpCircle,
  FileText,
  CheckSquare,
  Edit3,
  Layers,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Eye,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';

interface StudentWorkspaceProps {
  student: Student;
  tasks: Task[];
  onSubmitTask: (
    taskId: number,
    studentId: number,
    answer: string,
    proctorData?: {
      tabSwitchCount?: number;
      timeSpentSeconds?: number;
      proctorLogs?: ProctorLog[];
    }
  ) => void;
  onRedoTask: (taskId: number, studentId: number) => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  student,
  tasks,
  onSubmitTask,
  onRedoTask,
}) => {
  // Filter tasks for this student's class
  const studentTasks = useMemo(() => {
    const classTasks = tasks.filter(t => t.class === student.class);
    return shuffleArray(classTasks);
  }, [tasks, student.class]);

  // Local state for answers being drafted
  const [draftAnswers, setDraftAnswers] = useState<Record<string, any>>({});

  // Local state for randomized option order per task or question
  const [optionsMap, setOptionsMap] = useState<Record<string, string[]>>({});

  // --- ANTI-CHEAT & TIMER STATE ---
  // Remaining seconds per task: taskId -> seconds
  const [timers, setTimers] = useState<Record<number, number>>({});
  // Elapsed working time per task: taskId -> seconds
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  // Tab switch count per task: taskId -> number
  const [tabSwitches, setTabSwitches] = useState<Record<number, number>>({});
  // Proctor logs per task: taskId -> ProctorLog[]
  const [proctorLogs, setProctorLogs] = useState<Record<number, ProctorLog[]>>({});
  // Active warning popup
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  // Initialize timers & randomized options
  useEffect(() => {
    const map: Record<string, string[]> = {};

    studentTasks.forEach(task => {
      if (task.type === 'quiz' && task.options) {
        map[`task_${task.id}`] = shuffleArray(task.options);
      }
      if (task.questions) {
        task.questions.forEach(q => {
          if (q.type === 'quiz' && q.options) {
            map[`q_${task.id}_${q.id}`] = shuffleArray(q.options);
          }
        });
      }

      // Initialize timer if task has duration and unsubmitted
      const sub = task.submissions[student.id];
      const isUnsubmitted = !sub || sub.redoing;
      if (isUnsubmitted && task.durationMinutes && task.durationMinutes > 0) {
        setTimers(prev => {
          if (prev[task.id] === undefined) {
            return { ...prev, [task.id]: task.durationMinutes! * 60 };
          }
          return prev;
        });
      }
    });

    setOptionsMap(map);
  }, [studentTasks, student.id]);

  // Timer Tick Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const next = { ...prevTimers };
        let hasChanges = false;

        studentTasks.forEach(task => {
          const sub = task.submissions[student.id];
          const isUnsubmitted = !sub || sub.redoing;

          if (isUnsubmitted && next[task.id] !== undefined && next[task.id] > 0) {
            next[task.id] -= 1;
            hasChanges = true;

            // Increment spent time
            setTimeSpent(prev => ({
              ...prev,
              [task.id]: (prev[task.id] || 0) + 1,
            }));

            // Auto submit on 0 seconds
            if (next[task.id] === 0) {
              alert(`⏰ HẾT GIỜ LÀM BÀI! Bài thi "${task.title}" đã hết ${task.durationMinutes} phút và sẽ tự động được nộp.`);
              handleSubmit(task, true);
            }
          }
        });

        return hasChanges ? next : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [studentTasks, student.id, draftAnswers]);

  // Tab Switch & Visibility Change Anti-Cheat Listener
  useEffect(() => {
    const handleAntiCheatTrigger = () => {
      studentTasks.forEach(task => {
        const sub = task.submissions[student.id];
        const isUnsubmitted = !sub || sub.redoing;

        if (isUnsubmitted && task.antiCheatEnabled) {
          const nowTime = new Date().toLocaleTimeString('vi-VN');

          setTabSwitches(prev => {
            const currentCount = prev[task.id] || 0;
            const newCount = currentCount + 1;

            const newLog: ProctorLog = {
              timestamp: nowTime,
              event: `Phát hiện rời màn hình / chuyển tab (Lần ${newCount})`,
              type: 'warning',
            };

            setProctorLogs(pLogs => ({
              ...pLogs,
              [task.id]: [...(pLogs[task.id] || []), newLog],
            }));

            setCheatWarning(
              `⚠️ CẢNH BÁO GIÁM SÁT: Em vừa chuyển tab hoặc rời khỏi màn hình thi! (Lần ${newCount}). Thao tác đã được hệ thống lưu vết gửi Giáo viên.`
            );

            return { ...prev, [task.id]: newCount };
          });
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAntiCheatTrigger();
      }
    };

    const handleWindowBlur = () => {
      handleAntiCheatTrigger();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [studentTasks, student.id]);

  const handleSingleTextChange = (key: string | number, val: string) => {
    setDraftAnswers(prev => ({ ...prev, [key.toString()]: val }));
  };

  const handleSingleFillChange = (key: string | number, index: number, val: string) => {
    const k = key.toString();
    setDraftAnswers(prev => {
      const currentArr = Array.isArray(prev[k]) ? [...prev[k]] : [];
      currentArr[index] = val;
      return { ...prev, [k]: currentArr };
    });
  };

  const handleSubmit = (task: Task, isAutoSubmit = false) => {
    const studentId = student.id;

    let answerStr = '';

    // Check multi-question
    if (task.type === 'multi' && task.questions && task.questions.length > 0) {
      const formattedAnswers: string[] = [];

      for (let i = 0; i < task.questions.length; i++) {
        const q = task.questions[i];
        const qKey = `${task.id}_q_${q.id}`;
        const val = draftAnswers[qKey];

        if (q.type === 'quiz') {
          const strVal = (val || '').toString().trim();
          if (!strVal && !isAutoSubmit) {
            alert(`Em chưa làm Câu ${i + 1} (Trắc nghiệm)!`);
            return;
          }
          formattedAnswers.push(`Câu ${i + 1} [Trắc nghiệm]: ${strVal || '(Chưa chọn)'}`);
        } else if (q.type === 'essay') {
          const strVal = (val || '').toString().trim();
          if (!strVal && !isAutoSubmit) {
            alert(`Em chưa trả lời Câu ${i + 1} (Tự luận)!`);
            return;
          }
          formattedAnswers.push(`Câu ${i + 1} [Tự luận]: ${strVal || '(Chưa điền)'}`);
        } else if (q.type === 'fill') {
          const fillCount = (q.content.match(/___/g) || []).length;
          const currentArr = Array.isArray(val) ? val : [];
          let isFull = true;
          const filledValues: string[] = [];

          for (let f = 0; f < fillCount; f++) {
            const v = (currentArr[f] || '').trim();
            if (!v) isFull = false;
            filledValues.push(v || '...');
          }

          if (!isFull && !isAutoSubmit) {
            alert(`Em chưa điền đủ các ô trống ở Câu ${i + 1} (Điền khuyết)!`);
            return;
          }
          formattedAnswers.push(`Câu ${i + 1} [Điền khuyết]: ${filledValues.join(' | ')}`);
        }
      }

      answerStr = formattedAnswers.join('\n');
    } else {
      // Single Question
      if (task.type === 'essay') {
        const val = (draftAnswers[task.id] || '').toString().trim();
        if (!val && !isAutoSubmit) {
          alert('Em chưa nhập câu trả lời!');
          return;
        }
        answerStr = val || '(Chưa điền câu trả lời)';
      } else if (task.type === 'quiz') {
        const val = (draftAnswers[task.id] || '').toString().trim();
        if (!val && !isAutoSubmit) {
          alert('Em chưa chọn đáp án nào!');
          return;
        }
        answerStr = val || '(Chưa chọn đáp án)';
      } else if (task.type === 'fill') {
        const fillCount = (task.content.match(/___/g) || []).length;
        const currentArr = Array.isArray(draftAnswers[task.id]) ? draftAnswers[task.id] : [];
        let isFull = true;
        const filledValues: string[] = [];

        for (let i = 0; i < fillCount; i++) {
          const v = (currentArr[i] || '').trim();
          if (!v) isFull = false;
          filledValues.push(v || '...');
        }

        if (!isFull && !isAutoSubmit) {
          alert('Em chưa điền kín tất cả các ô trống!');
          return;
        }
        answerStr = filledValues.join(' | ');
      }
    }

    const taskSwitches = tabSwitches[task.id] || 0;
    const taskSpent = timeSpent[task.id] || 0;
    const taskLogs = proctorLogs[task.id] || [];

    // Final completion log entry
    const finalLogs: ProctorLog[] = [
      ...taskLogs,
      {
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        event: isAutoSubmit ? 'Hết giờ - Hệ thống tự động thu bài' : 'Học sinh bấm Nộp bài thành công',
        type: 'info',
      },
    ];

    onSubmitTask(task.id, studentId, answerStr, {
      tabSwitchCount: taskSwitches,
      timeSpentSeconds: taskSpent,
      proctorLogs: finalLogs,
    });

    // Clear drafts
    setDraftAnswers(prev => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER & WELCOME */}
      <div className="border-b border-emerald-200/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 tracking-tight">
            Chào em, {student.name}! 👋
          </h2>
          <p className="text-emerald-700 font-semibold mt-1 text-sm flex items-center gap-2">
            <span className="bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 font-bold">
              {student.class}
            </span>
            <span>Giao diện bài tập & kiểm tra trực tuyến.</span>
          </p>
        </div>
      </div>

      {/* ANTI-CHEAT ALERT POPUP BANNER */}
      {cheatWarning && (
        <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl border-2 border-red-300 flex items-start justify-between gap-3 animate-bounce">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-base text-yellow-200 uppercase tracking-wide">
                Cảnh Báo Giám Sát Chống Gian Lận!
              </h4>
              <p className="text-sm font-medium mt-0.5 leading-snug">{cheatWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setCheatWarning(null)}
            className="bg-red-800 hover:bg-red-900 p-1.5 rounded-lg text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {studentTasks.length === 0 ? (
        <div className="glass-card p-8 text-center text-emerald-800 font-bold text-lg border border-emerald-200">
          🎉 Tuyệt vời! Hiện tại em chưa có bài tập nào cho lớp {student.class}.
        </div>
      ) : (
        <div className="space-y-6">
          {studentTasks.map((task, index) => {
            const sub = task.submissions[student.id];
            const isSubmitted = sub !== undefined && !sub.redoing;
            const attempts = sub ? sub.count : 0;
            const maxAllowed = task.maxAttempts ?? 1;
            const isMulti = task.type === 'multi' || (task.questions && task.questions.length > 0);

            return (
              <div
                key={task.id}
                className={`glass-card p-6 border-l-4 shadow-sm transition ${
                  isSubmitted ? 'border-l-emerald-500 bg-white/80' : 'border-l-purple-500 bg-white/80'
                }`}
              >
                {/* PROCTORING TOP BANNER FOR ACTIVE EXAM */}
                {!isSubmitted && (task.antiCheatEnabled || (task.durationMinutes && task.durationMinutes > 0)) && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-3 rounded-xl mb-4 gap-2 text-xs shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="font-bold tracking-wider text-red-300 uppercase">
                        {task.antiCheatEnabled ? '🛡️ GIÁM SÁT TRỰC TUYẾN' : '⏱️ BÀI THI CÓ TÍNH GIỜ'}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300 font-medium">
                        Tối đa: <strong className="text-amber-300">{maxAllowed === 99 ? 'Không giới hạn' : `${maxAllowed} lần`}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tab switch counter badge */}
                      {task.antiCheatEnabled && (
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 ${
                            (tabSwitches[task.id] || 0) > 0
                              ? 'bg-red-500/90 text-white'
                              : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Rời màn hình: {tabSwitches[task.id] || 0} lần
                        </span>
                      )}

                      {/* Live Timer if set */}
                      {task.durationMinutes !== undefined && task.durationMinutes > 0 && (
                        <span
                          className={`px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1.5 ${
                            (timers[task.id] || 0) <= 300
                              ? 'bg-red-600 animate-pulse text-white'
                              : 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-300" /> Còn lại: {formatTimer(timers[task.id] ?? task.durationMinutes * 60)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* TASK TITLE BAR */}
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                      <span>Đề {index + 1}:</span>
                      <span>{task.title}</span>
                    </h3>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold border border-slate-200 shadow-2xs flex items-center gap-1">
                        {isMulti ? (
                          <>
                            <Layers className="w-3.5 h-3.5 text-purple-600" /> Đề tổng hợp ({task.questions?.length || 0} câu)
                          </>
                        ) : task.type === 'quiz' ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> Trắc nghiệm
                          </>
                        ) : task.type === 'fill' ? (
                          <>
                            <Edit3 className="w-3.5 h-3.5 text-purple-600" /> Điền khuyết
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5 text-emerald-600" /> Tự luận
                          </>
                        )}
                      </span>

                      {task.durationMinutes !== undefined && task.durationMinutes > 0 && (
                        <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-bold border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> {task.durationMinutes} phút
                        </span>
                      )}

                      <span className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-bold border border-blue-200 flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> Cho phép: {maxAllowed === 99 ? 'Không giới hạn' : `${maxAllowed} lần`}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-black tracking-wide shadow-sm flex-shrink-0 ${
                      isSubmitted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-purple-600 text-white shadow-purple-600/20'
                    }`}
                  >
                    {isSubmitted ? 'ĐÃ NỘP' : 'ĐANG LÀM'}
                  </span>
                </div>

                {isSubmitted ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl text-slate-800 text-base font-medium">
                      {task.content}
                    </div>

                    <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-xl shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-emerald-900 text-xs font-bold uppercase tracking-wider">
                          Bài làm lần {attempts} của em:
                        </strong>
                        {sub.tabSwitchCount !== undefined && sub.tabSwitchCount > 0 && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Ghi nhận {sub.tabSwitchCount} lần rời màn hình
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-emerald-950 text-base leading-relaxed whitespace-pre-line">
                        {sub.answer}
                      </div>
                    </div>

                    {attempts < maxAllowed ? (
                      <button
                        onClick={() => onRedoTask(task.id, student.id)}
                        className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 border border-blue-200"
                      >
                        <RefreshCw className="w-4 h-4" /> Làm lại bài này (Còn {maxAllowed - attempts} lần)
                      </button>
                    ) : (
                      <div className="mt-2 text-red-600 text-xs font-bold bg-red-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200">
                        <Lock className="w-3.5 h-3.5" /> Đã hết số lần làm bài tối đa ({attempts}/{maxAllowed === 99 ? 'Không giới hạn' : maxAllowed}).
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Multi Question Assignment View */}
                    {isMulti && task.questions && (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl text-purple-950 text-sm font-medium">
                          📌 <strong>Hướng dẫn:</strong> {task.content}
                        </div>

                        {task.questions.map((q, qIdx) => {
                          const qKey = `${task.id}_q_${q.id}`;
                          const qOptions = optionsMap[`q_${task.id}_${q.id}`] || q.options || [];

                          return (
                            <div
                              key={q.id}
                              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white/90 shadow-2xs space-y-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-white">
                                  Câu {qIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  {q.type === 'quiz' ? 'Trắc nghiệm' : q.type === 'fill' ? 'Điền khuyết' : 'Tự luận'}
                                </span>
                              </div>

                              {/* Question Content */}
                              {q.type !== 'fill' && (
                                <p className="font-bold text-slate-900 text-base leading-snug">
                                  {q.content}
                                </p>
                              )}

                              {/* Quiz choices */}
                              {q.type === 'quiz' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                  {qOptions.map((opt, optIdx) => {
                                    const labels = ['A', 'B', 'C', 'D'];
                                    const isChecked = draftAnswers[qKey] === opt;
                                    return (
                                      <label
                                        key={optIdx}
                                        className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border text-sm transition ${
                                          isChecked
                                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-2xs'
                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`q_radio_${qKey}`}
                                          value={opt}
                                          checked={isChecked}
                                          onChange={() => handleSingleTextChange(qKey, opt)}
                                          className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-bold text-slate-400 text-xs">
                                          {labels[optIdx] || optIdx + 1}.
                                        </span>
                                        <span className="font-bold text-slate-800">{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Fill choices */}
                              {q.type === 'fill' && (
                                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl text-base text-slate-800 leading-loose font-medium">
                                  {renderCustomFillQuestion(q.content, draftAnswers[qKey], (fIdx, val) =>
                                    handleSingleFillChange(qKey, fIdx, val)
                                  )}
                                </div>
                              )}

                              {/* Essay choice */}
                              {q.type === 'essay' && (
                                <textarea
                                  value={draftAnswers[qKey] || ''}
                                  onChange={(e) => handleSingleTextChange(qKey, e.target.value)}
                                  placeholder="Viết câu trả lời cho câu hỏi này..."
                                  rows={3}
                                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm outline-none bg-white font-medium"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Single Question Quiz */}
                    {!isMulti && task.type === 'quiz' && (
                      <div>
                        <div className="p-4 bg-white/90 border border-slate-200/80 rounded-xl text-slate-900 text-lg font-bold mb-4 shadow-2xs">
                          {task.content}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(optionsMap[`task_${task.id}`] || task.options || []).map((opt, idx) => {
                            const labels = ['A', 'B', 'C', 'D'];
                            const isChecked = draftAnswers[task.id] === opt;
                            return (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border transition ${
                                  isChecked
                                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz_${task.id}`}
                                  value={opt}
                                  checked={isChecked}
                                  onChange={() => handleSingleTextChange(task.id, opt)}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-black text-slate-400 text-sm">
                                  {labels[idx] || (idx + 1)}.
                                </span>
                                <span className="text-slate-800 font-bold text-sm">
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Single Question Fill */}
                    {!isMulti && task.type === 'fill' && (
                      <div>
                        <div className="p-5 bg-white/90 border border-slate-200/80 rounded-xl text-lg text-slate-800 leading-loose font-medium shadow-2xs">
                          {renderFillQuestion(task, draftAnswers[task.id], (i, val) =>
                            handleSingleFillChange(task.id, i, val)
                          )}
                        </div>
                      </div>
                    )}

                    {/* Single Question Essay */}
                    {!isMulti && task.type === 'essay' && (
                      <div>
                        <div className="p-4 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-sm mb-3 font-medium">
                          {task.content}
                        </div>
                        <textarea
                          value={draftAnswers[task.id] || ''}
                          onChange={(e) => handleSingleTextChange(task.id, e.target.value)}
                          placeholder="Viết câu trả lời của em tại đây..."
                          rows={4}
                          className="w-full p-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm outline-none bg-white font-medium shadow-inner"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleSubmit(task)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-xl font-bold w-full shadow-lg shadow-purple-600/20 text-sm tracking-wide flex items-center justify-center gap-2 mt-2 transition"
                    >
                      <Send className="w-4 h-4" />
                      {attempts > 0
                        ? `NỘP LẠI (Lần ${attempts + 1})`
                        : isMulti
                        ? `NỘP TOÀN BỘ ĐỀ THI (${task.questions?.length || 0} câu)`
                        : `NỘP BÀI`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper for task fill question
function renderFillQuestion(
  task: Task,
  draftArray: any,
  onChange: (index: number, val: string) => void
) {
  return renderCustomFillQuestion(task.content, draftArray, onChange);
}

// Helper to replace ___ with interactive inputs for any content string
function renderCustomFillQuestion(
  contentStr: string,
  draftArray: any,
  onChange: (index: number, val: string) => void
) {
  const parts = contentStr.split('___');
  const values = Array.isArray(draftArray) ? draftArray : [];

  return parts.map((part, index) => {
    return (
      <React.Fragment key={index}>
        <span>{part}</span>
        {index < parts.length - 1 && (
          <input
            type="text"
            value={values[index] || ''}
            onChange={(e) => onChange(index, e.target.value)}
            className="inline-block border-b-2 border-purple-600 bg-purple-50/80 outline-none px-2 py-0.5 w-28 text-center text-purple-950 font-black text-base mx-1 rounded-t focus:bg-purple-100 transition focus:border-purple-800"
            placeholder="..."
          />
        )}
      </React.Fragment>
    );
  });
}
