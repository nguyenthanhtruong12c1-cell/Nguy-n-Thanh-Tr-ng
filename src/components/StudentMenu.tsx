import React from 'react';
import { Student } from '../types';
import { GraduationCap, Sparkles } from 'lucide-react';

interface StudentMenuProps {
  students: Student[];
  selectedStudentId: number | null;
  onSelectStudent: (id: number) => void;
}

export const StudentMenu: React.FC<StudentMenuProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
}) => {
  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-3 border-b border-emerald-200/80 pb-2">
        <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-600" />
          Danh sách Học sinh
        </h3>
        <p className="text-xs text-emerald-600 font-medium mt-0.5">
          Click vào tên của em để làm bài nhé.
        </p>
      </div>

      <div className="overflow-y-auto flex-1 pr-1 space-y-2">
        {students.map(st => {
          const isSelected = st.id === selectedStudentId;
          return (
            <button
              key={st.id}
              onClick={() => onSelectStudent(st.id)}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between group shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-white/70 hover:bg-white text-slate-800 border-white hover:border-emerald-200'
              }`}
            >
              <div>
                <div
                  className={`font-bold transition text-sm ${
                    isSelected ? 'text-white' : 'text-emerald-900 group-hover:text-emerald-700'
                  }`}
                >
                  {st.name}
                </div>
                <div
                  className={`text-xs font-semibold mt-0.5 ${
                    isSelected ? 'text-emerald-100' : 'text-emerald-600'
                  }`}
                >
                  {st.class}
                </div>
              </div>
              <Sparkles
                className={`w-4 h-4 transition ${
                  isSelected
                    ? 'text-yellow-300 fill-yellow-300'
                    : 'text-slate-300 group-hover:text-amber-400'
                }`}
              />
            </button>
          );
        })}

        {students.length === 0 && (
          <p className="text-sm text-slate-500 italic p-2 text-center">
            Chưa có học sinh nào.
          </p>
        )}
      </div>
    </div>
  );
};
