import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { CreditCard, DollarSign, Calendar, Plus, Trash2, CheckCircle2, UserX, FileText, Lock, Save, Sparkles, Check, KeyRound, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';

interface StudentDetailViewProps {
  student: Student;
  onUpdateFee: (studentId: number, newFee: number) => void;
  onUpdateNotes?: (studentId: number, notes: string) => void;
  onUpdatePassword?: (studentId: number, newPassword: string) => void;
  onAddAttendance: (studentId: number, dateStr: string) => void;
  onDeleteAttendance: (studentId: number, index: number) => void;
  onDeleteStudent: (studentId: number) => void;
  onOpenBillModal: (studentId: number) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onUpdateFee,
  onUpdateNotes,
  onUpdatePassword,
  onAddAttendance,
  onDeleteAttendance,
  onDeleteStudent,
  onOpenBillModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [notesText, setNotesText] = useState<string>(student.notes || '');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  // Account Credentials State
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [editPassInput, setEditPassInput] = useState<string>(student.password || '123456');
  const [isPassSaved, setIsPassSaved] = useState<boolean>(false);
  const [copiedCreds, setCopiedCreds] = useState<boolean>(false);

  useEffect(() => {
    setNotesText(student.notes || '');
    setEditPassInput(student.password || '123456');
  }, [student.id, student.notes, student.password]);

  const fee = student.fee || 100000;
  const count = student.attendanceDates ? student.attendanceDates.length : 0;
  const total = count * fee;

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(student.id, notesText);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

  const handleSavePassword = () => {
    if (!editPassInput.trim()) {
      alert("Vui lòng nhập mật khẩu không được để trống!");
      return;
    }
    if (onUpdatePassword) {
      onUpdatePassword(student.id, editPassInput.trim());
      setIsPassSaved(true);
      setTimeout(() => setIsPassSaved(false), 2000);
    }
  };

  const handleCopyAccountInfo = () => {
    const username = student.username || student.name;
    const pass = student.password || '123456';
    const text = `🎓 THÔNG TIN TÀI KHOẢN HỌC SINH:\n• Tên học sinh: ${student.name} (${student.class})\n• Tên đăng nhập: ${username}\n• Mật khẩu: ${pass}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const handleAppendTag = (tagText: string) => {
    const trimmed = notesText.trim();
    const updated = trimmed ? `${trimmed}\n- ${tagText}` : `- ${tagText}`;
    setNotesText(updated);
    if (onUpdateNotes) {
      onUpdateNotes(student.id, updated);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

  const handleAddDate = () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày!");
      return;
    }
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return;
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    if (student.attendanceDates.includes(formattedDate)) {
      alert("Ngày này đã có trong danh sách điểm danh!");
      return;
    }

    onAddAttendance(student.id, formattedDate);
  };

  const handleDeleteStudentClick = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.name}" (${student.class}) không? Dữ liệu của học sinh này sẽ bị xóa khỏi hệ thống.`)) {
      onDeleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-lg border border-blue-200">
            {student.class}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteStudentClick}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5"
            title="Xóa học sinh này"
          >
            <UserX className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa Học Sinh</span>
          </button>

          <button
            onClick={() => onOpenBillModal(student.id)}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base"
          >
            <CreditCard className="w-5 h-5" />
            XUẤT BILL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STUDENT LOGIN ACCOUNT CREDENTIALS CARD */}
        <div className="glass-card p-5 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 border border-indigo-200/80 shadow-sm md:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  Tài Khoản & Mật Khẩu Đăng Nhập Của Học Sinh
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Cấp cho học sinh dùng để đăng nhập vào làm bài kiểm tra & nộp bài
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyAccountInfo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {copiedCreds ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCreds ? 'Đã sao chép!' : 'Sao chép gửi Phụ huynh'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/90 p-4 rounded-xl border border-indigo-100 shadow-2xs">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tên Đăng Nhập (Username)
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-black text-slate-900 text-base">
                {student.username || student.name}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mật Khẩu Đăng Nhập
                </label>
                {isPassSaved && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Đã đổi mật khẩu!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editPassInput}
                    onChange={(e) => setEditPassInput(e.target.value)}
                    className="w-full p-2.5 pr-9 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-base bg-white outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleSavePassword}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-3.5 py-2.5 rounded-xl font-bold text-xs border border-indigo-300 transition flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Đổi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tuition Fee Setting */}
        <div className="glass-card p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" /> Cài đặt Học phí
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="10000"
              value={fee}
              onChange={(e) => onUpdateFee(student.id, parseInt(e.target.value) || 0)}
              className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-800 text-lg text-right focus:border-blue-500 focus:ring-2 ring-blue-200 outline-none bg-white"
            />
            <span className="font-bold text-slate-500 text-sm whitespace-nowrap">VNĐ/Buổi</span>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-card p-5 bg-emerald-50/60 border-emerald-200 shadow-sm">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Tạm tính đợt này
          </h3>
          <div className="flex justify-between items-end mb-2">
            <span className="text-slate-600 font-medium text-sm">Số buổi học:</span>
            <span className="text-2xl font-black text-emerald-700">{count}</span>
          </div>
          <div className="flex justify-between items-end border-t border-emerald-200/80 pt-2">
            <span className="text-slate-600 font-medium text-sm">Thành tiền:</span>
            <span className="text-2xl font-black text-emerald-700">
              {total.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>

        {/* Private Notes Card */}
        <div className="glass-card p-5 md:col-span-2 shadow-sm border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                  Ghi Chú Cá Nhân (Chỉ Giáo Viên Xem)
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="w-2.5 h-2.5" /> Bảo mật
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Lưu lại nhận xét, tiến độ hoặc lưu ý đặc biệt về học sinh {student.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isSavedNotice && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Đã lưu ghi chú!
                </span>
              )}
              <button
                onClick={handleSaveNotes}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu Ghi Chú
              </button>
            </div>
          </div>

          {/* Quick Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Thêm nhanh:
            </span>
            {[
              "Ngoan, tiếp thu nhanh",
              "Cần rèn thêm bài tập nâng cao",
              "Hay quên làm bài về nhà",
              "Tập trung kém trong giờ",
              "Học lực tiến bộ rõ rệt",
              "Đã đóng học phí tháng này",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAppendTag(tag)}
                className="text-[11px] font-semibold bg-white hover:bg-amber-100/80 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg transition shadow-2xs hover:border-amber-300"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Nhập ghi chú cá nhân của giáo viên về học sinh này (ví dụ: Tình hình học tập, thái độ, nhắc nhở gia đình...)"
            rows={4}
            className="w-full p-3.5 rounded-xl border border-slate-300 font-medium text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-2 ring-amber-200 outline-none bg-white/90 leading-relaxed"
          />
        </div>

        {/* Attendance List & Add Date */}
        <div className="glass-card p-5 md:col-span-2 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Lịch sử Điểm danh
          </h3>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-300 font-medium text-slate-700 outline-none focus:border-blue-500 bg-white"
            />
            <button
              onClick={handleAddDate}
              className="btn-primary px-6 py-3 font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> CỘNG BUỔI
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {student.attendanceDates && student.attendanceDates.length > 0 ? (
              student.attendanceDates.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm group hover:border-blue-300 transition"
                >
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> {d}
                  </span>
                  <button
                    onClick={() => onDeleteAttendance(student.id, i)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                    title="Xóa ngày này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic col-span-full text-center py-4 bg-white/40 rounded-xl border border-dashed border-slate-200">
                Chưa có ngày học nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

