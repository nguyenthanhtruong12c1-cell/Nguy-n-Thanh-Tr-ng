import React, { useState } from 'react';
import { Question } from '../types';
import {
  FileText,
  Upload,
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Trash2,
  HelpCircle,
  FileSpreadsheet,
  X,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';

interface BulkQuestionImporterProps {
  onImportQuestions: (questions: Question[]) => void;
  onClose: () => void;
}

export const SAMPLE_TEXT = `Câu 1: Nước hoá lỏng ở nhiệt độ nào dưới áp suất khí quyển tiêu chuẩn?
A. 100°C
B. 0°C
C. 50°C
D. -100°C

Câu 2: Quang hợp là quá trình thực vật hấp thụ khí ___ và giải phóng khí ___.

Câu 3: Em hãy nêu 3 hoạt động hàng ngày giúp tiết kiệm năng lượng điện trong gia đình và trường học.

Câu 4: Kim loại nào sau đây dẫn điện tốt nhất ở điều kiện thường?
A. Đồng (Cu)
B. Bạc (Ag)
C. Vàng (Au)
D. Nhôm (Al)

Câu 5: Cơ quan hô hấp chính của con người là ___.`;

export const BulkQuestionImporter: React.FC<BulkQuestionImporterProps> = ({
  onImportQuestions,
  onClose,
}) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isParsed, setIsParsed] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Auto-parsing logic
  const parseBulkText = (text: string): Question[] => {
    if (!text.trim()) return [];

    // Split text into potential question blocks using regex matching "Câu X:", "Bài X:", "1.", "2/", etc.
    const rawBlocks = text
      .split(/(?=(?:Câu|Bài|Q|Question|\d+[\.\)\/])\s*\d+[\:\.\)\/]?)/i)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    // If splitting by "Câu X" produced only 1 block, try splitting by double newline
    const blocks = rawBlocks.length > 1 ? rawBlocks : text.split(/\n\s*\n/).filter(b => b.trim().length > 0);

    const questions: Question[] = [];

    blocks.forEach((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) return;

      // Extract Question title/content (Remove "Câu 1:", "1.", etc from beginning)
      let firstLine = lines[0].replace(/^(?:Câu|Bài|Q|Question|\d+[\.\)\/])\s*\d*[\:\.\)\/]?\s*/i, '');
      
      // If firstLine is empty (e.g. line was just "Câu 1:"), take lines[1]
      let questionContent = firstLine;
      let lineStartIndex = 1;
      if (!questionContent && lines.length > 1) {
        questionContent = lines[1];
        lineStartIndex = 2;
      }

      // Check for Option A, B, C, D lines
      const optionRegex = /^[A-Da-d][\.\)\:\-]\s*(.*)$/;
      const optionsFound: { label: string; text: string }[] = [];
      let nonOptionText: string[] = [];

      for (let i = lineStartIndex; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(optionRegex);
        if (match) {
          optionsFound.push({
            label: line.charAt(0).toUpperCase(),
            text: match[1].trim(),
          });
        } else {
          nonOptionText.push(line);
        }
      }

      // Append extra question description lines if any
      if (nonOptionText.length > 0 && optionsFound.length === 0) {
        questionContent += ' ' + nonOptionText.join(' ');
      }

      // Determine Type
      if (optionsFound.length >= 2) {
        // Quiz Type
        const optsArray: string[] = ['', '', '', ''];
        optionsFound.forEach(opt => {
          const idx = opt.label.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          if (idx >= 0 && idx < 4) {
            optsArray[idx] = opt.text;
          }
        });

        questions.push({
          id: Date.now() + index + Math.random(),
          type: 'quiz',
          content: questionContent || `Câu hỏi trắc nghiệm ${index + 1}`,
          options: optsArray,
        });
      } else if (questionContent.includes('___') || questionContent.includes('[...]') || questionContent.toLowerCase().includes('điền')) {
        // Fill in the blank type
        questions.push({
          id: Date.now() + index + Math.random(),
          type: 'fill',
          content: questionContent || `Câu hỏi điền khuyết ${index + 1}`,
        });
      } else {
        // Essay type
        questions.push({
          id: Date.now() + index + Math.random(),
          type: 'essay',
          content: questionContent || `Câu hỏi tự luận ${index + 1}`,
        });
      }
    });

    return questions;
  };

  const handleParseText = () => {
    const result = parseBulkText(inputText);
    setParsedQuestions(result);
    setIsParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        const parsed = parseBulkText(content);
        setParsedQuestions(parsed);
        setIsParsed(true);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) {
      alert("Chưa có câu hỏi nào được phân tích thành công!");
      return;
    }
    onImportQuestions(parsedQuestions);
    onClose();
  };

  const handleUpdateParsedQuestion = (index: number, updated: Question) => {
    setParsedQuestions(prev => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleDeleteParsedQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                ⚡ Trình Tạo Đề Thi Siêu Tốc (Import Hàng Loạt)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Dán văn bản hoặc Tải file đề Word/Text (.txt, .docx, .csv) để tự động bóc tách câu hỏi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Load Sample Button */}
          <button
            type="button"
            onClick={() => {
              setInputText(SAMPLE_TEXT);
              setFileName(null);
              const result = parseBulkText(SAMPLE_TEXT);
              setParsedQuestions(result);
              setIsParsed(true);
            }}
            className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Dùng Mẫu Đề Minh Họa (5 câu)
          </button>

          {/* Upload File Input */}
          <label className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>{fileName ? `File: ${fileName}` : 'Tải File Văn Bản (.txt, .csv, .json)'}</span>
            <input
              type="file"
              accept=".txt,.csv,.json,.md,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Clear Text */}
          <button
            type="button"
            onClick={() => {
              setInputText('');
              setParsedQuestions([]);
              setIsParsed(false);
              setFileName(null);
            }}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-slate-500" /> Xóa nội dung
          </button>
        </div>

        {/* Input Text Area vs Parsed List split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-[320px]">
          {/* Left: Input Text Area */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-700 flex justify-between items-center">
              <span>Nội dung văn bản đề thi (Gõ hoặc dán vào đây)</span>
              <span className="text-[11px] text-purple-600 font-normal">
                Hỗ trợ định dạng: Câu 1: ... A. ... B. ...
              </span>
            </label>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setIsParsed(false);
              }}
              placeholder={`Dán đề thi của thầy/cô vào đây...\nVí dụ:\nCâu 1: Nước sôi ở bao nhiêu độ?\nA. 100°C\nB. 0°C\n\nCâu 2: Tự luận: Em hãy phân tích...`}
              className="flex-1 w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 rounded-2xl border border-slate-300 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 resize-none"
            />
            <button
              onClick={handleParseText}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Bóc Tách Câu Hỏi Tự Động ({inputText.split('\n').filter(Boolean).length} dòng)
            </button>
          </div>

          {/* Right: Parsed Preview List */}
          <div className="flex flex-col space-y-2 overflow-hidden bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" /> Kết quả bóc tách:
                <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-xs">
                  {parsedQuestions.length} câu hỏi
                </strong>
              </span>

              {parsedQuestions.length > 0 && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Sẵn sàng nhập
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {parsedQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                  <HelpCircle className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-500">
                    Bấm "Bóc Tách Câu Hỏi Tự Động" hoặc "Dùng Mẫu Đề Minh Họa" để xem danh sách câu hỏi tự động bóc tách.
                  </p>
                </div>
              ) : (
                parsedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Câu {idx + 1}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            q.type === 'quiz'
                              ? 'bg-blue-100 text-blue-800'
                              : q.type === 'fill'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {q.type === 'quiz'
                            ? 'Trắc nghiệm'
                            : q.type === 'fill'
                            ? 'Điền khuyết'
                            : 'Tự luận'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteParsedQuestion(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.content}
                      onChange={(e) =>
                        handleUpdateParsedQuestion(idx, { ...q, content: e.target.value })
                      }
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-purple-500"
                    />

                    {q.type === 'quiz' && q.options && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {['A', 'B', 'C', 'D'].map((label, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1 text-[11px]">
                            <span className="font-bold text-slate-400">{label}.</span>
                            <input
                              type="text"
                              value={q.options?.[optIdx] || ''}
                              onChange={(e) => {
                                const newOpts = [...(q.options || ['', '', '', ''])];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateParsedQuestion(idx, { ...q, options: newOpts });
                              }}
                              className="w-full p-1.5 border border-slate-200 rounded text-[11px] bg-slate-50 outline-none focus:bg-white focus:border-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500 font-medium">
            💡 Mẹo: Giáo viên có thể chỉnh sửa lại từng câu hỏi trước khi đưa vào bài thi chính thức.
          </span>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
            >
              Hủy
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={parsedQuestions.length === 0}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                parsedQuestions.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Đưa {parsedQuestions.length} Câu Hỏi Vào Đề Thi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
