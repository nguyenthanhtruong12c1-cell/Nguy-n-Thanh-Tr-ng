import React from 'react';
import { Role } from '../types';
import { GraduationCap, UserCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  role: Role;
  onSwitchRole: (role: Role) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onSwitchRole, onResetData }) => {
  return (
    <header className="glass-panel p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 print-hidden">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
          C
        </div>
        <div>
          <h1 className="text-2xl font-black text-blue-900 tracking-tight flex items-center gap-2">
            Chường Teacher
          </h1>
          <p className="text-blue-600/90 text-xs font-semibold tracking-wide">
            Hệ thống Quản lý Lớp học & Đào tạo
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-slate-200/60 p-1.5 rounded-xl border border-white/80 shadow-inner">
          <button
            onClick={() => onSwitchRole('teacher')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
              role === 'teacher'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            Giáo viên
          </button>
          <button
            onClick={() => onSwitchRole('student')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
              role === 'student'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Học sinh
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm("Khôi phục toàn bộ dữ liệu về mặc định ban đầu?")) {
              onResetData();
            }
          }}
          title="Khôi phục dữ liệu gốc"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-xl transition border border-transparent hover:border-slate-200"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
