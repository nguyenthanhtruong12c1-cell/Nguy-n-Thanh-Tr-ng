import React, { useState } from 'react';
import { TaskType, ALL_CLASSES, Question } from '../types';
import { Send, FileText, HelpCircle, Plus, Trash2, Layers, CheckSquare, Edit3, Clock, ShieldAlert, RotateCcw, Zap, Sparkles, Upload } from 'lucide-react';
import { BulkQuestionImporter } from './BulkQuestionImporter';

interface AddTaskFormProps {
  onAddTask: (
    title: string,
    cls: string,
    type: TaskType,
    content: string,
    options?: string[],
    questions?: Question[],
    maxAttempts?: number,
    durationMinutes?: number,
    antiCheatEnabled?: boolean
  ) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [taskClass, setTaskClass] = useState('KHTN 6');
  const [taskType, setTaskType] = useState<TaskType>('multi');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Settings for exam control & anti-cheat
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState<boolean>(true);

  // Bulk question importer modal state
  const [showBulkImporter, setShowBulkImporter] = useState<boolean>(false);

  // Single quiz options
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');

  // Multi-question list state
  const [multiQuestions, setMultiQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'quiz',
      content: 'Nước hóa lỏng ở nhiệt độ nào dưới áp suất tiêu chuẩn?',
      options: ['0°C', '100°C', '50°C', '-100°C']
    },
    {
      id: 2,
      type: 'fill',
      content: 'Lá cây hấp thụ khí ___ và thải ra khí ___ khi quang hợp.'
    },
    {
      id: 3,
      type: 'essay',
      content: 'Nêu ngắn gọn vai trò của quang hợp đối với sự sống.'
    }
  ]);

  const handleAddQuestion = (type: 'essay' | 'quiz' | 'fill') => {
    const newQ: Question = {
      id: Date.now() + Math.random(),
      type,
      content: '',
      options: type === 'quiz' ? ['', '', '', ''] : undefined
    };
    setMultiQuestions(prev => [...prev, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (multiQuestions.length <= 1) {
      alert("Đề tổng hợp phải có ít nhất 1 câu hỏi!");
      return;
    }
    setMultiQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    setMultiQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleQuestionOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setMultiQuestions(prev => {
      const copy = [...prev];
      const q = copy[qIndex];
      const newOpts = [...(q.options || ['', '', '', ''])];
      newOpts[optIndex] = val;
      copy[qIndex] = { ...q, options: newOpts };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài tập / đề thi!");
      return;
    }

    if (taskType === 'multi') {
      if (multiQuestions.length === 0) {
        alert("Vui lòng thêm ít nhất 1 câu hỏi cho đề tổng hợp!");
        return;
      }

      // Validate all sub-questions
      for (let i = 0; i < multiQuestions.length; i++) {
        const q = multiQuestions[i];
        if (!q.content.trim()) {
          alert(`Vui lòng nhập nội dung cho Câu hỏi ${i + 1}!`);
          return;
        }
        if (q.type === 'quiz') {
          if (!q.options || q.options.some(o => !o.trim())) {
            alert(`Vui lòng điền đủ 4 lựa chọn (A, B, C, D) cho Câu hỏi ${i + 1}!`);
            return;
          }
        }
      }

      onAddTask(
        title.trim(),
        taskClass,
        'multi',
        content.trim() || 'Học sinh làm đầy đủ các câu hỏi trong đề dưới đây:',
        undefined,
        multiQuestions,
        maxAttempts,
        durationMinutes,
        antiCheatEnabled
      );

      alert(`Đã phát hành Đề tổng hợp gồm ${multiQuestions.length} câu hỏi! (Thời gian: ${durationMinutes > 0 ? durationMinutes + ' phút' : 'Tự do'}, Tối đa: ${maxAttempts === 99 ? 'Không giới hạn' : maxAttempts + ' lần'})`);
    } else {
      if (!content.trim()) {
        alert("Vui lòng nhập nội dung câu hỏi!");
        return;
      }

      let opts: string[] | undefined = undefined;
      if (taskType === 'quiz') {
        const optionsArray = [optA.trim(), optB.trim(), optC.trim(), optD.trim()];
        if (optionsArray.some(o => !o)) {
          alert("Vui lòng nhập đầy đủ cả 4 lựa chọn cho câu hỏi trắc nghiệm!");
          return;
        }
        opts = optionsArray;
      }

      onAddTask(
        title.trim(),
        taskClass,
        taskType,
        content.trim(),
        opts,
        undefined,
        maxAttempts,
        durationMinutes,
        antiCheatEnabled
      );
      alert("Đã giao bài tập thành công!");
    }

    // Reset Title & Content
    setTitle('');
    setContent('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 sm:p-8 my-4 shadow-md border border-white/80">
      <div className="flex items-center gap-3 border-b border-purple-200/80 pb-4 mb-6">
        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-purple-900 tracking-tight flex items-center gap-2">
            📝 Giao Bài Tập & Đề Thi Mới
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tạo bài tập đơn lẻ hoặc Đề thi tổng hợp gồm nhiều dạng bài (Trắc nghiệm, Điền khuyết, Tự luận)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Chọn Lớp Hướng Tới
            </label>
            <select
              value={taskClass}
              onChange={(e) => setTaskClass(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
            >
              {ALL_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Hình Thức Bài Tập / Đề
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full p-3 rounded-xl border border-purple-400 font-black text-purple-900 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-purple-50/90"
            >
              <option value="multi">📑 Đề tổng hợp (Nhiều dạng bài trong 1 đề)</option>
              <option value="essay">✍️ Tự luận đơn</option>
              <option value="quiz">✅ Trắc nghiệm đơn</option>
              <option value="fill">📝 Điền khuyết đơn</option>
            </select>
          </div>
        </div>

        {/* CẤU HÌNH THỜI GIAN, SỐ LẦN LÀM & CHỐNG GIAN LẬN */}
        <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200/90 space-y-3">
          <div className="text-xs font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Cấu Hình Bài Thi, Giám Sát & Chống Gian Lận
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Max Attempts */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> Số lần làm bài tối đa
              </label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full text-xs font-bold p-2 rounded-lg border border-slate-300 bg-slate-50 outline-none text-slate-800"
              >
                <option value={1}>1 lần (Bài thi nghiêm túc)</option>
                <option value={2}>2 lần</option>
                <option value={3}>3 lần</option>
                <option value={5}>5 lần</option>
                <option value={99}>Không giới hạn (Luyện tập)</option>
              </select>
            </div>

            {/* Time Limit */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Thời gian làm bài
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs font-bold p-2 rounded-lg border border-slate-300 bg-slate-50 outline-none text-slate-800"
              >
                <option value={0}>Không giới hạn thời gian</option>
                <option value={15}>15 phút (Kiểm tra 15p)</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút (Kiểm tra 1 tiết)</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút (Thi học kỳ)</option>
              </select>
            </div>

            {/* Anti-cheat toggle */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Chống gian lận
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={antiCheatEnabled}
                  onChange={(e) => setAntiCheatEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  {antiCheatEnabled ? '🟢 Đang Bật Giám Sát' : '⚪ Tắt giám sát'}
                </span>
              </label>
            </div>
          </div>

          {antiCheatEnabled && (
            <div className="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200 font-medium leading-relaxed">
              🛡️ <strong>Tính năng giám sát kích hoạt:</strong> Tự động đếm ngược thời gian, cảnh báo khi học sinh rời màn hình hoặc chuyển tab, ghi nhận nhật ký vi phạm cho giáo viên.
            </div>
          )}
        </div>

        {/* BULK QUESTION IMPORT BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full inline-block mb-1">
              🚀 Công cụ tiết kiệm 90% thời gian
            </span>
            <h3 className="font-black text-base text-white">
              Tải File hoặc Dán Văn Bản Hàng Loạt Câu Hỏi
            </h3>
            <p className="text-xs text-purple-100 font-medium">
              Tự động bóc tách thành đề thi gồm nhiều câu trắc nghiệm, tự luận & điền khuyết
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkImporter(true)}
            className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <Zap className="w-4 h-4 text-purple-600" />
            Nhập Hàng Loạt Ngay
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Tiêu đề đề thi / bài tập
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              taskType === 'multi'
                ? "VD: Đề thi Giữa kỳ Sinh học KHTN 6 (Tổng hợp)"
                : "VD: Bài tập Trắc nghiệm Bài 5"
            }
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {taskType === 'multi' ? "Hướng dẫn chung cho đề thi" : "Nội dung câu hỏi"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={taskType === 'multi' ? 2 : 3}
            placeholder={
              taskType === 'multi'
                ? "Nhập lời dặn cho học sinh (VD: Thời gian làm bài 45 phút, hoàn thành tất cả các câu bên dưới)..."
                : taskType === 'fill'
                ? "Gõ câu hỏi và dùng ___ cho ô trống, VD: Hôm nay là ngày ___ tháng ___ năm ___."
                : "Nhập nội dung câu hỏi..."
            }
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
          />
        </div>

        {/* MULTI-QUESTION BUILDER */}
        {taskType === 'multi' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-200 pb-2">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Danh Sách Câu Hỏi Trong Đề ({multiQuestions.length} câu)
              </h3>

              {/* Quick Add Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('quiz')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition flex items-center gap-1 border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Trắc nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('fill')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition flex items-center gap-1 border border-purple-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Điền khuyết
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('essay')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition flex items-center gap-1 border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Tự luận
                </button>
              </div>
            </div>

            {/* List of sub-questions */}
            <div className="space-y-4">
              {multiQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 shadow-2xs space-y-3 relative group"
                >
                  <div className="flex justify-between items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">Câu {idx + 1}</span>

                      {/* Question Type Selector */}
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                        className="text-xs font-bold p-1 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
                      >
                        <option value="quiz">✅ Trắc nghiệm</option>
                        <option value="fill">📝 Điền khuyết</option>
                        <option value="essay">✍️ Tự luận</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Content Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nội dung câu hỏi:
                    </label>
                    <textarea
                      value={q.content}
                      onChange={(e) => handleQuestionChange(idx, 'content', e.target.value)}
                      rows={2}
                      placeholder={
                        q.type === 'fill'
                          ? "Nhập câu hỏi có chứa ___ để học sinh điền từ..."
                          : "Nhập nội dung câu hỏi..."
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium bg-white outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Fill type tip */}
                  {q.type === 'fill' && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Dùng 3 dấu gạch dưới <code className="bg-amber-100 font-mono px-1 rounded">___</code> làm vị trí ô trống.</span>
                    </div>
                  )}

                  {/* Quiz Options */}
                  {q.type === 'quiz' && (
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-600 block">4 Lựa chọn câu trả lời:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((label, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-400 w-4 text-center">{label}.</span>
                            <input
                              type="text"
                              value={(q.options && q.options[optIdx]) || ''}
                              onChange={(e) => handleQuestionOptionChange(idx, optIdx, e.target.value)}
                              placeholder={`Đáp án (${label})`}
                              className="w-full p-2 border border-slate-300 rounded-md text-xs bg-slate-50 focus:bg-white outline-none focus:border-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Add Question Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleAddQuestion('quiz')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-2xs"
              >
                <Plus className="w-4 h-4 text-purple-600" /> Thêm Câu Hỏi Mới
              </button>
            </div>
          </div>
        )}

        {/* SINGLE QUESTION QUIZ OPTIONS */}
        {taskType === 'quiz' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-600 block">4 Lựa chọn trắc nghiệm:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Đáp án 1 (A)"
                className="p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Đáp án 2 (B)"
                className="p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="Đáp án 3 (C)"
                className="p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder="Đáp án 4 (D)"
                className="p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* SINGLE FILL TIP */}
        {taskType === 'fill' && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Mẹo: Gõ 3 dấu gạch dưới <strong className="font-mono bg-amber-100 px-1 rounded">___</strong> để tạo chỗ trống cho học sinh điền từ.
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 mt-4"
        >
          <Send className="w-5 h-5" /> Phát Hành {taskType === 'multi' ? `Đề Thi (${multiQuestions.length} câu)` : 'Bài Tập'}
        </button>
      </form>

      {/* BULK QUESTION IMPORTER MODAL */}
      {showBulkImporter && (
        <BulkQuestionImporter
          onClose={() => setShowBulkImporter(false)}
          onImportQuestions={(imported) => {
            setMultiQuestions(imported);
            setTaskType('multi');
            if (!title.trim()) {
              setTitle(`Đề thi Tổng hợp (${imported.length} câu)`);
            }
            alert(`Đã tự động nhập ${imported.length} câu hỏi vào đề thi! Thầy/cô có thể kiểm tra và phát hành ngay.`);
          }}
        />
      )}
    </div>
  );
};

