import React, { useState } from 'react';
import { Student } from '../types';
import { CreditCard, DollarSign, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface StudentDetailViewProps {
  student: Student;
  onUpdateFee: (studentId: number, newFee: number) => void;
  onAddAttendance: (studentId: number, dateStr: string) => void;
  onDeleteAttendance: (studentId: number, index: number) => void;
  onOpenBillModal: (studentId: number) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onUpdateFee,
  onAddAttendance,
  onDeleteAttendance,
  onOpenBillModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fee = student.fee || 100000;
  const count = student.attendanceDates ? student.attendanceDates.length : 0;
  const total = count * fee;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-lg border border-blue-200">
            {student.class}
          </span>
        </div>
        <button
          onClick={() => onOpenBillModal(student.id)}
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          XUẤT BILL
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
