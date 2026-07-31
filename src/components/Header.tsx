import React from 'react';
import { AuthUser } from '../types';
import { GraduationCap, UserCheck, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  authUser: AuthUser | null;
  currentStudentName?: string;
  onLogout: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authUser,
  currentStudentName,
  onLogout,
  onResetData,
}) => {
  return (
    <header className="glass-panel p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 print-hidden shadow-sm">
      <Logo size="sm" showSubtitle={true} />

      <div className="flex items-center gap-3">
        {authUser ? (
          <div className="flex items-center gap-3 bg-white/80 p-1.5 pl-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {authUser.role === 'teacher' ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Tài khoản Giáo Viên
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-emerald-600" /> Học Sinh: {currentStudentName || 'Học sinh'}
                </span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        ) : null}

        {authUser?.role === 'teacher' && (
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
        )}
      </div>
    </header>
  );
};
