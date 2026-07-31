import { Student, Task } from '../types';
import { INITIAL_STUDENTS, INITIAL_TASKS } from '../data/initialData';

const STUDENTS_KEY = 'chuong_teacher_students_v1';
const TASKS_KEY = 'chuong_teacher_tasks_v1';

export function loadStudents(): Student[] {
  try {
    const data = localStorage.getItem(STUDENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load students from localStorage", e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(students: Student[]) {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error("Failed to save students to localStorage", e);
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load tasks from localStorage", e);
  }
  return INITIAL_TASKS;
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks to localStorage", e);
  }
}

export function resetToDefaults(): { students: Student[]; tasks: Task[] } {
  localStorage.removeItem(STUDENTS_KEY);
  localStorage.removeItem(TASKS_KEY);
  return { students: INITIAL_STUDENTS, tasks: INITIAL_TASKS };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
