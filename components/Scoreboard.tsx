
import React, { useState } from 'react';
import { useGame } from './GameContext';

const Scoreboard: React.FC = () => {
  const { state, dispatch, playSound } = useGame();
  const [editingId, setEditingId] = useState<string | null>(null);

  const session = state.gameSession;
  if (!session) return null;

  const handleScore = (id: string, delta: number) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: { id, scoreDelta: delta } });
    if (delta > 0) playSound('correct');
    else playSound('wrong');
    const player = session.scoreboard.find(p => p.id === id);
    dispatch({ type: 'ADD_EVENT', payload: `${player?.name} Update: ${delta > 0 ? '+' : ''}${delta}` });
  };

  return (
    <div className={`flex flex-col p-2 md:p-4 glass-card border-l border-white/5 h-full overflow-hidden transition-all duration-1000 ${state.isLiveMode ? 'bg-black/95 w-[280px] md:w-[350px]' : 'w-[180px] md:w-[260px]'}`}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="space-y-0.5">
          <h3 className="text-[7px] md:text-[9px] font-black gold-gradient uppercase tracking-[0.3em]">Broadcast Score</h3>
          <div className="flex items-center gap-1.5">
             <span className="w-1 h-1 bg-[#d4af37] rounded-full animate-pulse"></span>
             <p className="text-[6px] md:text-[7px] text-white/30 uppercase tracking-[0.1em] font-black">Sync Locked</p>
          </div>
        </div>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} 
          className="text-xs p-1 rounded-xl transition-all hover:bg-white/5 text-[#d4af37]"
        >
          {state.soundEnabled ? '🔈' : '🔇'}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 md:gap-1.5 min-h-0 overflow-hidden py-1">
        {session.scoreboard.map((p, idx) => (
          <div 
            key={p.id} 
            className={`flex-1 flex flex-col justify-center px-3 py-1 rounded-xl md:rounded-2xl border transition-all duration-500 group relative overflow-hidden min-h-0
              ${p.active 
                ? 'border-white/10 bg-white/[0.03] hover:border-[#d4af37]/40 shadow-sm' 
                : 'border-white/5 bg-transparent opacity-10'
              }
            `}
          >
            <div className="absolute top-0 left-1.5 text-[5px] md:text-[6px] font-black text-white/10 uppercase tracking-widest">{idx + 1}</div>
            
            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-col flex-1 min-w-0">
                {editingId === p.id ? (
                  <input 
                    autoFocus
                    className="bg-black border border-[#d4af37]/50 rounded px-1.5 py-0.5 text-[9px] w-full text-white focus:outline-none font-bold"
                    value={p.name}
                    onChange={(e) => dispatch({ type: 'UPDATE_PLAYER', payload: { id: p.id, name: e.target.value } })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-1 truncate">
                    <span 
                      onClick={() => p.active && setEditingId(p.id)}
                      className={`text-[9px] md:text-[11px] font-black tracking-tight transition-all truncate ${p.active ? 'text-white/80 cursor-pointer hover:text-[#d4af37]' : 'text-white/20'}`}
                    >
                      {p.name}
                    </span>
                    {!state.isLiveMode && (
                      <button 
                        onClick={() => dispatch({ type: 'UPDATE_PLAYER', payload: { id: p.id, active: !p.active } })}
                        className="text-[6px] text-[#d4af37]/40 opacity-0 group-hover:opacity-100 hover:text-[#d4af37] font-black uppercase transition-opacity"
                      >
                        {p.active ? 'Off' : 'On'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className={`text-base md:text-xl lg:text-2xl font-display font-black leading-none shrink-0 ${p.active ? 'gold-gradient' : 'text-white/5'}`}>
                {p.score}
              </div>
            </div>
            
            {p.active && !state.isLiveMode && (
              <div className="flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleScore(p.id, 100)}
                  className="flex-1 py-0.5 text-[6px] md:text-[7px] bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/30 font-black uppercase transition-all"
                >
                  +100
                </button>
                <button 
                  onClick={() => handleScore(p.id, -100)}
                  className="flex-1 py-0.5 text-[6px] md:text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/30 font-black uppercase transition-all"
                >
                  -100
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[6px] md:text-[7px] uppercase tracking-[0.4em] text-white/20 font-black">Feed Activity</h4>
          <span className="w-1 h-1 bg-[#d4af37] rounded-full"></span>
        </div>
        <div className="h-4 overflow-hidden relative text-[7px] md:text-[8px] mb-2">
          {session.events.slice(0, 1).map(e => (
            <div key={e.id} className="text-white/30 truncate uppercase italic tracking-tighter animate-in fade-in slide-in-from-bottom-1">
              {e.message}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-white/5 opacity-20">
          <p className="text-[5px] uppercase tracking-widest font-black text-center text-white">
            Designed by EL Cruzpham Alpha
          </p>
          <p className="text-[4px] uppercase tracking-[0.3em] font-black text-center text-white/50 mt-1">
            Product of Cruzpham Creators Network
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;