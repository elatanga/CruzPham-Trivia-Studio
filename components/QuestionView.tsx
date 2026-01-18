
import React, { useEffect, useState } from 'react';
import { useGame } from './GameContext';

const QuestionView: React.FC = () => {
  const { state, dispatch, playSound, log } = useGame();
  const { activeTemplate, activeQuestionId, isAnswerRevealed, timer, isTimerRunning } = state;

  if (!activeTemplate || !activeQuestionId) return null;

  // Find the question data
  let questionData: any = null;
  let catIndex = -1;
  let qIndex = -1;

  activeTemplate.categories.forEach((cat, cIdx) => {
    cat.questions.forEach((q, qIdx) => {
      if (q.id === activeQuestionId) {
        questionData = { ...q, categoryTitle: cat.title };
        catIndex = cIdx;
        qIndex = qIdx;
      }
    });
  });

  if (!questionData) return null;

  // Double or Nothing Logic
  const effectivePoints = questionData.isDailyDouble ? questionData.points * 2 : questionData.points;
  const isDouble = !!questionData.isDailyDouble;

  useEffect(() => {
    playSound('select');
    const typeLabel = isDouble ? 'DOUBLE OR NOTHING' : 'Standard';
    log(`Opened ${questionData.categoryTitle} (${typeLabel}) for ${effectivePoints}`);
  }, []);

  useEffect(() => {
    if (isAnswerRevealed) {
        playSound('reveal');
        log(`Answer Revealed: ${questionData.answer}`);
    }
  }, [isAnswerRevealed]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      dispatch({ type: 'REVEAL_ANSWER', payload: !isAnswerRevealed });
    }
    if (e.code === 'Escape') {
       dispatch({ type: 'SET_ACTIVE_QUESTION', payload: null });
    }
    if (e.code === 'KeyT') {
        dispatch({ type: 'TOGGLE_TIMER', payload: !isTimerRunning });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, isTimerRunning]);

  const handleStatus = (status: 'completed' | 'void') => {
    dispatch({ type: 'MARK_QUESTION_STATUS', payload: { categoryIndex: catIndex, questionIndex: qIndex, status } });
  };

  // Calculate timer progress circle
  const maxTime = activeTemplate.settings.timerDuration || 30;
  const timerPercentage = (timer / maxTime) * 100;
  const circleCircumference = 2 * Math.PI * 24; // r=24
  const strokeDashoffset = circleCircumference - (timerPercentage / 100) * circleCircumference;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
       {/* Background Ambience */}
       <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isDouble ? 'from-purple-900/40 via-black to-black' : 'from-[#d4af37]/10 via-black to-black'} opacity-60`}></div>
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

       {/* Double or Nothing Splash Background Effect */}
       {isDouble && (
           <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(212,175,55,0.1),transparent)] animate-[spin_4s_linear_infinite]"></div>
           </div>
       )}

       {/* Top Info Bar */}
       <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20">
          <div className="flex flex-col items-start">
             <div className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em] font-bold mb-1">Active Category</div>
             <h3 className="text-white font-display font-bold text-2xl md:text-3xl uppercase tracking-wider drop-shadow-lg">
                {questionData.categoryTitle}
             </h3>
          </div>
          
          <div className="flex flex-col items-end">
             <div className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em] font-bold mb-1">Value</div>
             <div className={`text-4xl md:text-5xl font-display font-black ${isDouble ? 'text-[#d4af37] scale-110' : 'text-white gold-gradient'} drop-shadow-2xl transition-all`}>
                {effectivePoints}
             </div>
             {isDouble && <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1 animate-pulse">2x Multiplier Active</span>}
          </div>
       </div>

       {/* Timer UI (Top Center) */}
       <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 group cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_TIMER', payload: !isTimerRunning })}>
          <div className="relative w-20 h-20 flex items-center justify-center">
             <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="50%" cy="50%" r="24" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
                <circle 
                    cx="50%" cy="50%" r="24" 
                    stroke={timer <= 5 ? '#ef4444' : '#d4af37'} 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={circleCircumference} 
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 linear"
                />
             </svg>
             <span className={`absolute text-xl font-mono font-bold ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timer}
             </span>
             <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                {isTimerRunning ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
             </div>
          </div>
       </div>

       {/* Main Content Stage */}
       <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center justify-center min-h-[60vh] space-y-12">
          
          {/* Double or Nothing Banner */}
          {isDouble && (
              <div className="absolute -top-16 animate-in zoom-in slide-in-from-top-4 duration-1000">
                  <div className="px-8 py-2 border-y border-[#d4af37] bg-black/80 backdrop-blur-md">
                      <h2 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-white to-[#d4af37] tracking-widest uppercase animate-pulse drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
                          Double or Nothing
                      </h2>
                  </div>
              </div>
          )}

          {/* Media Container */}
          {(questionData.type === 'image' || questionData.type === 'audio') && questionData.mediaUrl && (
              <div className="w-full max-w-3xl aspect-video relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-700">
                  {questionData.type === 'image' ? (
                      <img src={questionData.mediaUrl} alt="Clue" className="w-full h-full object-contain bg-black" />
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
                          <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] flex items-center justify-center mb-6 animate-pulse">
                             <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                          </div>
                          <audio controls src={questionData.mediaUrl} className="w-3/4 max-w-md" />
                      </div>
                  )}
              </div>
          )}

          {/* Question Prompt */}
          <div className="relative">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white text-center leading-tight drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-6xl mx-auto">
                  {questionData.prompt}
              </h1>
          </div>

          {/* Answer Reveal Stage */}
          <div className={`transition-all duration-1000 ease-out transform ${isAnswerRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
             <div className="relative group">
                {/* Glow behind answer */}
                <div className="absolute inset-0 bg-[#d4af37] blur-[60px] opacity-30 rounded-full"></div>
                
                <div className="relative bg-black/80 backdrop-blur-2xl border border-[#d4af37]/50 px-16 py-8 rounded-[2rem] shadow-[0_0_50px_rgba(212,175,55,0.2)] flex items-center justify-center">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-[#d4af37] gold-gradient tracking-tight text-center">
                        {questionData.answer}
                    </h2>
                </div>
             </div>
          </div>
       </div>

       {/* Control Deck (Bottom) */}
       <div className="absolute bottom-12 w-full max-w-4xl px-6 flex items-center justify-between z-20">
          <button 
             onClick={() => handleStatus('void')}
             className="group flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 bg-black/40 hover:bg-red-900/20 hover:border-red-500/50 transition-all"
          >
             <div className="w-2 h-2 rounded-full bg-red-500 opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
             <span className="text-[10px] text-white/40 group-hover:text-red-400 uppercase tracking-[0.2em] font-bold">Void Tile</span>
          </button>
          
          <button 
             onClick={() => dispatch({ type: 'REVEAL_ANSWER', payload: !isAnswerRevealed })}
             className="px-16 py-6 bg-[#d4af37] text-black font-black rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 hover:bg-white transition-all uppercase tracking-[0.3em] text-xs shimmer overflow-hidden relative"
          >
             {isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}
          </button>

          <button 
             onClick={() => handleStatus('completed')}
             className="group flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 bg-black/40 hover:bg-green-900/20 hover:border-green-500/50 transition-all"
          >
             <span className="text-[10px] text-white/40 group-hover:text-green-400 uppercase tracking-[0.2em] font-bold">Mark Complete</span>
             <div className="w-2 h-2 rounded-full bg-green-500 opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
          </button>
       </div>

       <div className="absolute top-8 right-8 text-white/20 text-[10px] uppercase tracking-widest font-mono hidden md:block">
          [ESC] Return
       </div>
    </div>
  );
};

export default QuestionView;
