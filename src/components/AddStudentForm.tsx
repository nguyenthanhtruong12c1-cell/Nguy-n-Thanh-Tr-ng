import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';

interface AddStudentFormProps {
  onAddStudent: (name: string, studentClass: string) => void;
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAddStudent }) => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('KHTN 6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Vui lòng nhập tên học sinh!");
      return;
    }
    onAddStudent(trimmed, studentClass);
    setName('');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 sm:p-8 my-6 shadow-md border border-white/80">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-blue-900 tracking-tight">Thêm Học Viên Mới</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Nhập tên và chọn lớp để tạo hồ sơ quản lý
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Họ và Tên Học Viên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
            placeholder="VD: Nguyễn Văn A"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Khối / Lớp học
          </label>
          <select
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
          >
            <optgroup label="Tiểu học">
              <option value="Lớp 1">Lớp 1</option>
              <option value="Lớp 2">Lớp 2</option>
              <option value="Lớp 3">Lớp 3</option>
              <option value="Lớp 4">Lớp 4</option>
              <option value="Lớp 5">Lớp 5</option>
            </optgroup>
            <optgroup label="THCS">
              <option value="KHTN 6">Khối KHTN 6</option>
              <option value="KHTN 7">Khối KHTN 7</option>
              <option value="KHTN 8">Khối KHTN 8</option>
              <option value="KHTN 9">Khối KHTN 9</option>
            </optgroup>
          </select>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
        >
          <Save className="w-5 h-5" />
          Lưu Học Viên
        </button>
      </form>
    </div>
  );
};
