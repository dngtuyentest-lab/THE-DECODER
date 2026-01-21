
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Student, GameConfig, GameStatus, 
  GameType, PlayerProgress, Question 
} from './types';
import { ROWS, TABLES_PER_ROW, SEATS_PER_TABLE, ICONS } from './constants';
import ClassroomSetup from './components/ClassroomSetup';
import GameplaySetup from './components/GameplaySetup';
import GameInterface from './components/GameInterface';
import SpinWheel from './components/SpinWheel';
import { shuffleArray } from './utils';
import { PartyPopper, Trophy as TrophyIcon, RotateCw, Home } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.SETUP_CLASS);
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<GameConfig | null>(null);
  
  // Game Logic State
  const [round, setRound] = useState(1);
  const [currentStudents, setCurrentStudents] = useState<Student[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  const [studentIndex, setStudentIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [mainKeywordGuesser, setMainKeywordGuesser] = useState<Student | null>(null);
  const [winner, setWinner] = useState<{ student: Student, trophy: 'GOLD' | 'SILVER' } | null>(null);
  
  // Reward Phase
  const [rewardFor, setRewardFor] = useState<'WINNER' | 'THEME' | null>(null);
  const [receivedReward, setReceivedReward] = useState<string | null>(null);

  // Initialize classroom
  useEffect(() => {
    const initial: Student[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let t = 0; t < TABLES_PER_ROW; t++) {
        for (let s = 0; s < SEATS_PER_TABLE; s++) {
          initial.push({
            id: `seat-${r}-${t}-${s}`,
            name: '',
            isLocked: false,
            row: r,
            table: t,
            seat: s
          });
        }
      }
    }
    setStudents(initial);
  }, []);

  const handleUpdateStudent = (id: string, name: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const finalizeClassroom = () => {
    const activeStudents = students.filter(s => s.name.trim() !== '');
    if (activeStudents.length === 0) {
      alert('Vui lòng nhập ít nhất 1 học sinh!');
      return;
    }
    setStatus(GameStatus.SETUP_GAMEPLAY);
  };

  const startGame = (gameConfig: GameConfig) => {
    const activeStudents = students.filter(s => s.name.trim() !== '');
    setConfig(gameConfig);
    setCurrentStudents(shuffleArray(activeStudents));
    setStatus(GameStatus.PLAYING);
    setRound(1);
    setStudentIndex(0);
    setQuestionIndex(0);
    setEliminatedIds(new Set());
  };

  const handleAnswer = (isCorrect: boolean) => {
    const student = currentStudents[studentIndex];
    
    if (!isCorrect) {
      setEliminatedIds(prev => new Set(prev).add(student.id));
    }

    moveToNextTurn();
  };

  const moveToNextTurn = () => {
    const nextIndex = studentIndex + 1;
    
    // Check if round is over
    if (nextIndex >= currentStudents.length) {
      const remaining = currentStudents.filter(s => !eliminatedIds.has(s.id));
      
      if (remaining.length === 0) {
        // Everyone eliminated in last round? The person who just played is winner with Silver
        const lastPlayer = currentStudents[currentStudents.length - 1];
        setWinner({ student: lastPlayer, trophy: 'SILVER' });
        setStatus(GameStatus.ENDING);
      } else if (remaining.length === 1) {
        // 1 Survivor
        setWinner({ student: remaining[0], trophy: 'GOLD' });
        setStatus(GameStatus.ENDING);
      } else {
        // Next Round
        setRound(prev => prev + 1);
        setCurrentStudents(shuffleArray(remaining));
        setStudentIndex(0);
        setEliminatedIds(new Set());
        setQuestionIndex(prev => (prev + 1) % config!.questions.length);
      }
    } else {
      setStudentIndex(nextIndex);
      setQuestionIndex(prev => (prev + 1) % config!.questions.length);
    }
  };

  const handleMainKeywordGuess = () => {
    const guess = prompt("NHẬP TỪ KHÓA CHỦ ĐỀ:");
    if (!guess) return;

    if (guess.toUpperCase() === config?.mainKeyword?.toUpperCase()) {
      const luckyStudent = currentStudents[studentIndex];
      setMainKeywordGuesser(luckyStudent);
      alert(`CHÚC MỪNG ${luckyStudent.name}! Bạn đã đoán đúng Từ khóa chủ đề!`);
      
      const choice = confirm("Bạn đã có vé vào vòng trong! Bạn muốn TIẾP TỤC chơi hay DỪNG LẠI và nhận thưởng ngay?");
      if (!choice) {
        setWinner({ student: luckyStudent, trophy: 'GOLD' });
        setStatus(GameStatus.ENDING);
      } else {
        // Student automatically passes current round
        moveToNextTurn();
      }
    } else {
      alert("Rất tiếc, câu trả lời chưa chính xác!");
    }
  };

  const resetGame = () => {
    setStatus(GameStatus.SETUP_CLASS);
    setWinner(null);
    setMainKeywordGuesser(null);
    setRewardFor(null);
    setReceivedReward(null);
  };

  // Rendering logic
  const renderContent = () => {
    switch (status) {
      case GameStatus.SETUP_CLASS:
        return (
          <ClassroomSetup 
            students={students} 
            onUpdateStudent={handleUpdateStudent} 
            onFinalize={finalizeClassroom}
          />
        );
      case GameStatus.SETUP_GAMEPLAY:
        return (
          <GameplaySetup 
            onBack={() => setStatus(GameStatus.SETUP_CLASS)}
            onStartGame={startGame}
          />
        );
      case GameStatus.PLAYING:
        return (
          <div className="pt-10">
            <div className="max-w-4xl mx-auto px-6 mb-4 flex justify-between items-end">
               <div>
                  <span className="text-blue-600 font-black text-4xl mr-3">VÒNG {round}</span>
                  <span className="text-slate-400 font-bold">HS {studentIndex + 1}/{currentStudents.length}</span>
               </div>
               <div className="flex gap-2">
                 {currentStudents.map((s, idx) => (
                   <div 
                    key={s.id} 
                    className={`w-3 h-3 rounded-full ${
                      idx === studentIndex ? 'bg-blue-600 scale-125' : 
                      eliminatedIds.has(s.id) ? 'bg-red-200' : 'bg-slate-200'
                    }`} 
                   />
                 ))}
               </div>
            </div>
            <GameInterface 
              currentStudent={currentStudents[studentIndex]}
              currentQuestion={config!.questions[questionIndex]}
              config={config!}
              onAnswer={handleAnswer}
              onGuessMainKeyword={handleMainKeywordGuess}
            />
          </div>
        );
      case GameStatus.ENDING:
        return (
          <div className="max-w-4xl mx-auto p-10 text-center animate-fadeIn">
            <div className="mb-12">
               <PartyPopper className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-bounce" />
               <h1 className="text-5xl font-black text-slate-800 mb-2">KẾT THÚC TRÒ CHƠI</h1>
               <p className="text-slate-500 text-xl">Những nhà giải mã tài ba đã lộ diện!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
               {/* Winner Card */}
               <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-yellow-400">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrophyIcon className={`w-10 h-10 ${winner?.trophy === 'GOLD' ? 'text-yellow-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Quán quân</h3>
                  <div className="text-3xl font-black text-slate-800 mb-4">{winner?.student.name}</div>
                  <button 
                    onClick={() => { setRewardFor('WINNER'); setReceivedReward(null); }}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all"
                  >
                    NHẬN THƯỞNG 🎁
                  </button>
               </div>

               {/* Theme Guesser Card */}
               {mainKeywordGuesser && (
                 <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-indigo-400">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PartyPopper className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Giải Mã Chủ Đề</h3>
                    <div className="text-3xl font-black text-slate-800 mb-4">{mainKeywordGuesser.name}</div>
                    <button 
                      onClick={() => { setRewardFor('THEME'); setReceivedReward(null); }}
                      className="w-full py-3 bg-indigo-400 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
                    >
                      NHẬN THƯỞNG 🎁
                    </button>
                 </div>
               )}
            </div>

            {/* Reward Modal */}
            {rewardFor && (
              <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl animate-scaleIn">
                  <h2 className="text-3xl font-black text-center mb-8">
                    PHẦN THƯỞNG CHO {rewardFor === 'WINNER' ? winner?.student.name : mainKeywordGuesser?.name}
                  </h2>
                  
                  {!receivedReward ? (
                    <SpinWheel 
                      items={config?.rewards || []} 
                      onFinish={(item) => setReceivedReward(item)} 
                    />
                  ) : (
                    <div className="text-center space-y-8 animate-fadeIn">
                       <div className="text-6xl mb-4">✨ 🎁 ✨</div>
                       <div className="text-2xl text-slate-500">Phần thưởng của bạn là:</div>
                       <div className="text-6xl font-black text-blue-600 bg-blue-50 py-10 rounded-3xl border-4 border-blue-200 uppercase tracking-widest">
                          {receivedReward}
                       </div>
                       <button 
                         onClick={() => setRewardFor(null)}
                         className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold"
                       >
                         XONG
                       </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 mx-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all"
              >
                <Home className="w-5 h-5" /> Trở về Trang chủ
              </button>
              <p className="text-slate-400 italic">Cảm ơn các bạn đã tham gia chơi "The Decoder"!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-blue-100">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">D</div>
          <span className="font-black text-xl tracking-tighter text-slate-800">THE DECODER</span>
        </div>
        <div className="flex items-center gap-6">
          <div className={`text-sm font-bold flex items-center gap-2 ${status === GameStatus.SETUP_CLASS ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
            Sơ đồ lớp
          </div>
          <div className={`text-sm font-bold flex items-center gap-2 ${status === GameStatus.SETUP_GAMEPLAY ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
            Gameplay
          </div>
          <div className={`text-sm font-bold flex items-center gap-2 ${status === GameStatus.PLAYING ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">3</span>
            Trò chơi
          </div>
        </div>
      </nav>

      <main className="py-8">
        {renderContent()}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default App;
