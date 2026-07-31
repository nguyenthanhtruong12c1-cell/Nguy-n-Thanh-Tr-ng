import React, { useState, useMemo } from 'react';
import { Student, TeacherView, CLASS_HIERARCHY, ALL_CLASSES } from '../types';
import {
  Folder,
  FolderOpen,
  User,
  PlusCircle,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Calendar,
  Trash2,
  TrendingUp,
  Search,
  X,
  Filter,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface TeacherMenuProps {
  students: Student[];
  activeStudentId: number | null;
  onSelectStudent: (id: number) => void;
  onDeleteStudent: (id: number) => void;
  teacherView: TeacherView;
  onChangeView: (view: TeacherView) => void;
}

export const TeacherMenu: React.FC<TeacherMenuProps> = ({
  students,
  activeStudentId,
  onSelectStudent,
  onDeleteStudent,
  teacherView,
  onChangeView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Keep track of open categories & classes
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

  const handleDelete = (e: React.MouseEvent, st: Student) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${st.name}" (${st.class}) không?`)) {
      onDeleteStudent(st.id);
    }
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      // Name or class search
      const matchesSearch =
        searchTerm.trim() === '' ||
        st.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        st.class.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (st.notes && st.notes.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      // Category filter
      let matchesCategory = true;
      if (selectedCategoryFilter !== 'all') {
        const catClasses = CLASS_HIERARCHY[selectedCategoryFilter] || [];
        matchesCategory = catClasses.includes(st.class);
      }

      // Class filter
      let matchesClass = true;
      if (selectedClassFilter !== 'all') {
        matchesClass = st.class === selectedClassFilter;
      }

      return matchesSearch && matchesCategory && matchesClass;
    });
  }, [students, searchTerm, selectedCategoryFilter, selectedClassFilter]);

  const isFiltering = searchTerm.trim() !== '' || selectedCategoryFilter !== 'all' || selectedClassFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryFilter('all');
    setSelectedClassFilter('all');
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Header and Add Student Quick Action */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/80">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span>Danh Sách Học Sinh</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
            {students.length}
          </span>
        </h2>

        <button
          onClick={() => onChangeView('addStudent')}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition flex items-center gap-1"
          title="Tạo hồ sơ học sinh mới"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Thêm</span>
        </button>
      </div>

      {/* SEARCH BAR & QUICK FILTERS */}
      <div className="space-y-2 mb-3 pb-3 border-b border-slate-200/80">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên học sinh, lớp..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Selectors */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Category Filter */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-1.5 py-1">
            <Filter className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setSelectedClassFilter('all'); // reset class filter when category changes
              }}
              className="w-full text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer truncate"
            >
              <option value="all">Tất cả Khối</option>
              {Object.keys(CLASS_HIERARCHY).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-1.5 py-1">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer truncate"
            >
              <option value="all">Tất cả Lớp</option>
              {(selectedCategoryFilter !== 'all'
                ? CLASS_HIERARCHY[selectedCategoryFilter] || []
                : ALL_CLASSES
              ).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Indicator / Clear All */}
        {isFiltering && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
            <span className="text-blue-700 font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Tìm thấy: {filteredStudents.length} em
            </span>
            <button
              onClick={clearFilters}
              className="text-red-600 hover:underline font-bold text-[11px] flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> Bỏ lọc
            </button>
          </div>
        )}
      </div>

      {/* Class Tree / Student List */}
      <div className="overflow-y-auto flex-1 pr-1 space-y-2 select-none">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-6 px-2 text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-500">Không tìm thấy học sinh</p>
            <p className="text-[11px] mt-0.5">Thử đổi từ khóa hoặc xóa bộ lọc</p>
            {isFiltering && (
              <button
                onClick={clearFilters}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          Object.entries(CLASS_HIERARCHY).map(([category, classes]) => {
            const categoryStudents = filteredStudents.filter(s => classes.includes(s.class));
            if (categoryStudents.length === 0) return null;

            // Auto expand if actively filtering
            const isCatOpen = isFiltering ? true : !!openCategories[category];

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
                  <span className="ml-auto text-[10px] font-bold text-slate-400">
                    ({categoryStudents.length})
                  </span>
                </button>

                {isCatOpen && (
                  <div className="pl-3 border-l-2 border-slate-200/80 ml-2 mt-1 space-y-1">
                    {classes.map(cls => {
                      const classStudents = filteredStudents.filter(s => s.class === cls);
                      if (classStudents.length === 0) return null;

                      // Auto expand if actively filtering
                      const isClsOpen = isFiltering ? true : openClasses[cls] !== false;

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
                            <span className="ml-auto bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                              {classStudents.length}
                            </span>
                          </button>

                          {isClsOpen && (
                            <div className="pl-2 mt-1 flex flex-col gap-1">
                              {classStudents.map(st => {
                                const isActive = st.id === activeStudentId && teacherView === 'students';
                                return (
                                  <div
                                    key={st.id}
                                    onClick={() => {
                                      onSelectStudent(st.id);
                                      onChangeView('students');
                                    }}
                                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition font-medium flex items-center justify-between group cursor-pointer ${
                                      isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                                        : 'text-slate-700 hover:bg-white/80 hover:text-blue-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <User className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                      <span className="truncate">{st.name}</span>
                                    </div>

                                    <button
                                      onClick={(e) => handleDelete(e, st)}
                                      title="Xóa học sinh này"
                                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                                        isActive
                                          ? 'hover:bg-blue-700 text-blue-100 hover:text-white'
                                          : 'hover:bg-red-100 text-slate-400 hover:text-red-600'
                                      }`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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
          })
        )}
      </div>

      <button
        onClick={() => onChangeView('addStudent')}
        className={`mt-3 w-full border-2 border-dashed py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
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

