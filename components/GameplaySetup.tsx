
import React, { useState } from 'react';
import { GameConfig, GameType, Question } from '../types';
import { ICONS } from '../constants';
import { Plus, Trash2 } from 'lucide-react';

interface GameplaySetupProps {
  onStartGame: (config: GameConfig) => void;
  onBack: () => void;
}

const GameplaySetup: React.FC<GameplaySetupProps> = ({ onStartGame, onBack }) => {
  const [type, setType] = useState<GameType>(GameType.RANDOM);
  const [mainKeyword, setMainKeyword] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', answer: '' }
  ]);
  const [rewards, setRewards] = useState<string[]>(['Kẹo', 'Bút', 'Điểm 10', 'Voucher']);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), question: '', answer: '' }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleStart = () => {
    if (questions.some(q => !q.answer)) {
      alert('Vui lòng nhập đầy đủ đáp án cho tất cả câu hỏi!');
      return;
    }
    if (type === GameType.THEMED && !mainKeyword) {
      alert('Vui lòng nhập Từ khóa Chủ đề!');
      return;
    }
    onStartGame({ type, mainKeyword, questions, rewards });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          {ICONS.Setup} Thiết lập Gameplay
        </h1>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 font-medium">Quay lại</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setType(GameType.RANDOM)}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            type === GameType.RANDOM 
            ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' 
            : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-bold mb-1">Type 1: Ngẫu nhiên</div>
          <p className="text-slate-500 text-sm">Các từ khóa không theo chủ đề nhất định.</p>
        </button>
        <button
          onClick={() => setType(GameType.THEMED)}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            type === GameType.THEMED 
            ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' 
            : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-bold mb-1">Type 2: Chủ đề</div>
          <p className="text-slate-500 text-sm">Có một "Từ khóa chính" ẩn giấu từ các đáp án.</p>
        </button>
      </div>

      {type === GameType.THEMED && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8">
          <label className="block text-amber-800 font-bold mb-2">TỪ KHÓA CHỦ ĐỀ</label>
          <input
            type="text"
            value={mainKeyword}
            onChange={(e) => setMainKeyword(e.target.value.toUpperCase())}
            placeholder="Ví dụ: MÙA XUÂN"
            className="w-full p-4 border border-amber-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none uppercase font-mono text-xl tracking-widest"
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-slate-800">Danh sách Câu hỏi & Từ khóa</h2>
          <button 
            onClick={addQuestion}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold"
          >
            <Plus className="w-5 h-5" /> Thêm câu hỏi
          </button>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start group">
            <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-slate-500">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                placeholder="Câu hỏi (Gợi ý)..."
                value={q.question}
                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                className="w-full p-3 bg-slate-50 border-transparent border focus:border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <input
                type="text"
                placeholder="Từ khóa trả lời (viết liền không dấu)..."
                value={q.answer}
                onChange={(e) => updateQuestion(q.id, 'answer', e.target.value.toUpperCase())}
                className="w-full p-3 bg-slate-50 border-transparent border focus:border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none font-bold tracking-wider"
              />
            </div>
            {questions.length > 1 && (
              <button 
                onClick={() => removeQuestion(q.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-50 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          {ICONS.Reward} Thiết lập Phần thưởng
        </h2>
        <div className="flex flex-wrap gap-2">
          {rewards.map((r, i) => (
            <div key={i} className="bg-white px-4 py-2 rounded-full border border-indigo-100 text-indigo-700 font-medium shadow-sm">
              {r}
            </div>
          ))}
          <input 
            type="text" 
            placeholder="+ Thêm phần thưởng"
            className="px-4 py-2 rounded-full border border-dashed border-indigo-300 bg-transparent text-sm focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                if (val) {
                  setRewards([...rewards, val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-slate-200 text-center">
        <button 
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full font-black text-lg transition-all shadow-xl hover:shadow-green-200 active:scale-95 uppercase tracking-widest"
        >
          Bắt đầu Trò chơi 🚀
        </button>
      </div>
    </div>
  );
};

export default GameplaySetup;
