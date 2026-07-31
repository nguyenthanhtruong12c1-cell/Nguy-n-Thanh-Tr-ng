import React from 'react';
import { Student } from '../types';
import { Printer, CheckCircle, X, Building2, Copy } from 'lucide-react';

interface BillModalProps {
  student: Student | null;
  onClose: () => void;
  onResetAttendance: (studentId: number) => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  student,
  onClose,
  onResetAttendance,
}) => {
  if (!student) return null;

  const fee = student.fee || 100000;
  const count = student.attendanceDates ? student.attendanceDates.length : 0;
  const totalFee = count * fee;

  const today = new Date();
  const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  // Strip Vietnamese accents for transfer syntax
  const nameNoAccent = student.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();

  const transferSyntax = `${nameNoAccent} ${student.class} DONG HOC PHI`;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPaid = () => {
    if (confirm("Xác nhận đã thu tiền? Toàn bộ lịch sử điểm danh đợt này sẽ bị xóa.")) {
      onResetAttendance(student.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-full">
        {/* Printable Receipt Content */}
        <div id="printArea" className="p-6 pb-2 bg-white">
          <div className="text-center mb-4 border-b pb-4 border-dashed border-slate-300">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Trung Tâm Chường Teacher
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-1 tracking-wider uppercase">
              HÓA ĐƠN THU HỌC PHÍ
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
          </div>

          <div className="text-sm text-slate-800 space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Học viên:</span>
              <strong className="text-slate-950 text-base">{student.name}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Khối/Lớp:</span>
              <strong className="text-slate-950">{student.class}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Học phí áp dụng:</span>
              <span className="font-semibold">{fee.toLocaleString('vi-VN')} VNĐ/Buổi</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
              <span className="text-slate-600 font-medium">Số buổi học:</span>
              <strong className="text-slate-950 font-bold text-base">{count} buổi</strong>
            </div>
          </div>

          <div className="bg-blue-50/80 border border-blue-100 p-3 rounded-xl mb-4">
            <strong className="text-xs text-blue-900 font-bold block mb-1.5 uppercase">
              Chi tiết ngày học ({count}):
            </strong>
            <div className="flex flex-wrap gap-1 text-xs text-slate-800 font-semibold">
              {student.attendanceDates && count > 0 ? (
                student.attendanceDates.map((date, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-white border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    {date}
                  </span>
                ))
              ) : (
                <span className="italic text-slate-500">Chưa có dữ liệu ngày học.</span>
              )}
            </div>
          </div>

          <div className="bg-slate-100/90 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center mb-4 shadow-inner">
            <span className="font-bold text-slate-700 text-sm">TỔNG TIỀN:</span>
            <span className="text-2xl font-black text-emerald-600">
              {totalFee.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          <div className="border-2 border-dashed border-emerald-400 bg-emerald-50/70 p-3.5 rounded-xl text-center mb-4">
            <p className="text-xs text-emerald-800 font-black tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> THÔNG TIN CHUYỂN KHOẢN
            </p>
            <p className="font-semibold text-slate-800 text-xs">
              VPBank - Ngân hàng Việt Nam Thịnh Vượng
            </p>
            <p className="font-black text-2xl text-emerald-700 tracking-widest my-1 select-all">
              0817778516
            </p>
            <p className="font-bold text-slate-900 text-sm">NGUYEN THANH TRUONG</p>
            <div className="mt-2 bg-white inline-block px-3 py-1.5 rounded-lg border border-emerald-200 text-xs shadow-2xs">
              <span className="text-slate-500">Nội dung: </span>
              <strong className="text-slate-900 font-black select-all">{transferSyntax}</strong>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 italic mb-3">
            Cảm ơn quý phụ huynh đã tin tưởng!
          </div>
        </div>

        {/* Action Controls - hidden during print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 print-hidden">
          <button
            onClick={handlePrint}
            className="btn-primary w-full py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> In Hóa Đơn (Lưu PDF)
          </button>
          <button
            onClick={handleConfirmPaid}
            className="btn-success w-full py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Đã thu tiền & Đặt lại
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-300 shadow-2xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" /> Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
