
import React, { useEffect, useState } from 'react';
import { useGame } from './GameContext';

const QuestionView: React.FC = () => {
  const { state, dispatch, playSound } = useGame();
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);

  const session = state.gameSession;
  const active = session?.activeQuestion;
  const template = state.templates.find(t => t.id === state.currentTemplateId);
  const category = template?.categories.find(c => c.id === active?.categoryId);
  const question = template?.clues.find(q => q.id === active?.clueId);

  useEffect(() => {
    if (!active || !session || !question) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;
      
      // Fullscreen Toggle
      if (key === 'KeyF') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }

      // Quick Award Digits 1-8
      if (key.startsWith('Digit')) {
        const index = parseInt(key.replace('Digit', '')) - 1;
        if (index >= 0 && index < session.scoreboard.length) {
          const player = session.scoreboard[index];
          if (player.active) {
            dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, scoreDelta: question.points } });
            playSound('correct');
            dispatch({ type: 'ADD_EVENT', payload: `${player.name} +${question.points} Points` });
            setLastPlayerId(player.id);
          }
        }
      }

      // Fine Tune Adjustments (+/-)
      if (key === 'Equal' || key === 'NumpadAdd' || key === 'Minus' || key === 'NumpadSubtract') {
        if (lastPlayerId) {
          const delta = (key === 'Equal' || key === 'NumpadAdd') ? 100 : -100;
          dispatch({ type: 'UPDATE_PLAYER', payload: { id: lastPlayerId, scoreDelta: delta } });
          playSound(delta > 0 ? 'correct' : 'wrong');
        }
      }

      // Space: Toggle Answer
      if (key === 'Space') {
        e.preventDefault();
        dispatch({ type: 'REVEAL_ANSWER' });
        playSound('reveal');
      } 
      
      // Escape: Return to Board
      else if (key === 'Escape') {
        dispatch({ type: 'SELECT_QUESTION', payload: null });
      } 
      
      // Enter: Close Clue
      else if (key === 'Enter' && session.showAnswer) {
        dispatch({ type: 'SET_QUESTION_STATUS', payload: { clueId: active.clueId, status: 'answered' } });
        playSound('select');
      } 
      
      // T: Toggle Timer
      else if (key === 'KeyT') {
        if (session.timer === null || session.timer === 0) {
          dispatch({ type: 'SET_TIMER', payload: session.defaultTimerDuration });
          playSound('timer');
        } else {
          dispatch({ type: 'TOGGLE_TIMER_RUNNING' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, active, category, question, dispatch, playSound, lastPlayerId]);

  if (!active || !session || !question) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-in fade-in zoom-in duration-700 backdrop-blur-3xl overflow-hidden p-8 md:p-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-7xl h-full flex flex-col justify-between items-center relative z-10 py-12 md:py-20">
        
        <div className="w-full text-center space-y-4 md:space-y-8">
          <p className="text-xl md:text-3xl font-display text-[#d4af37] tracking-[0.6em] uppercase font-black italic opacity-40">
             {category?.title} — {question.points}
          </p>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center w-full space-y-12">
          {question.mediaUrl && (
            <div className="w-full max-w-3xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-2 border-[#d4af37]/20 flex-shrink-0">
              <img src={question.mediaUrl} alt="clue" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="w-full text-center px-4">
             <h1 className="font-display font-black leading-tight text-white drop-shadow-2xl tracking-tight"
                 style={{ fontSize: 'clamp(2rem, 9vh, 8rem)' }}>
               {question.prompt}
             </h1>
          </div>
        </div>

        <div className="w-full max-w-4xl flex flex-col items-center space-y-12 shrink-0">
          <div className={`transition-all duration-1000 transform ${session.showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
            <div className="px-16 md:px-24 py-8 md:py-12 glass-card rounded-[4rem] border-2 border-[#d4af37]/30 shadow-[0_0_100px_rgba(212,175,55,0.1)] bg-black/80 text-center">
              <p className="text-[10px] text-[#d4af37]/50 uppercase tracking-[1em] mb-4 font-black">Protocol Solution</p>
              <p className="font-display font-black gold-gradient drop-shadow-2xl tracking-tighter" 
                 style={{ fontSize: 'clamp(2rem, 7vh, 6rem)' }}>
                {question.answer}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
            {session.timer !== null && (
              <div className="flex flex-col items-center gap-4">
                 <span className={`text-8xl md:text-[10rem] font-display font-black leading-none ${session.timer <= 5 ? 'text-red-500 animate-pulse' : 'text-[#d4af37]'}`}>
                   {session.timer}
                 </span>
                 <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear ${session.timer <= 5 ? 'bg-red-500' : 'bg-[#d4af37]'}`}
                      style={{ width: `${(session.timer / session.defaultTimerDuration) * 100}%` }}
                    ></div>
                 </div>
              </div>
            )}

            <div className="flex gap-10">
               {!session.showAnswer ? (
                  <button onClick={() => { dispatch({ type: 'REVEAL_ANSWER' }); playSound('reveal'); }} 
                          className="px-12 py-6 border border-[#d4af37]/40 text-[#d4af37] font-black rounded-3xl hover:bg-[#d4af37] hover:text-black transition-all uppercase tracking-[0.4em] text-xs shadow-xl active:scale-95">
                    Reveal Answer (Space)
                  </button>
               ) : (
                  <div className="flex gap-6">
                    <button onClick={() => dispatch({ type: 'SET_QUESTION_STATUS', payload: { clueId: active.clueId, status: 'answered' } })}
                            className="px-12 py-6 bg-[#d4af37] text-black font-black rounded-3xl hover:scale-105 transition-all text-xs uppercase tracking-[0.3em] shadow-2xl">
                      Complete (Enter)
                    </button>
                    <button onClick={() => dispatch({ type: 'SELECT_QUESTION', payload: null })}
                            className="px-8 py-6 border border-white/10 text-white/30 rounded-3xl hover:text-white transition-all text-[10px] uppercase tracking-[0.2em]">
                      Dismiss (Esc)
                    </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
