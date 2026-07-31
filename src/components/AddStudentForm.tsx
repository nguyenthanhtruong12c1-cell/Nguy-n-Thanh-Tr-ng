import React, { useState } from 'react';
import { UserPlus, Save, KeyRound, Copy, Check, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface AddStudentFormProps {
  onAddStudent: (name: string, studentClass: string, username?: string, password?: string) => void;
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAddStudent }) => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('KHTN 6');
  const [customPassword, setCustomPassword] = useState('123456');

  // Success Card State
  const [createdStudentInfo, setCreatedStudentInfo] = useState<{
    name: string;
    studentClass: string;
    username: string;
    password: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const generateRandomPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setCustomPassword(pin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Vui lòng nhập tên học sinh!");
      return;
    }

    const username = trimmed;
    const password = customPassword.trim() || '123456';

    onAddStudent(trimmed, studentClass, username, password);

    // Show success summary
    setCreatedStudentInfo({
      name: trimmed,
      studentClass,
      username,
      password,
    });

    setName('');
    setCustomPassword('123456');
  };

  const handleCopyAccountInfo = () => {
    if (!createdStudentInfo) return;
    const text = `🎓 TÀI KHOẢN HỌC SINH:\n• Họ tên: ${createdStudentInfo.name} (${createdStudentInfo.studentClass})\n• Tên đăng nhập: ${createdStudentInfo.username}\n• Mật khẩu: ${createdStudentInfo.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      {/* CREATED ACCOUNT SUCCESS CARD */}
      {createdStudentInfo && (
        <div className="glass-card p-6 bg-emerald-50/90 border-2 border-emerald-300 shadow-xl space-y-4 animate-bounce-once">
          <div className="flex items-center gap-3 border-b border-emerald-200 pb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="font-black text-emerald-950 text-lg">Đã Tạo Học Viên Thành Công!</h3>
              <p className="text-xs text-emerald-800 font-medium">Thẻ thông tin tài khoản đã cấp cho học sinh</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-2 text-sm shadow-inner font-medium">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 text-xs font-bold">Họ & Tên:</span>
              <strong className="text-slate-900">{createdStudentInfo.name}</strong>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 text-xs font-bold">Lớp học:</span>
              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-xs">
                {createdStudentInfo.studentClass}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 text-xs font-bold">Tên đăng nhập:</span>
              <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {createdStudentInfo.username}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-bold">Mật khẩu đăng nhập:</span>
              <strong className="text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-base">
                {createdStudentInfo.password}
              </strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyAccountInfo}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép!' : 'Sao chép thông tin gởi Phụ huynh'}
            </button>

            <button
              onClick={() => setCreatedStudentInfo(null)}
              className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition"
            >
              Thêm tiếp
            </button>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="glass-card p-6 sm:p-8 shadow-md border border-white/80">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight">Thêm Học Viên Mới</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Mỗi học sinh sẽ có tên đăng nhập và mật khẩu riêng để làm bài
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Họ và Tên Học Viên (Tên Đăng Nhập)
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-4 h-4 text-blue-600" /> Mật khẩu cấp cho học sinh
              </label>
              <button
                type="button"
                onClick={generateRandomPin}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                <RefreshCw className="w-3 h-3" /> Tạo mã 6 số ngẫu nhiên
              </button>
            </div>

            <input
              type="text"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
              placeholder="VD: 123456"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * Mặc định là <code className="font-bold text-slate-600">123456</code>. Giáo viên có thể đổi mật khẩu bất kỳ lúc nào.
            </p>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-5 h-5" />
            Lưu Học Viên & Cấp Mật Khẩu
          </button>
        </form>
      </div>
    </div>
  );
};
