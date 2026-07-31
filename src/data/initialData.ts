import { Student, Task } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "Nguyễn Lê Anh", class: "KHTN 6", fee: 100000, attendanceDates: ["01/08/2026", "05/08/2026"], username: "Nguyễn Lê Anh", password: "123456" },
  { id: 2, name: "Trần Bảo Khoa", class: "KHTN 7", fee: 120000, attendanceDates: ["03/08/2026"], username: "Trần Bảo Khoa", password: "123456" },
  { id: 3, name: "Phạm Gia Bảo", class: "Lớp 3", fee: 100000, attendanceDates: [], username: "Phạm Gia Bảo", password: "123456" }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 100,
    title: "Đề Kiểm Tra Tổng Hợp (Đa Dạng Câu Hỏi)",
    class: "KHTN 6",
    type: "multi",
    content: "Đề kiểm tra kiến thức tổng hợp KHTN 6 gồm 3 dạng bài: Trắc nghiệm, Điền khuyết và Tự luận. Học sinh hoàn thành đầy đủ cả 3 câu bên dưới.",
    questions: [
      {
        id: "q1",
        type: "quiz",
        content: "Câu 1 (Trắc nghiệm): Nước tinh khiết hóa lỏng ở nhiệt độ bao nhiêu độ C trong điều kiện tiêu chuẩn?",
        options: ["0°C", "100°C", "50°C", "-100°C"]
      },
      {
        id: "q2",
        type: "fill",
        content: "Câu 2 (Điền khuyết): Thực vật trao đổi khí qua lá nhờ các lỗ khí. Ban ngày lá hấp thụ khí ___ và thải ra khí ___."
      },
      {
        id: "q3",
        type: "essay",
        content: "Câu 3 (Tự luận): Nêu vai trò quan trọng của quang hợp đối với sự sống trên Trái Đất."
      }
    ],
    submissions: {}
  },
  { id: 101, title: "Trắc nghiệm Sinh học", class: "KHTN 6", type: "quiz", content: "Tế bào nào sau đây có lục lạp?", options: ["Tế bào động vật", "Tế bào thực vật", "Vi khuẩn", "Virus"], submissions: {} },
  { id: 102, title: "Trắc nghiệm Vật lý", class: "KHTN 6", type: "quiz", content: "Đơn vị của lực là gì?", options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"], submissions: {} },
  { id: 103, title: "Điền khuyết Văn", class: "Lớp 3", type: "fill", content: "Hôm nay là ngày ___ tháng ___ năm ___.", submissions: {} }
];
