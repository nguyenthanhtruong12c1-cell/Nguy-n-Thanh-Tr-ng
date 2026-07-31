import React, { useState } from 'react';
import { Student, AuthUser } from '../types';
import { Logo } from './Logo';
import {
  GraduationCap,
  UserCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
  Sparkles,
  School,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  students: Student[];
  onLogin: (authUser: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ students, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student Form State
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string>(
    students.length > 0 ? (students[0].username || students[0].name) : ''
  );
  const [studentInputName, setStudentInputName] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Teacher Form State
  const [teacherUsername, setTeacherUsername] = useState<string>('teacher');
  const [teacherPassword, setTeacherPassword] = useState<string>('123456');
  const [showTeacherPassword, setShowTeacherPassword] = useState<boolean>(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    const targetUsername = studentInputName.trim() || selectedStudentUsername.trim();

    if (!targetUsername) {
      setStudentError('Vui lòng chọn hoặc nhập tên đăng nhập học sinh!');
      return;
    }

    // Find student by username or name
    const foundStudent = students.find(s => {
      const uName = (s.username || s.name).toLowerCase().trim();
      const sName = s.name.toLowerCase().trim();
      const input = targetUsername.toLowerCase().trim();
      return uName === input || sName === input;
    });

    if (!foundStudent) {
      setStudentError(`Không tìm thấy học sinh với tên đăng nhập "${targetUsername}".`);
      return;
    }

    const correctPassword = foundStudent.password || '123456';
    if (studentPassword.trim() !== correctPassword) {
      setStudentError('Mật khẩu không chính xác! Vui lòng thử lại hoặc hỏi Giáo viên.');
      return;
    }

    // Success login
    onLogin({
      role: 'student',
      studentId: foundStudent.id,
    });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);

    if (teacherUsername.trim() !== 'teacher' && teacherUsername.trim() !== 'giaovien') {
      setTeacherError('Tên tài khoản giáo viên không tồn tại. Mặc định là "teacher".');
      return;
    }

    if (teacherPassword !== '123456') {
      setTeacherError('Mật khẩu giáo viên không đúng. Mặc định là "123456".');
      return;
    }

    // Success teacher login
    onLogin({
      role: 'teacher',
    });
  };

  const handleSelectStudentFromList = (st: Student) => {
    setSelectedStudentUsername(st.username || st.name);
    setStudentInputName(st.name);
    setStudentPassword(st.password || '123456'); // Auto-fill for quick access demo
    setStudentError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 space-y-6">
        {/* LOGO & TITLE */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 py-1">
          <Logo size="lg" showSubtitle={false} />
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-1.5 pt-1">
            <span>🌾 Cánh Đồng Lúa</span> • <span>🌸 Hoa Sen</span> • <span>🏫 Lớp Học</span>
          </p>
        </div>

        {/* ROLE TAB SWITCH */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setStudentError(null);
            }}
            className={`py-3 px-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-white text-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Học Sinh
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              setTeacherError(null);
            }}
            className={`py-3 px-4 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-700 shadow-md ring-2 ring-blue-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            Giáo Viên
          </button>
        </div>

        {/* STUDENT LOGIN FORM */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {studentError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{studentError}</span>
              </div>
            )}

            {/* Quick Select Student Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Chọn tên học sinh hoặc nhập tên</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Cấp bởi Giáo viên
                </span>
              </label>

              {students.length > 0 && (
                <select
                  value={selectedStudentUsername}
                  onChange={(e) => {
                    const st = students.find(s => (s.username || s.name) === e.target.value);
                    if (st) handleSelectStudentFromList(st);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 mb-2"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.username || st.name}>
                      {st.name} ({st.class})
                    </option>
                  ))}
                </select>
              )}

              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={studentInputName}
                  onChange={(e) => {
                    setStudentInputName(e.target.value);
                    setStudentError(null);
                  }}
                  placeholder="Hoặc tự gõ Họ và Tên..."
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 font-medium text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Student Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật Khẩu Đăng Nhập
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showStudentPassword ? 'text' : 'password'}
                  value={studentPassword}
                  onChange={(e) => {
                    setStudentPassword(e.target.value);
                    setStudentError(null);
                  }}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-300 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-5 h-5" />
              Đăng Nhập Học Sinh
            </button>

            {/* Credentials Quick-List for Demo */}
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Danh sách tài khoản học sinh đã cấp:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {students.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStudentFromList(st)}
                    className="w-full text-left p-2 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-xs flex justify-between items-center font-semibold text-emerald-950 transition"
                  >
                    <span>
                      <strong>{st.name}</strong> ({st.class})
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono">
                      Pass: {st.password || '123456'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TEACHER LOGIN FORM */}
        {activeTab === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            {teacherError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{teacherError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tài Khoản Giáo Viên
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={teacherUsername}
                  onChange={(e) => {
                    setTeacherUsername(e.target.value);
                    setTeacherError(null);
                  }}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="teacher"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật Khẩu Giáo Viên
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showTeacherPassword ? 'text' : 'password'}
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    setTeacherError(null);
                  }}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-300 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Mật khẩu giáo viên..."
                />
                <button
                  type="button"
                  onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-5 h-5" />
              Đăng Nhập Quản Lý Giáo Viên
            </button>

            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 font-medium space-y-1">
              <span className="font-bold block text-blue-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Tài khoản Giáo viên mặc định:
              </span>
              <div>• Tên đăng nhập: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">teacher</code></div>
              <div>• Mật khẩu: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">123456</code></div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
