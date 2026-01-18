
import React from 'react';
import { useGame } from './GameContext';

const TriviaBoard: React.FC = () => {
  const { state, dispatch, playSound } = useGame();
  const template = state.templates.find(t => t.id === state.currentTemplateId);
  const session = state.gameSession;

  if (!template || !session) return null;

  const handleInteraction = (catId: string, clueId: string) => {
    if (state.isEditing) return;
    dispatch({ type: 'SELECT_QUESTION', payload: { categoryId: catId, clueId } });
    playSound('select');
  };

  const categories = template.categories;
  const questionsPerCat = template.clues.filter(c => c.categoryId === categories[0]?.id).length;
  const catCount = categories.length;

  return (
    <div className={`flex-1 flex flex-col justify-center items-center w-full h-full p-2 md:p-6 transition-all duration-1000 overflow-hidden ${state.isLiveMode ? 'bg-[#010101]' : 'bg-transparent'}`}>
      <div className="w-full h-full max-h-screen flex flex-col justify-center gap-2 md:gap-4 animate-in fade-in zoom-in duration-700">
        <div 
          className="grid items-stretch gap-2 md:gap-4 h-full w-full mx-auto" 
          style={{ 
            gridTemplateColumns: `repeat(${catCount}, minmax(0, 1fr))`,
            gridTemplateRows: 'minmax(50px, auto) 1fr',
            maxWidth: '1800px'
          }}
        >
          {/* Category Headers */}
          {categories.map((category) => (
            <div key={category.id} className="glass-card flex items-center justify-center p-1 md:p-2 text-center rounded-xl md:rounded-[2rem] shadow-2xl gold-border relative group">
              {state.isEditing ? (
                 <input 
                  className="w-full bg-transparent text-center font-display gold-gradient uppercase tracking-widest outline-none font-black text-[7px] md:text-xs lg:text-lg" 
                  value={category.title} 
                  onChange={(e) => dispatch({ type: 'UPDATE_TEMPLATE', payload: { id: template.id, categories: categories.map(c => c.id === category.id ? { ...c, title: e.target.value } : c) } })} 
                 />
              ) : (
                <h2 className="text-[7px] md:text-[9px] lg:text-base xl:text-lg font-display font-black gold-gradient uppercase tracking-[0.05em] md:tracking-[0.1em] leading-tight drop-shadow-lg break-words">
                  {category.title}
                </h2>
              )}
            </div>
          ))}

          {/* Clues Columns Container */}
          {categories.map((category) => (
            <div key={`${category.id}-col`} className="grid gap-2 md:gap-4 h-full" 
                 style={{ gridTemplateRows: `repeat(${questionsPerCat}, minmax(0, 1fr))` }}>
              {template.clues
                .filter(c => c.categoryId === category.id)
                .sort((a, b) => a.points - b.points)
                .map((q) => {
                  const isSelected = session.activeQuestion?.clueId === q.id;
                  const isAnswered = q.status === 'answered';
                  const isVoid = q.status === 'void';
                  
                  return (
                    <button
                      key={q.id}
                      disabled={(!state.isEditing && (isAnswered || isVoid))}
                      onClick={() => handleInteraction(category.id, q.id)}
                      className={`relative flex items-center justify-center rounded-xl md:rounded-[2rem] font-black transition-all duration-700 h-full w-full overflow-hidden
                        ${isAnswered ? 'opacity-[0.03] bg-white/5 scale-95' : isVoid ? 'opacity-5 bg-white/5 line-through' : isSelected ? 'glass-card border-white shadow-[0_0_80px_rgba(255,255,255,0.2)] scale-[1.05] z-20 text-white' : 'glass-card gold-border text-[#d4af37] hover:scale-[1.03] shadow-2xl active:scale-95'}
                      `}
                    >
                      <span className="relative z-10 font-black leading-none" style={{ fontSize: `clamp(10px, ${6 / questionsPerCat}vh, 5rem)` }}>
                        {(isAnswered || isVoid) ? '' : q.points}
                      </span>
                      {q.mediaUrl && !isAnswered && (
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                          <img src={q.mediaUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TriviaBoard;
