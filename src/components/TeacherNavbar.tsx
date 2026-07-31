import React from 'react';
import { TeacherView } from '../types';
import {
  Users,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  ShieldAlert,
  UserPlus,
  Compass,
  GraduationCap
} from 'lucide-react';

interface TeacherNavbarProps {
  currentView: TeacherView;
  onChangeView: (view: TeacherView) => void;
  totalStudents: number;
  totalTasksCount?: number;
}

export const TeacherNavbar: React.FC<TeacherNavbarProps> = ({
  currentView,
  onChangeView,
  totalStudents,
  totalTasksCount = 0,
}) => {
  const navItems = [
    {
      id: 'students' as TeacherView,
      label: 'Quản Lý Học Sinh',
      description: 'Danh sách, hồ sơ & học phí',
      icon: Users,
      badge: `${totalStudents} em`,
      activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border-blue-500',
      inactiveBg: 'bg-white/90 text-slate-700 hover:bg-blue-50/80 hover:text-blue-800 border-slate-200/80',
    },
    {
      id: 'addTask' as TeacherView,
      label: 'Đề Thi & Bài Tập',
      description: 'Tạo đề & chấm tự động',
      icon: FileSpreadsheet,
      badge: totalTasksCount > 0 ? `${totalTasksCount} đề` : 'Tạo mới',
      activeBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border-purple-500',
      inactiveBg: 'bg-white/90 text-slate-700 hover:bg-purple-50/80 hover:text-purple-800 border-slate-200/80',
    },
    {
      id: 'schedule' as TeacherView,
      label: 'Thời Khóa Biểu',
      description: 'Điểm danh & lịch dạy',
      icon: Calendar,
      badge: 'Lịch học',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 border-emerald-500',
      inactiveBg: 'bg-white/90 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-800 border-slate-200/80',
    },
    {
      id: 'analytics' as TeacherView,
      label: 'Thống Kê Học Phí',
      description: 'Doanh thu & công nợ',
      icon: TrendingUp,
      badge: 'Báo cáo',
      activeBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20 border-amber-500',
      inactiveBg: 'bg-white/90 text-slate-700 hover:bg-amber-50/80 hover:text-amber-800 border-slate-200/80',
    },
    {
      id: 'proctoring' as TeacherView,
      label: 'Giám Sát Live & Gian Lận',
      description: 'Cảnh báo tab & live camera',
      icon: ShieldAlert,
      badge: 'Live 🛡️',
      activeBg: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 border-red-500 ring-2 ring-red-200',
      inactiveBg: 'bg-white/90 text-slate-700 hover:bg-red-50/80 hover:text-red-800 border-slate-200/80',
    },
  ];

  return (
    <aside className="glass-panel p-3.5 shadow-sm border border-slate-200/80 flex flex-col h-full">
      {/* Sidebar Header Title */}
      <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Danh Mục Quản Lý
            </h2>
            <p className="text-[11px] font-semibold text-slate-500">Bảng điều khiển giáo viên</p>
          </div>
        </div>
      </div>

      {/* Vertical Navigation Items Stack */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id || (item.id === 'students' && currentView === 'addStudent');

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full p-3 rounded-2xl font-bold text-xs transition-all duration-200 text-left flex items-center justify-between border ${
                isActive ? item.activeBg : item.inactiveBg
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                  <span className="font-extrabold text-xs tracking-tight">{item.label}</span>
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Quick Add Student Action Button */}
      <div className="pt-3 mt-3 border-t border-slate-200/80">
        <button
          onClick={() => onChangeView('addStudent')}
          className={`w-full p-3 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
            currentView === 'addStudent'
              ? 'bg-blue-700 text-white ring-2 ring-blue-300'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>+ Thêm Học Sinh Mới</span>
        </button>

        {/* Quick Footer Info */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-bold">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            Sĩ số hiện tại:
          </span>
          <span className="text-blue-700 font-black">{totalStudents} Học Sinh</span>
        </div>
      </div>
    </aside>
  );
};

