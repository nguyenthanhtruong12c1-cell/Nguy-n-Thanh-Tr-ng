import React, { useState, useEffect } from 'react';
import { Student, Task, Question, TeacherView, TaskType, AuthUser } from './types';
import {
  loadStudents,
  saveStudents,
  loadTasks,
  saveTasks,
  resetToDefaults,
} from './lib/storage';
import { Header } from './components/Header';
import { TeacherNavbar } from './components/TeacherNavbar';
import { TeacherMenu } from './components/TeacherMenu';
import { StudentMenu } from './components/StudentMenu';
import { StudentDetailView } from './components/StudentDetailView';
import { AddStudentForm } from './components/AddStudentForm';
import { AddTaskForm } from './components/AddTaskForm';
import { MonthlyScheduleView } from './components/MonthlyScheduleView';
import { TuitionAnalytics } from './components/TuitionAnalytics';
import { ProctoringView } from './components/ProctoringView';
import { StudentWorkspace } from './components/StudentWorkspace';
import { BillModal } from './components/BillModal';
import { LoginScreen } from './components/LoginScreen';
import { School, Sparkles } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  // Authenticated user state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('chuong_auth_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [teacherView, setTeacherView] = useState<TeacherView>('students');

  // Teacher mode selected student
  const [activeStudentId, setActiveStudentId] = useState<number | null>(() => {
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

  // Persist session auth
  useEffect(() => {
    if (authUser) {
      sessionStorage.setItem('chuong_auth_user', JSON.stringify(authUser));
    } else {
      sessionStorage.removeItem('chuong_auth_user');
    }
  }, [authUser]);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    if (user.role === 'teacher') {
      setTeacherView('students');
      if (!activeStudentId && students.length > 0) {
        setActiveStudentId(students[0].id);
      }
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  // Student Management Handlers
  const handleAddStudent = (
    name: string,
    studentClass: string,
    username?: string,
    password?: string
  ) => {
    const newStudent: Student = {
      id: Date.now(),
      name,
      class: studentClass,
      fee: 100000,
      attendanceDates: [],
      username: username || name,
      password: password || '123456',
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    setActiveStudentId(newStudent.id);
    setTeacherView('students');
  };

  const handleDeleteStudent = (studentId: number) => {
    const remaining = students.filter(s => s.id !== studentId);
    setStudents(remaining);

    if (activeStudentId === studentId) {
      setActiveStudentId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateFee = (studentId: number, newFee: number) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, fee: newFee } : s))
    );
  };

  const handleUpdateNotes = (studentId: number, notes: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, notes } : s))
    );
  };

  const handleUpdatePassword = (studentId: number, newPassword: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, password: newPassword } : s))
    );
  };

  const handleAddAttendance = (studentId: number, dateStr: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const newDates = [...s.attendanceDates, dateStr];
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
    options?: string[],
    questions?: Question[],
    maxAttempts: number = 1,
    durationMinutes: number = 45,
    antiCheatEnabled: boolean = true
  ) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      class: cls,
      type,
      content,
      options,
      questions,
      maxAttempts,
      durationMinutes,
      antiCheatEnabled,
      submissions: {},
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleSubmitTask = (
    taskId: number,
    studentId: number,
    answer: string,
    proctorData?: {
      tabSwitchCount?: number;
      timeSpentSeconds?: number;
      proctorLogs?: any[];
    }
  ) => {
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
              tabSwitchCount: proctorData?.tabSwitchCount ?? existingSub?.tabSwitchCount ?? 0,
              timeSpentSeconds: proctorData?.timeSpentSeconds ?? existingSub?.timeSpentSeconds ?? 0,
              proctorLogs: proctorData?.proctorLogs ?? existingSub?.proctorLogs ?? [],
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
    } else {
      setActiveStudentId(null);
    }
    setAuthUser(null);
  };

  // If not logged in, show Login Screen
  if (!authUser) {
    return <LoginScreen students={students} onLogin={handleLogin} />;
  }

  const activeStudentInTeacherMode = students.find(s => s.id === activeStudentId) || null;
  const currentStudentAccount = authUser.studentId
    ? students.find(s => s.id === authUser.studentId) || null
    : null;
  const studentForBillModal = students.find(s => s.id === billModalStudentId) || null;

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <Header
        authUser={authUser}
        currentStudentName={currentStudentAccount?.name}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Main Page Container */}
      <div className="flex-1 print-hidden">
        {/* TEACHER MODE VIEW */}
        {authUser.role === 'teacher' ? (
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* VERTICAL MANAGEMENT SIDEBAR */}
            <div className="w-full md:w-60 lg:w-64 flex-shrink-0">
              <TeacherNavbar
                currentView={teacherView}
                onChangeView={(view) => setTeacherView(view)}
                totalStudents={students.length}
                totalTasksCount={tasks.length}
              />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0">
              {/* PAGE 1: STUDENT MANAGEMENT (STUDENTS / ADD STUDENT) */}
              {(teacherView === 'students' || teacherView === 'addStudent') && (
                <div className="flex flex-col xl:flex-row gap-4 flex-1">
                  {/* LEFT SUB-COLUMN - STUDENT DIRECTORY MENU */}
                  <div className="w-full xl:w-72 glass-panel flex flex-col min-h-[300px] md:min-h-[500px]">
                    <TeacherMenu
                      students={students}
                      activeStudentId={activeStudentId}
                      onSelectStudent={(id) => {
                        setActiveStudentId(id);
                        setTeacherView('students');
                      }}
                      onDeleteStudent={handleDeleteStudent}
                      teacherView={teacherView}
                      onChangeView={(view) => setTeacherView(view)}
                    />
                  </div>

                  {/* RIGHT SUB-COLUMN - STUDENT DETAIL OR ADD STUDENT FORM */}
                  <div className="w-full xl:flex-1 glass-panel p-4 sm:p-6 relative min-h-[400px]">
                    {teacherView === 'addStudent' ? (
                      <AddStudentForm onAddStudent={handleAddStudent} />
                    ) : activeStudentInTeacherMode ? (
                      <StudentDetailView
                        student={activeStudentInTeacherMode}
                        onUpdateFee={handleUpdateFee}
                        onUpdateNotes={handleUpdateNotes}
                        onUpdatePassword={handleUpdatePassword}
                        onAddAttendance={handleAddAttendance}
                        onDeleteAttendance={handleDeleteAttendance}
                        onDeleteStudent={handleDeleteStudent}
                        onOpenBillModal={(id) => setBillModalStudentId(id)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                        <School className="w-16 h-16 text-slate-300 mb-3" />
                        <h2 className="text-xl font-bold text-slate-600">
                          Hãy chọn một học sinh ở danh sách
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          hoặc bấm "+ Thêm Học Sinh Mới" để tạo hồ sơ.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAGE 2: TASK & EXAM ASSIGNMENT */}
              {teacherView === 'addTask' && (
                <div className="glass-panel p-4 sm:p-6 min-h-[500px]">
                  <AddTaskForm onAddTask={handleAddTask} />
                </div>
              )}

              {/* PAGE 3: SCHEDULE & ATTENDANCE */}
              {teacherView === 'schedule' && (
                <div className="glass-panel p-4 sm:p-6 min-h-[500px]">
                  <MonthlyScheduleView
                    students={students}
                    onAddAttendance={handleAddAttendance}
                    onDeleteAttendance={handleDeleteAttendance}
                  />
                </div>
              )}

              {/* PAGE 4: TUITION ANALYTICS */}
              {teacherView === 'analytics' && (
                <div className="glass-panel p-4 sm:p-6 min-h-[500px]">
                  <TuitionAnalytics students={students} />
                </div>
              )}

              {/* PAGE 5: PROCTORING & ANTI-CHEAT LIVE */}
              {teacherView === 'proctoring' && (
                <div className="glass-panel p-4 sm:p-6 min-h-[500px]">
                  <ProctoringView
                    students={students}
                    tasks={tasks}
                    onSelectStudent={(id) => {
                      setTeacherView('students');
                      setActiveStudentId(id);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STUDENT MODE VIEW - DIRECT LOCKED WORKSPACE FOR LOGGED IN STUDENT */
          <div className="w-full glass-panel p-4 sm:p-6 flex-1 relative min-h-[500px]">
            {currentStudentAccount ? (
              <StudentWorkspace
                student={currentStudentAccount}
                tasks={tasks}
                onSubmitTask={handleSubmitTask}
                onRedoTask={handleRedoTask}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                <Sparkles className="w-16 h-16 text-emerald-300 mb-3" />
                <h2 className="text-xl font-bold text-slate-600">
                  Không tìm thấy thông tin tài khoản học sinh
                </h2>
                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </div>
        )}
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
