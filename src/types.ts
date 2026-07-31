export type TaskType = 'essay' | 'quiz' | 'fill' | 'multi';

export interface Question {
  id: string | number;
  type: 'essay' | 'quiz' | 'fill';
  content: string;
  options?: string[]; // 4 choices for quiz
}

export interface ProctorLog {
  timestamp: string;
  event: string;
  type: 'warning' | 'info' | 'error';
}

export interface Submission {
  answer: string;
  count: number;
  redoing: boolean;
  questionAnswers?: Record<string | number, string>;
  tabSwitchCount?: number;
  timeSpentSeconds?: number;
  proctorLogs?: ProctorLog[];
}

export interface Task {
  id: number;
  title: string;
  class: string;
  type: TaskType;
  content: string;
  options?: string[]; // for single quiz
  questions?: Question[]; // for multi-question exam paper (dạng bài hỗn hợp)
  maxAttempts?: number; // Cài đặt số lần làm bài (Mặc định 1 hoặc theo giáo viên)
  durationMinutes?: number; // Thời gian làm bài (Phút), 0 = không giới hạn
  antiCheatEnabled?: boolean; // Giám sát & chống gian lận (chuyển tab, rời màn hình)
  submissions: Record<number, Submission>; // key is studentId
}

export interface Student {
  id: number;
  name: string;
  class: string;
  fee: number; // fee per session in VNĐ
  attendanceDates: string[]; // DD/MM/YYYY strings
  notes?: string; // Private teacher notes
  username?: string; // Tên đăng nhập
  password?: string; // Mật khẩu đăng nhập
}

export interface AuthUser {
  role: 'teacher' | 'student';
  studentId?: number;
}

export type Role = 'teacher' | 'student';
export type TeacherView = 'students' | 'addStudent' | 'addTask' | 'schedule' | 'analytics' | 'proctoring';

export const CLASS_HIERARCHY: Record<string, string[]> = {
  "Tiểu học": ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
  "THCS": ["KHTN 6", "KHTN 7", "KHTN 8", "KHTN 9"]
};

export const ALL_CLASSES = [
  "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5",
  "KHTN 6", "KHTN 7", "KHTN 8", "KHTN 9"
];

export const MAX_ATTEMPTS = 90;
