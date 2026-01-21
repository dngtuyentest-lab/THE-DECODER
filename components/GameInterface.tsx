
import React, { useState, useEffect, useRef } from 'react';
import { Question, Student, GameConfig, GameType } from '../types';
import { shuffleString } from '../utils';
import { ICONS } from '../constants';
import { Trophy, HelpCircle, MessageSquare } from 'lucide-react';

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
  const [userAnswer, setUserAnswer] = useState<string[]>(new Array(currentQuestion.answer.length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const scrambled = useRef(shuffleString(currentQuestion.answer));

  useEffect(() => {
    setUserAnswer(new Array(currentQuestion.answer.length).fill(''));
    scrambled.current = shuffleString(currentQuestion.answer);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [currentQuestion]);

  const handleInputChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (!char.match(/[A-Z0-9]/) && char !== '') return;

    const newAnswer = [...userAnswer];
    newAnswer[index] = char;
    setUserAnswer(newAnswer);

    if (char && index < currentQuestion.answer.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !userAnswer[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const checkAnswer = () => {
    const isCorrect = userAnswer.join('') === currentQuestion.answer;
    onAnswer(isCorrect);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-blue-600 px-8 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-bold">
              {currentStudent.name[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs opacity-75 uppercase font-bold tracking-widest">Đang trả lời</div>
              <div className="font-bold text-lg">{currentStudent.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-xl">
             <Trophy className="w-5 h-5 text-yellow-400" />
             <span className="font-bold tracking-tighter">THE DECODER</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 text-center space-y-12">
          {/* Question Display */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase text-sm">
              <HelpCircle className="w-4 h-4" /> Câu hỏi / Gợi ý
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
              {currentQuestion.question || "Hãy giải mã từ khóa sau!"}
            </h2>
          </div>

          {/* Scrambled Word */}
          <div className="py-6 px-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 inline-block">
             <div className="text-slate-400 text-xs font-bold uppercase mb-3 tracking-widest">Từ bị xáo trộn</div>
             <div className="flex justify-center gap-3">
               {scrambled.current.split('').map((char, i) => (
                 <div key={i} className="w-14 h-14 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-2xl font-black text-blue-600 shadow-sm rotate-2 hover:rotate-0 transition-transform">
                   {char}
                 </div>
               ))}
             </div>
          </div>

          {/* Answer Input Area */}
          <div className="space-y-6">
            <div className="flex justify-center flex-wrap gap-2">
              {userAnswer.map((char, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={char}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-16 text-3xl font-black text-center border-b-4 border-slate-200 focus:border-blue-500 bg-transparent outline-none transition-all placeholder-slate-200"
                  placeholder="_"
                />
              ))}
            </div>
            <button
              onClick={checkAnswer}
              className="mt-4 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-lg transition-all shadow-xl active:scale-95"
            >
              NỘP BÀI ✅
            </button>
          </div>

          {/* Bonus Option */}
          {config.type === GameType.THEMED && (
            <div className="pt-8 border-t border-slate-100">
               <button
                 onClick={onGuessMainKeyword}
                 className="flex items-center gap-3 mx-auto px-6 py-3 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition-all font-bold group"
               >
                 <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 BẠN MUỐN ĐOÁN TỪ KHÓA CHỦ ĐỀ?
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
