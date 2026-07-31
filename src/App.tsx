import React, { useState, useEffect } from 'react';
import { Student, Task, Role, TeacherView, TaskType } from './types';
import {
  loadStudents,
  saveStudents,
  loadTasks,
  saveTasks,
  resetToDefaults,
} from './lib/storage';
import { Header } from './components/Header';
import { TeacherMenu } from './components/TeacherMenu';
import { StudentMenu } from './components/StudentMenu';
import { StudentDetailView } from './components/StudentDetailView';
import { AddStudentForm } from './components/AddStudentForm';
import { AddTaskForm } from './components/AddTaskForm';
import { MonthlyScheduleView } from './components/MonthlyScheduleView';
import { StudentWorkspace } from './components/StudentWorkspace';
import { BillModal } from './components/BillModal';
import { School, Sparkles } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  const [role, setRole] = useState<Role>('teacher');
  const [teacherView, setTeacherView] = useState<TeacherView>('students');

  // Teacher mode selected student
  const [activeStudentId, setActiveStudentId] = useState<number | null>(() => {
    const st = loadStudents();
    return st.length > 0 ? st[0].id : null;
  });

  // Student mode selected student
  const [selectedStudentForHomework, setSelectedStudentForHomework] = useState<number | null>(() => {
    const st = loadStudents();
    return st.length > 0 ? st[0].id : null;
  });

  // Bill Modal state
  const [billModalStudentId, setBillModalStudentId] = useState<number | null>(null);

  // Sync state to localStorage whenever students or tasks change
  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Role switching
  const handleSwitchRole = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'teacher') {
      setTeacherView('students');
      if (!activeStudentId && students.length > 0) {
        setActiveStudentId(students[0].id);
      }
    } else {
      if (!selectedStudentForHomework && students.length > 0) {
        setSelectedStudentForHomework(students[0].id);
      }
    }
  };

  // Student Management Handlers
  const handleAddStudent = (name: string, studentClass: string) => {
    const newStudent: Student = {
      id: Date.now(),
      name,
      class: studentClass,
      fee: 100000,
      attendanceDates: [],
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    setActiveStudentId(newStudent.id);
    setSelectedStudentForHomework(newStudent.id);
    setTeacherView('students');
  };

  const handleDeleteStudent = (studentId: number) => {
    const remaining = students.filter(s => s.id !== studentId);
    setStudents(remaining);

    if (activeStudentId === studentId) {
      setActiveStudentId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (selectedStudentForHomework === studentId) {
      setSelectedStudentForHomework(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateFee = (studentId: number, newFee: number) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, fee: newFee } : s))
    );
  };

  const handleAddAttendance = (studentId: number, dateStr: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const newDates = [...s.attendanceDates, dateStr];
          // Sort chronologically (DD/MM/YYYY)
          newDates.sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
          });
          return { ...s, attendanceDates: newDates };
        }
        return s;
      })
    );
  };

  const handleDeleteAttendance = (studentId: number, index: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const newDates = [...s.attendanceDates];
          newDates.splice(index, 1);
          return { ...s, attendanceDates: newDates };
        }
        return s;
      })
    );
  };

  const handleResetAttendance = (studentId: number) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, attendanceDates: [] } : s))
    );
  };

  // Task Handlers
  const handleAddTask = (
    title: string,
    cls: string,
    type: TaskType,
    content: string,
    options?: string[]
  ) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      class: cls,
      type,
      content,
      options,
      submissions: {},
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleSubmitTask = (taskId: number, studentId: number, answer: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const existingSub = task.submissions[studentId];
          const previousCount = existingSub ? existingSub.count : 0;
          const newSubmissions = {
            ...task.submissions,
            [studentId]: {
              answer,
              count: previousCount + 1,
              redoing: false,
            },
          };
          return { ...task, submissions: newSubmissions };
        }
        return task;
      })
    );
  };

  const handleRedoTask = (taskId: number, studentId: number) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && task.submissions[studentId]) {
          const updatedSub = {
            ...task.submissions[studentId],
            redoing: true,
          };
          return {
            ...task,
            submissions: { ...task.submissions, [studentId]: updatedSub },
          };
        }
        return task;
      })
    );
  };

  const handleResetData = () => {
    const defaults = resetToDefaults();
    setStudents(defaults.students);
    setTasks(defaults.tasks);
    if (defaults.students.length > 0) {
      setActiveStudentId(defaults.students[0].id);
      setSelectedStudentForHomework(defaults.students[0].id);
    } else {
      setActiveStudentId(null);
      setSelectedStudentForHomework(null);
    }
  };

  const activeStudentInTeacherMode = students.find(s => s.id === activeStudentId) || null;
  const activeStudentInStudentMode = students.find(s => s.id === selectedStudentForHomework) || null;
  const studentForBillModal = students.find(s => s.id === billModalStudentId) || null;

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <Header
        role={role}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 print-hidden">
        {/* LEFT COLUMN */}
        <div className="w-full md:w-1/3 lg:w-1/4 glass-panel flex flex-col min-h-[300px] md:min-h-[500px]">
          {role === 'teacher' ? (
            <TeacherMenu
              students={students}
              activeStudentId={activeStudentId}
              onSelectStudent={(id) => setActiveStudentId(id)}
              onDeleteStudent={handleDeleteStudent}
              teacherView={teacherView}
              onChangeView={(view) => setTeacherView(view)}
            />
          ) : (
            <StudentMenu
              students={students}
              selectedStudentId={selectedStudentForHomework}
              onSelectStudent={(id) => setSelectedStudentForHomework(id)}
            />
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-2/3 lg:w-3/4 glass-panel p-4 sm:p-6 flex-1 relative min-h-[400px]">
          {role === 'teacher' ? (
            teacherView === 'addStudent' ? (
              <AddStudentForm onAddStudent={handleAddStudent} />
            ) : teacherView === 'addTask' ? (
              <AddTaskForm onAddTask={handleAddTask} />
            ) : teacherView === 'schedule' ? (
              <MonthlyScheduleView
                students={students}
                onAddAttendance={handleAddAttendance}
                onDeleteAttendance={handleDeleteAttendance}
              />
            ) : activeStudentInTeacherMode ? (
              <StudentDetailView
                student={activeStudentInTeacherMode}
                onUpdateFee={handleUpdateFee}
                onAddAttendance={handleAddAttendance}
                onDeleteAttendance={handleDeleteAttendance}
                onDeleteStudent={handleDeleteStudent}
                onOpenBillModal={(id) => setBillModalStudentId(id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                <School className="w-16 h-16 text-slate-300 mb-3" />
                <h2 className="text-xl font-bold text-slate-600">
                  Hãy chọn một học sinh ở menu bên trái
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  hoặc bấm "+ Thêm Học Viên Mới" để tạo lớp học.
                </p>
              </div>
            )
          ) : activeStudentInStudentMode ? (
            <StudentWorkspace
              student={activeStudentInStudentMode}
              tasks={tasks}
              onSubmitTask={handleSubmitTask}
              onRedoTask={handleRedoTask}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
              <Sparkles className="w-16 h-16 text-emerald-300 mb-3" />
              <h2 className="text-xl font-bold text-slate-600">
                Hãy chọn tên của em ở danh sách bên trái
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                để bắt đầu làm bài tập nhé!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tuition Invoice Bill Modal */}
      {billModalStudentId !== null && (
        <BillModal
          student={studentForBillModal}
          onClose={() => setBillModalStudentId(null)}
          onResetAttendance={handleResetAttendance}
        />
      )}
    </div>
  );
}
