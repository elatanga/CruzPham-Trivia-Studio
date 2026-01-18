
import React, { useMemo } from 'react';
import { useGame } from './GameContext';

const Scoreboard: React.FC = () => {
  const { state, dispatch, log, playSound } = useGame();
  const { players, activityLog, isSoundEnabled, activeQuestionId, activeTemplate } = state;

  // Identify Leader
  const maxScore = Math.max(...players.map(p => p.score));
  const leaders = players.filter(p => p.score === maxScore && p.score > 0).map(p => p.id);

  // Determine scoring step based on active context
  const scoringStep = useMemo(() => {
    if (activeQuestionId && activeTemplate) {
        for (const cat of activeTemplate.categories) {
            const q = cat.questions.find(q => q.id === activeQuestionId);
            if (q) {
                return q.isDailyDouble ? q.points * 2 : q.points;
            }
        }
    }
    return activeTemplate?.settings.step || 100;
  }, [activeQuestionId, activeTemplate]);

  const handleScore = (id: string, delta: number) => {
    dispatch({ type: 'ADJUST_SCORE', payload: { playerId: id, delta } });
    if (delta > 0) playSound('correct');
    else playSound('wrong');
    const p = players.find(player => player.id === id);
    if(p) log(`${delta > 0 ? '+' : ''}${delta} to ${p.name}`);
  };

  const handleNameChange = (id: string, newName: string) => {
    const p = players.find(player => player.id === id);
    if (p) dispatch({ type: 'UPDATE_PLAYER', payload: { ...p, name: newName } });
  };

  const addPlayer = () => {
    if (players.length >= 8) return;
    const id = `p${Date.now()}`;
    dispatch({ type: 'ADD_PLAYER', payload: { id, name: `Player ${players.length + 1}`, score: 0, isActive: false } });
    log("New Challenger Approaching");
  };

  const removePlayer = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#050505] border-l border-white/5 shadow-2xl overflow-hidden relative">
       {/* Background Noise/Gradient */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#050505] pointer-events-none"></div>

       {/* Header */}
       <div className="shrink-0 p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between z-10 h-16 backdrop-blur-md">
         <div className="flex flex-col items-start">
             <h2 className="text-[10px] font-display font-black text-[#d4af37] uppercase tracking-[0.3em] flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></span>
                 Scoreboard
             </h2>
             <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono mt-1">Live Telemetry</span>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} 
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${isSoundEnabled ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-white/10 text-white/30 hover:bg-white/5'}`}
             >
                {isSoundEnabled ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                )}
             </button>
             <button onClick={addPlayer} disabled={players.length >= 8} className="w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
             </button>
         </div>
       </div>

       {/* Step Indicator */}
       <div className="shrink-0 px-4 py-2 border-b border-white/5 bg-black/20 flex items-center justify-center">
            <span className="text-[8px] uppercase tracking-widest text-white/30 mr-2">Current Step:</span>
            <span className={`text-[10px] font-mono font-bold ${activeQuestionId ? 'text-[#d4af37]' : 'text-white/50'}`}>
                {activeTemplate?.settings.currencySymbol}{scoringStep}
            </span>
       </div>

       {/* Players List */}
       <div className="flex-1 flex flex-col min-h-0 p-3 gap-3 overflow-y-auto z-10 custom-scrollbar">
          {players.map((p, idx) => {
              const isLeader = leaders.includes(p.id);
              return (
                <div 
                    key={p.id} 
                    onClick={() => dispatch({ type: 'SET_PLAYER_ACTIVE', payload: p.id })}
                    className={`
                        relative flex-1 min-h-[60px] flex flex-col justify-center px-1 rounded-2xl border transition-all duration-300 group overflow-hidden
                        ${p.isActive 
                            ? 'bg-gradient-to-r from-[#d4af37]/10 to-transparent border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                        }
                    `}
                >
                    {/* Leader Badge */}
                    {isLeader && (
                        <div className="absolute top-0 right-0 p-1.5 bg-[#d4af37] rounded-bl-xl shadow-lg z-20">
                            <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                    )}

                    {/* Rank Number */}
                    <div className={`absolute top-2 left-3 text-[9px] font-mono font-bold uppercase tracking-widest ${p.isActive ? 'text-[#d4af37]' : 'text-white/20'}`}>
                        Player 0{idx + 1}
                    </div>
                    
                    {/* Delete Action */}
                    <button onClick={(e) => { e.stopPropagation(); removePlayer(p.id); }} className="absolute bottom-2 left-3 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="flex items-center justify-between w-full h-full pt-4 px-2 relative z-10">
                        {/* Decrease */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleScore(p.id, -scoringStep); }} 
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/20 hover:text-red-400 hover:border-red-400 hover:bg-red-400/10 transition-all active:scale-90"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>
                        </button>

                        {/* Name & Score */}
                        <div className="flex flex-col items-center justify-center flex-1 px-2">
                            <input 
                                value={p.name} 
                                onChange={(e) => handleNameChange(p.id, e.target.value)}
                                className="w-full bg-transparent text-center font-bold text-xs md:text-sm text-white/60 focus:text-white outline-none mb-1 transition-colors uppercase tracking-wide"
                            />
                            <div className={`text-2xl md:text-3xl font-display font-black leading-none transition-all ${p.score < 0 ? 'text-red-400' : 'gold-gradient drop-shadow-md'}`}>
                                {p.score}
                            </div>
                        </div>

                        {/* Increase */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleScore(p.id, scoringStep); }} 
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/20 hover:text-green-400 hover:border-green-400 hover:bg-green-400/10 transition-all active:scale-90"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>
              );
          })}
          
          {players.length < 8 && (
             <button 
                onClick={addPlayer} 
                className="shrink-0 h-12 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/20 hover:text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all text-[9px] uppercase tracking-[0.2em] font-bold group"
             >
                <span className="group-hover:scale-110 transition-transform">+ Add Contestant</span>
             </button>
          )}
       </div>

       {/* Log Footer */}
       <div className="shrink-0 h-28 border-t border-white/5 bg-[#030303]/90 p-4 flex flex-col z-10">
          <h3 className="text-[8px] text-white/30 uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
             <svg className="w-3 h-3 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             Activity Log
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
             {activityLog.length === 0 && <div className="text-[9px] text-white/10 italic text-center mt-2">Waiting for input...</div>}
             {activityLog.map(log => (
                 <div key={log.id} className="text-[9px] text-white/50 font-mono truncate flex gap-2 border-l border-white/5 pl-2">
                    <span className="text-[#d4af37]/50 opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <span className="truncate text-white/70">{log.message}</span>
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default Scoreboard;
