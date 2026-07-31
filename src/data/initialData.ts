import { Student, Task } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "Nguyễn Lê Anh", class: "KHTN 6", fee: 100000, attendanceDates: ["01/08/2026", "05/08/2026"] },
  { id: 2, name: "Trần Bảo Khoa", class: "KHTN 7", fee: 120000, attendanceDates: ["03/08/2026"] },
  { id: 3, name: "Phạm Gia Bảo", class: "Lớp 3", fee: 100000, attendanceDates: [] }
];

export const INITIAL_TASKS: Task[] = [
  { id: 101, title: "Trắc nghiệm Sinh học", class: "KHTN 6", type: "quiz", content: "Tế bào nào sau đây có lục lạp?", options: ["Tế bào động vật", "Tế bào thực vật", "Vi khuẩn", "Virus"], submissions: {} },
  { id: 102, title: "Trắc nghiệm Vật lý", class: "KHTN 6", type: "quiz", content: "Đơn vị của lực là gì?", options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"], submissions: {} },
  { id: 103, title: "Điền khuyết Văn", class: "Lớp 3", type: "fill", content: "Hôm nay là ngày ___ tháng ___ năm ___.", submissions: {} }
];
