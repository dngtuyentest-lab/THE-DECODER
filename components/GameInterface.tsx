
import React, { useState, useEffect, useCallback } from 'react';
import { Question, Student, GameConfig, GameType } from '../types';
import { shuffleString } from '../utils';
import { HelpCircle, MessageSquare, ChevronLeft, RotateCcw } from 'lucide-react';

interface GameInterfaceProps {
  currentStudent: Student;
  currentQuestion: Question;
  config: GameConfig;
  onAnswer: (isCorrect: boolean) => void;
  onGuessMainKeyword: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ 
  currentStudent, 
  currentQuestion, 
  config, 
  onAnswer,
  onGuessMainKeyword 
}) => {
  const [selectedLetters, setSelectedLetters] = useState<{char: string, originalIdx: number}[]>([]);
  const [scrambledPool, setScrambledPool] = useState<{char: string, originalIdx: number, isUsed: boolean}[]>([]);

  // Initialize the pool when the question changes
  useEffect(() => {
    const chars = shuffleString(currentQuestion.answer).split('');
    setScrambledPool(chars.map((char, idx) => ({ char, originalIdx: idx, isUsed: false })));
    setSelectedLetters([]);
  }, [currentQuestion]);

  // Handle clicking a tile in the pool
  const handlePoolClick = (poolIdx: number) => {
    const item = scrambledPool[poolIdx];
    if (item.isUsed) return;

    const newPool = [...scrambledPool];
    newPool[poolIdx].isUsed = true;
    setScrambledPool(newPool);
    setSelectedLetters([...selectedLetters, { char: item.char, originalIdx: poolIdx }]);
  };

  // Handle clicking a letter in the answer slots (to remove it)
  const handleRemoveLetter = (answerIdx: number) => {
    const itemToRemove = selectedLetters[answerIdx];
    const newPool = [...scrambledPool];
    newPool[itemToRemove.originalIdx].isUsed = false;
    
    setScrambledPool(newPool);
    setSelectedLetters(selectedLetters.filter((_, i) => i !== answerIdx));
  };

  const handleReset = () => {
    setScrambledPool(scrambledPool.map(item => ({ ...item, isUsed: false })));
    setSelectedLetters([]);
  };

  const checkAnswer = () => {
    const finalAnswer = selectedLetters.map(l => l.char).join('');
    onAnswer(finalAnswer === currentQuestion.answer.toUpperCase());
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'BACKSPACE') {
        if (selectedLetters.length > 0) handleRemoveLetter(selectedLetters.length - 1);
      } else if (key === 'ENTER') {
        if (selectedLetters.length === currentQuestion.answer.length) checkAnswer();
      } else if (key.length === 1 && key.match(/[A-Z0-9]/)) {
        const availableIdx = scrambledPool.findIndex(item => item.char === key && !item.isUsed);
        if (availableIdx !== -1) handlePoolClick(availableIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLetters, scrambledPool, currentQuestion]);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl shadow-inner border border-white/30">
              {currentStudent.name[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-blue-100 uppercase font-black tracking-[0.2em]">Người Giải Mã</div>
              <div className="font-extrabold text-2xl drop-shadow-sm">{currentStudent.name}</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10">
             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
             <span className="font-bold text-sm tracking-widest uppercase">Live Session</span>
          </div>
        </div>

        <div className="p-8 sm:p-12 text-center space-y-12">
          {/* Question Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-indigo-500 font-bold uppercase text-xs tracking-widest">
              <HelpCircle className="w-4 h-4" /> Gợi ý từ hệ thống
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
              {currentQuestion.question || "Sắp xếp lại các chữ cái để tạo thành từ đúng!"}
            </h2>
          </div>

          {/* Answer Area (Slots) */}
          <div className="flex flex-wrap justify-center gap-3 min-h-[5rem]">
            {Array.from({ length: currentQuestion.answer.length }).map((_, i) => {
              const selected = selectedLetters[i];
              return (
                <button
                  key={`slot-${i}`}
                  onClick={() => selected && handleRemoveLetter(i)}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center text-3xl font-black transition-all transform hover:scale-105 active:scale-95 ${
                    selected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-b-4 border-blue-800' 
                    : 'bg-slate-50 border-2 border-dashed border-slate-200 text-slate-200'
                  }`}
                >
                  {selected?.char || ""}
                </button>
              );
            })}
          </div>

          {/* Pool of Letters */}
          <div className="bg-slate-50/50 p-8 rounded-[2rem] border-2 border-slate-100">
             <div className="flex flex-wrap justify-center gap-3">
               {scrambledPool.map((item, i) => (
                 <button
                   key={`pool-${i}`}
                   disabled={item.isUsed}
                   onClick={() => handlePoolClick(i)}
                   className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all shadow-sm ${
                     item.isUsed 
                     ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-30 scale-90' 
                     : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-1 active:translate-y-0'
                   }`}
                 >
                   {item.char}
                 </button>
               ))}
             </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Xóa hết
            </button>
            <button
              onClick={checkAnswer}
              disabled={selectedLetters.length !== currentQuestion.answer.length}
              className={`px-12 py-5 rounded-full font-black text-xl transition-all shadow-2xl active:scale-95 uppercase tracking-widest ${
                selectedLetters.length === currentQuestion.answer.length
                ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Xác nhận 🚀
            </button>
          </div>

          {/* Theme Keyword Hint */}
          {config.type === GameType.THEMED && (
            <div className="pt-8 border-t border-slate-100">
               <button
                 onClick={onGuessMainKeyword}
                 className="group relative flex items-center gap-3 mx-auto px-8 py-4 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition-all font-black overflow-hidden"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                 <MessageSquare className="w-6 h-6 animate-pulse" />
                 ĐOÁN TỪ KHÓA CHỦ ĐỀ
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
