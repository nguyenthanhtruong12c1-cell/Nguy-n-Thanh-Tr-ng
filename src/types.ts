export type TaskType = 'essay' | 'quiz' | 'fill';

export interface Submission {
  answer: string;
  count: number;
  redoing: boolean;
}

export interface Task {
  id: number;
  title: string;
  class: string;
  type: TaskType;
  content: string;
  options?: string[]; // for quiz
  submissions: Record<number, Submission>; // key is studentId
}

export interface Student {
  id: number;
  name: string;
  class: string;
  fee: number; // fee per session in VNĐ
  attendanceDates: string[]; // DD/MM/YYYY strings
}

export type Role = 'teacher' | 'student';
export type TeacherView = 'students' | 'addStudent' | 'addTask' | 'schedule';

export const CLASS_HIERARCHY: Record<string, string[]> = {
  "Tiểu học": ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
  "THCS": ["KHTN 6", "KHTN 7", "KHTN 8", "KHTN 9"]
};

export const ALL_CLASSES = [
  "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5",
  "KHTN 6", "KHTN 7", "KHTN 8", "KHTN 9"
];

export const MAX_ATTEMPTS = 90;
