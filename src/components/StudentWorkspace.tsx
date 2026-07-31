import React, { useState, useEffect, useMemo } from 'react';
import { Student, Task, MAX_ATTEMPTS } from '../types';
import { shuffleArray } from '../lib/storage';
import { CheckCircle2, RefreshCw, Send, Lock, HelpCircle, FileText, CheckSquare, Edit3 } from 'lucide-react';

interface StudentWorkspaceProps {
  student: Student;
  tasks: Task[];
  onSubmitTask: (taskId: number, studentId: number, answer: string) => void;
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

  // Local state for answers being drafted: taskId -> string or array
  const [draftAnswers, setDraftAnswers] = useState<Record<number, any>>({});

  // Local state for randomized option order per task so options stay stable during radio selection
  const [taskOptionsMap, setTaskOptionsMap] = useState<Record<number, string[]>>({});

  useEffect(() => {
    // Generate shuffled options once per task
    const map: Record<number, string[]> = {};
    studentTasks.forEach(task => {
      if (task.type === 'quiz' && task.options) {
        map[task.id] = shuffleArray(task.options);
      }
    });
    setTaskOptionsMap(map);
  }, [studentTasks]);

  const handleTextChange = (taskId: number, val: string) => {
    setDraftAnswers(prev => ({ ...prev, [taskId]: val }));
  };

  const handleFillChange = (taskId: number, index: number, val: string) => {
    setDraftAnswers(prev => {
      const currentArr = Array.isArray(prev[taskId]) ? [...prev[taskId]] : [];
      currentArr[index] = val;
      return { ...prev, [taskId]: currentArr };
    });
  };

  const handleSubmit = (task: Task) => {
    const studentId = student.id;
    let answerStr = "";

    if (task.type === 'essay') {
      const val = (draftAnswers[task.id] || "").toString().trim();
      if (!val) {
        alert("Em chưa nhập câu trả lời!");
        return;
      }
      answerStr = val;
    } else if (task.type === 'quiz') {
      const val = (draftAnswers[task.id] || "").toString().trim();
      if (!val) {
        alert("Em chưa chọn đáp án nào!");
        return;
      }
      answerStr = val;
    } else if (task.type === 'fill') {
      const fillCount = (task.content.match(/___/g) || []).length;
      const currentArr = Array.isArray(draftAnswers[task.id]) ? draftAnswers[task.id] : [];
      let isFull = true;
      const filledValues: string[] = [];

      for (let i = 0; i < fillCount; i++) {
        const v = (currentArr[i] || "").trim();
        if (!v) isFull = false;
        filledValues.push(v);
      }

      if (!isFull) {
        alert("Em chưa điền kín tất cả các ô trống!");
        return;
      }
      answerStr = filledValues.join(' | ');
    }

    onSubmitTask(task.id, studentId, answerStr);

    // Clear draft for this task
    setDraftAnswers(prev => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-emerald-200/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 tracking-tight">
            Chào em, {student.name}! 👋
          </h2>
          <p className="text-emerald-700 font-semibold mt-1 text-sm flex items-center gap-2">
            <span className="bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
              {student.class}
            </span>
            <span>Dưới đây là các bài tập dành cho em.</span>
          </p>
        </div>
      </div>

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

            return (
              <div
                key={task.id}
                className={`glass-card p-6 border-l-4 shadow-sm transition ${
                  isSubmitted ? 'border-l-emerald-500 bg-white/80' : 'border-l-amber-400 bg-white/70'
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                      <span>Câu {index + 1}:</span>
                      <span>{task.title}</span>
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold border border-slate-200 shadow-2xs flex items-center gap-1">
                        {task.type === 'quiz' ? (
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
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-black tracking-wide shadow-sm flex-shrink-0 ${
                      isSubmitted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-amber-400 text-slate-900 shadow-amber-400/20'
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
                      <strong className="text-emerald-900 text-xs font-bold block mb-1 uppercase tracking-wider">
                        Bài làm lần {attempts} của em:
                      </strong>
                      <div className="font-bold text-emerald-950 text-base leading-relaxed">
                        {sub.answer}
                      </div>
                    </div>

                    {attempts < MAX_ATTEMPTS ? (
                      <button
                        onClick={() => onRedoTask(task.id, student.id)}
                        className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 border border-blue-200"
                      >
                        <RefreshCw className="w-4 h-4" /> Làm lại (Còn {MAX_ATTEMPTS - attempts} lần)
                      </button>
                    ) : (
                      <div className="mt-2 text-red-600 text-xs font-bold bg-red-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200">
                        <Lock className="w-3.5 h-3.5" /> Đã hết số lần làm lại ({MAX_ATTEMPTS}/{MAX_ATTEMPTS}).
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {task.type === 'quiz' && (
                      <div>
                        <div className="p-4 bg-white/90 border border-slate-200/80 rounded-xl text-slate-900 text-lg font-bold mb-4 shadow-2xs">
                          {task.content}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(taskOptionsMap[task.id] || task.options || []).map((opt, idx) => {
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
                                  onChange={() => handleTextChange(task.id, opt)}
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

                    {task.type === 'fill' && (
                      <div>
                        <div className="p-5 bg-white/90 border border-slate-200/80 rounded-xl text-lg text-slate-800 leading-loose font-medium shadow-2xs">
                          {renderFillQuestion(task, draftAnswers[task.id], (i, val) =>
                            handleFillChange(task.id, i, val)
                          )}
                        </div>
                      </div>
                    )}

                    {task.type === 'essay' && (
                      <div>
                        <div className="p-4 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-sm mb-3 font-medium">
                          {task.content}
                        </div>
                        <textarea
                          value={draftAnswers[task.id] || ''}
                          onChange={(e) => handleTextChange(task.id, e.target.value)}
                          placeholder="Viết câu trả lời của em tại đây..."
                          rows={4}
                          className="w-full p-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none bg-white font-medium shadow-inner"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleSubmit(task)}
                      className="btn-success px-8 py-3 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-emerald-600/20 text-sm tracking-wide flex items-center justify-center gap-2 mt-2"
                    >
                      <Send className="w-4 h-4" />
                      {attempts > 0 ? `NỘP LẠI (Lần ${attempts + 1})` : `NỘP BÀI`}
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

// Helper to replace ___ with interactive inputs
function renderFillQuestion(
  task: Task,
  draftArray: any,
  onChange: (index: number, val: string) => void
) {
  const parts = task.content.split('___');
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
            className="inline-block border-b-2 border-emerald-600 bg-emerald-50/80 outline-none px-2 py-0.5 w-28 text-center text-emerald-950 font-black text-base mx-1 rounded-t focus:bg-emerald-100 transition focus:border-emerald-800"
            placeholder="..."
          />
        )}
      </React.Fragment>
    );
  });
}
