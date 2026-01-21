
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
import { PartyPopper, Trophy as TrophyIcon, Home, CheckCircle, XCircle, KeyRound, Sparkles } from 'lucide-react';

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
  
  // Interaction State
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [keywordGuess, setKeywordGuess] = useState('');
  
  // Reward Phase
  const [rewardFor, setRewardFor] = useState<'WINNER' | 'THEME' | null>(null);
  const [receivedReward, setReceivedReward] = useState<string | null>(null);

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
    setFeedback(null);
  };

  const handleAnswer = (isCorrect: boolean) => {
    const student = currentStudents[studentIndex];
    
    if (isCorrect) {
      setFeedback('CORRECT');
    } else {
      setFeedback('WRONG');
      setEliminatedIds(prev => new Set(prev).add(student.id));
    }

    setTimeout(() => {
      setFeedback(null);
      moveToNextTurn();
    }, 1500);
  };

  const moveToNextTurn = () => {
    const nextIndex = studentIndex + 1;
    
    if (nextIndex >= currentStudents.length) {
      const remaining = currentStudents.filter(s => !eliminatedIds.has(s.id));
      
      if (remaining.length === 0) {
        const lastPlayer = currentStudents[currentStudents.length - 1];
        setWinner({ student: lastPlayer, trophy: 'SILVER' });
        setStatus(GameStatus.ENDING);
      } else if (remaining.length === 1) {
        setWinner({ student: remaining[0], trophy: 'GOLD' });
        setStatus(GameStatus.ENDING);
      } else {
        setRound(prev => prev + 1);
        setCurrentStudents(shuffleArray(remaining));
        setStudentIndex(0);
        setEliminatedIds(new Set());
        setQuestionIndex(Math.floor(Math.random() * config!.questions.length));
      }
    } else {
      setStudentIndex(nextIndex);
      setQuestionIndex(Math.floor(Math.random() * config!.questions.length));
    }
  };

  const processKeywordGuess = () => {
    if (keywordGuess.toUpperCase() === config?.mainKeyword?.toUpperCase()) {
      const luckyStudent = currentStudents[studentIndex];
      setMainKeywordGuesser(luckyStudent);
      setIsKeywordModalOpen(false);
      setFeedback('CORRECT');
      
      setTimeout(() => {
        setFeedback(null);
        const choice = confirm(`CHÚC MỪNG ${luckyStudent.name}! Bạn có muốn nhận thưởng & DỪNG LẠI (OK) hay TIẾP TỤC chơi (Cancel)?`);
        if (choice) {
          setWinner({ student: luckyStudent, trophy: 'GOLD' });
          setStatus(GameStatus.ENDING);
        } else {
          moveToNextTurn();
        }
      }, 1000);
    } else {
      alert("Sai rồi! Hãy tiếp tục giải mã các từ khóa khác.");
      setIsKeywordModalOpen(false);
      setKeywordGuess('');
    }
  };

  const resetGame = () => {
    setStatus(GameStatus.SETUP_CLASS);
    setWinner(null);
    setMainKeywordGuesser(null);
    setRewardFor(null);
    setReceivedReward(null);
    setFeedback(null);
  };

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
          <div className="pt-6 relative min-h-[80vh]">
            {/* Round Stats */}
            <div className="max-w-4xl mx-auto px-6 mb-6 flex justify-between items-center">
               <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <span className="text-blue-600 font-black text-3xl">VÒNG {round}</span>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    Học sinh {studentIndex + 1} / {currentStudents.length}
                  </span>
               </div>
               <div className="flex gap-1.5">
                 {currentStudents.map((s, idx) => (
                   <div 
                    key={s.id} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      idx === studentIndex ? 'bg-blue-600 scale-150 ring-4 ring-blue-100' : 
                      eliminatedIds.has(s.id) ? 'bg-red-300 opacity-50' : 'bg-slate-200'
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
              onGuessMainKeyword={() => setIsKeywordModalOpen(true)}
            />

            {/* Feedback Overlay */}
            {feedback && (
              <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fadeIn backdrop-blur-md ${
                feedback === 'CORRECT' ? 'bg-green-600/90' : 'bg-red-600/90'
              }`}>
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl scale-125 animate-scaleIn flex flex-col items-center gap-6">
                  {feedback === 'CORRECT' ? (
                    <>
                      <CheckCircle className="w-32 h-32 text-green-500 animate-bounce" />
                      <div className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Chính Xác!</div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-32 h-32 text-red-500 animate-shake" />
                      <div className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Bị Loại!</div>
                    </>
                  )}
                  <div className="text-xl font-bold text-slate-400">{currentStudents[studentIndex].name}</div>
                </div>
              </div>
            )}

            {/* Keyword Decoder Modal */}
            {isKeywordModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-scaleIn border-t-8 border-amber-400">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase">Giải Mã Chủ Đề</h2>
                  </div>
                  <p className="text-slate-500 mb-8 font-medium">Nhập từ khóa chủ đề bạn đã suy luận được:</p>
                  <input
                    autoFocus
                    type="text"
                    value={keywordGuess}
                    onChange={(e) => setKeywordGuess(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && processKeywordGuess()}
                    className="w-full p-6 bg-slate-50 border-2 border-amber-200 rounded-2xl text-3xl font-black text-center text-amber-700 focus:ring-4 focus:ring-amber-100 outline-none uppercase placeholder-slate-200 mb-8 tracking-widest"
                    placeholder="..."
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setIsKeywordModalOpen(false); setKeywordGuess(''); }}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl"
                    >
                      Bỏ qua
                    </button>
                    <button 
                      onClick={processKeywordGuess}
                      className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-lg shadow-amber-100"
                    >
                      XÁC NHẬN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case GameStatus.ENDING:
        return (
          <div className="max-w-4xl mx-auto p-10 text-center animate-fadeIn">
            <div className="mb-12 relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12">
                  <Sparkles className="w-24 h-24 text-yellow-400 animate-pulse" />
               </div>
               <PartyPopper className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-bounce" />
               <h1 className="text-6xl font-black text-slate-800 mb-2 tracking-tighter">TỔNG KẾT</h1>
               <p className="text-slate-500 text-xl font-medium">Chiến dịch giải mã đã hoàn tất xuất sắc!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
               <div className="group bg-white p-8 rounded-[3rem] shadow-xl border-t-[12px] border-yellow-400 transition-all hover:-translate-y-2">
                  <div className="bg-yellow-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-0 transition-transform">
                    <TrophyIcon className={`w-12 h-12 ${winner?.trophy === 'GOLD' ? 'text-yellow-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-2">QUÁN QUÂN</h3>
                  <div className="text-4xl font-black text-slate-800 mb-8 tracking-tight">{winner?.student.name}</div>
                  <button 
                    onClick={() => { setRewardFor('WINNER'); setReceivedReward(null); }}
                    className="w-full py-5 bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-yellow-200"
                  >
                    NHẬN THƯỞNG 🎁
                  </button>
               </div>

               {mainKeywordGuesser && (
                 <div className="group bg-white p-8 rounded-[3rem] shadow-xl border-t-[12px] border-indigo-500 transition-all hover:-translate-y-2">
                    <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-3 group-hover:rotate-0 transition-transform">
                      <KeyRound className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-2">BẬC THẦY CHỦ ĐỀ</h3>
                    <div className="text-4xl font-black text-slate-800 mb-8 tracking-tight">{mainKeywordGuesser.name}</div>
                    <button 
                      onClick={() => { setRewardFor('THEME'); setReceivedReward(null); }}
                      className="w-full py-5 bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-indigo-200"
                    >
                      NHẬN THƯỞNG 🎁
                    </button>
                 </div>
               )}
            </div>

            {rewardFor && (
              <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-scaleIn">
                  <h2 className="text-4xl font-black text-center mb-10 text-slate-800 tracking-tighter uppercase">
                    VÒNG QUAY MAY MẮN
                  </h2>
                  
                  {!receivedReward ? (
                    <SpinWheel 
                      items={config?.rewards || []} 
                      onFinish={(item) => setReceivedReward(item)} 
                    />
                  ) : (
                    <div className="text-center space-y-10 animate-fadeIn py-10">
                       <div className="text-7xl mb-4 animate-bounce">🎊</div>
                       <div>
                          <div className="text-xl text-slate-400 font-bold uppercase tracking-widest mb-2">Chúc mừng bạn đã nhận</div>
                          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 py-6 uppercase tracking-tight">
                              {receivedReward}
                          </div>
                       </div>
                       <button 
                         onClick={() => setRewardFor(null)}
                         className="px-16 py-5 bg-slate-900 text-white rounded-full font-black text-xl hover:bg-slate-800 transition-all shadow-2xl"
                       >
                         TUYỆT VỜI
                       </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-20">
              <button 
                onClick={resetGame}
                className="group flex items-center gap-3 mx-auto px-10 py-5 bg-white text-slate-700 rounded-3xl font-black text-lg transition-all border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50"
              >
                <Home className="w-6 h-6 group-hover:scale-110 transition-transform" /> TRỞ VỀ TRANG CHỦ
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-blue-100 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-200 text-2xl">D</div>
          <span className="font-black text-2xl tracking-tighter text-slate-800">THE DECODER</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <div className={`text-sm font-black flex items-center gap-3 ${status === GameStatus.SETUP_CLASS ? 'text-blue-600' : 'text-slate-300'}`}>
            <span className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors ${status === GameStatus.SETUP_CLASS ? 'border-blue-600' : 'border-slate-200'}`}>1</span>
            SƠ ĐỒ LỚP
          </div>
          <div className={`text-sm font-black flex items-center gap-3 ${status === GameStatus.SETUP_GAMEPLAY ? 'text-blue-600' : 'text-slate-300'}`}>
            <span className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors ${status === GameStatus.SETUP_GAMEPLAY ? 'border-blue-600' : 'border-slate-200'}`}>2</span>
            GAMEPLAY
          </div>
          <div className={`text-sm font-black flex items-center gap-3 ${status === GameStatus.PLAYING ? 'text-blue-600' : 'text-slate-300'}`}>
            <span className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors ${status === GameStatus.PLAYING ? 'border-blue-600' : 'border-slate-200'}`}>3</span>
            GIẢI MÃ
          </div>
        </div>
      </nav>

      <main>
        {renderContent()}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.8) translateY(20px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
