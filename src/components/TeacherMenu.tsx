import React, { useState } from 'react';
import { Student, TeacherView, CLASS_HIERARCHY } from '../types';
import { Folder, FolderOpen, User, PlusCircle, FileSpreadsheet, ChevronRight, ChevronDown } from 'lucide-react';

interface TeacherMenuProps {
  students: Student[];
  activeStudentId: number | null;
  onSelectStudent: (id: number) => void;
  teacherView: TeacherView;
  onChangeView: (view: TeacherView) => void;
}

export const TeacherMenu: React.FC<TeacherMenuProps> = ({
  students,
  activeStudentId,
  onSelectStudent,
  teacherView,
  onChangeView,
}) => {
  // Keep track of open categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Tiểu học": true,
    "THCS": true,
  });

  const [openClasses, setOpenClasses] = useState<Record<string, boolean>>({
    "KHTN 6": true,
    "KHTN 7": true,
    "Lớp 3": true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleClass = (cls: string) => {
    setOpenClasses(prev => ({ ...prev, [cls]: !prev[cls] }));
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onChangeView('students')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm ${
            teacherView === 'students'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-blue-100/80 text-blue-800 hover:bg-blue-200/80'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Lớp học
        </button>
        <button
          onClick={() => onChangeView('addTask')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm ${
            teacherView === 'addTask'
              ? 'bg-purple-600 text-white shadow-purple-500/20'
              : 'bg-purple-100/80 text-purple-800 hover:bg-purple-200/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Giao bài
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-1 space-y-2 select-none">
        {Object.entries(CLASS_HIERARCHY).map(([category, classes]) => {
          const categoryStudents = students.filter(s => classes.includes(s.class));
          if (categoryStudents.length === 0) return null;

          const isCatOpen = !!openCategories[category];

          return (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left font-bold text-slate-800 hover:text-blue-700 py-1 flex items-center gap-1.5 text-sm transition"
              >
                {isCatOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <Folder className="w-4 h-4 text-amber-500" />
                <span>{category}</span>
              </button>

              {isCatOpen && (
                <div className="pl-4 border-l-2 border-slate-200/80 ml-2 mt-1 space-y-1">
                  {classes.map(cls => {
                    const classStudents = students.filter(s => s.class === cls);
                    if (classStudents.length === 0) return null;

                    const isClsOpen = openClasses[cls] !== false;

                    return (
                      <div key={cls} className="mb-1">
                        <button
                          onClick={() => toggleClass(cls)}
                          className="w-full text-left font-semibold text-blue-800 hover:bg-blue-50 rounded-lg px-2 py-1 text-xs transition flex items-center gap-1.5"
                        >
                          {isClsOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                          <span>{cls}</span>
                          <span className="ml-auto bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]">
                            {classStudents.length}
                          </span>
                        </button>

                        {isClsOpen && (
                          <div className="pl-3 mt-1 flex flex-col gap-1">
                            {classStudents.map(st => {
                              const isActive = st.id === activeStudentId && teacherView === 'students';
                              return (
                                <button
                                  key={st.id}
                                  onClick={() => {
                                    onSelectStudent(st.id);
                                    onChangeView('students');
                                  }}
                                  className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition font-medium flex items-center gap-2 ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                                      : 'text-slate-700 hover:bg-white/80 hover:text-blue-700'
                                  }`}
                                >
                                  <User className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                  <span className="truncate">{st.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onChangeView('addStudent')}
        className={`mt-4 w-full border-2 border-dashed py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
          teacherView === 'addStudent'
            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'border-blue-400 text-blue-700 bg-blue-50/60 hover:bg-blue-100/80'
        }`}
      >
        <PlusCircle className="w-4 h-4" /> Thêm Học Viên Mới
      </button>
    </div>
  );
};
