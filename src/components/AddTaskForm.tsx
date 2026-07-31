import React, { useState } from 'react';
import { TaskType, ALL_CLASSES } from '../types';
import { Send, FileText, HelpCircle } from 'lucide-react';

interface AddTaskFormProps {
  onAddTask: (
    title: string,
    cls: string,
    type: TaskType,
    content: string,
    options?: string[]
  ) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [taskClass, setTaskClass] = useState('KHTN 6');
  const [taskType, setTaskType] = useState<TaskType>('essay');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung bài tập!");
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

    onAddTask(title.trim(), taskClass, taskType, content.trim(), opts);
    alert("Đã giao bài tập thành công!");

    // Reset inputs
    setTitle('');
    setContent('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 my-4 shadow-md border border-white/80">
      <div className="flex items-center gap-3 border-b border-purple-200/80 pb-4 mb-6">
        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-purple-900 tracking-tight">📝 Giao Bài Tập Mới</h2>
          <p className="text-xs text-slate-500 font-medium">Tạo câu hỏi trắc nghiệm, điền khuyết hoặc tự luận cho học sinh</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Chọn Lớp
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
              Dạng Bài Tập
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full p-3 rounded-xl border border-purple-300 font-bold text-purple-900 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-purple-50/80"
            >
              <option value="essay">✍️ Tự luận</option>
              <option value="quiz">✅ Trắc nghiệm</option>
              <option value="fill">📝 Điền khuyết</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Tiêu đề bài tập
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra 15 phút Sinh học"
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Nội dung câu hỏi
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder={
              taskType === 'fill'
                ? "Gõ câu hỏi và dùng ___ cho ô trống, VD: Hôm nay là ngày ___ tháng ___ năm ___."
                : "Nhập câu hỏi hoặc đề bài..."
            }
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
          />
        </div>

        {taskType === 'fill' && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Mẹo: Gõ 3 dấu gạch dưới <strong className="font-mono bg-amber-100 px-1 rounded">___</strong> để tạo chỗ trống cho học sinh điền từ.
            </span>
          </div>
        )}

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

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 mt-4"
        >
          <Send className="w-5 h-5" /> Phát Hành Bài Tập
        </button>
      </form>
    </div>
  );
};
