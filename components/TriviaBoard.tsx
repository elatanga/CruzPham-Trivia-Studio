
import React, { useMemo } from 'react';
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
  const catCount = categories.length;
  
  // Find the maximum number of clues in any category to build consistent rows
  const questionsPerCat = useMemo(() => {
    return Math.max(...categories.map(cat => template.clues.filter(c => c.categoryId === cat.id).length), 1);
  }, [categories, template.clues]);

  // Pre-sort clues per category for consistent row assignment
  const sortedCluesByCat = useMemo(() => {
    return categories.map(cat => {
      return template.clues
        .filter(c => c.categoryId === cat.id)
        .sort((a, b) => a.points - b.points);
    });
  }, [categories, template.clues]);

  return (
    <div className={`flex-1 flex flex-col justify-center items-center w-full h-full transition-all duration-1000 overflow-hidden text-center ${state.isLiveMode ? 'bg-[#010101]' : 'bg-transparent'}`}>
      <div 
        className="grid gap-2 md:gap-4 w-full h-full max-w-[1800px] mx-auto animate-in fade-in zoom-in duration-700"
        style={{ 
          gridTemplateColumns: `repeat(${catCount}, 1fr)`,
          gridTemplateRows: `auto repeat(${questionsPerCat}, 1fr)`
        }}
      >
        {/* Category Header Row */}
        {categories.map((category, idx) => (
          <div key={category.id} className="glass-card flex items-center justify-center p-2 md:p-3 text-center rounded-xl md:rounded-[2rem] shadow-2xl gold-border relative group overflow-hidden h-full min-h-[60px] md:min-h-[100px]">
            {state.isEditing ? (
               <input 
                className="w-full bg-transparent text-center font-display gold-gradient uppercase tracking-widest outline-none font-black text-[10px] md:text-sm lg:text-lg" 
                value={category.title} 
                onChange={(e) => dispatch({ type: 'UPDATE_TEMPLATE', payload: { id: template.id, categories: categories.map(c => c.id === category.id ? { ...c, title: e.target.value } : c) } })} 
               />
            ) : (
              <h2 className="text-[9px] md:text-sm lg:text-base xl:text-xl font-display font-black gold-gradient uppercase tracking-widest leading-tight drop-shadow-lg text-center w-full overflow-hidden text-ellipsis px-1">
                {category.title}
              </h2>
            )}
          </div>
        ))}

        {/* Clue Rows - Flattened to allow perfect cross-category alignment */}
        {Array.from({ length: questionsPerCat }).map((_, rowIdx) => (
          <React.Fragment key={`row-${rowIdx}`}>
            {categories.map((category, catIdx) => {
              const q = sortedCluesByCat[catIdx][rowIdx];
              if (!q) return <div key={`empty-${catIdx}-${rowIdx}`} className="h-full" />;

              const isSelected = session.activeQuestion?.clueId === q.id;
              const isAnswered = q.status === 'answered';
              const isVoid = q.status === 'void';
              
              return (
                <button
                  key={q.id}
                  disabled={(!state.isEditing && (isAnswered || isVoid))}
                  onClick={() => handleInteraction(category.id, q.id)}
                  className={`relative flex items-center justify-center text-center rounded-xl md:rounded-[2rem] font-black transition-all duration-700 h-full w-full overflow-hidden
                    ${isAnswered ? 'opacity-[0.03] bg-white/5 scale-95' : isVoid ? 'opacity-5 bg-white/5 line-through' : isSelected ? 'glass-card border-white shadow-[0_0_80px_rgba(255,255,255,0.2)] scale-[1.05] z-20 text-white' : 'glass-card gold-border text-[#d4af37] hover:scale-[1.03] shadow-2xl active:scale-95'}
                  `}
                >
                  <span className="relative z-10 font-black leading-none text-center flex items-center justify-center w-full h-full px-2" style={{ fontSize: `clamp(12px, 5vh, 80px)` }}>
                    {(isAnswered || isVoid) ? '' : q.points}
                  </span>
                  {q.mediaUrl && !isAnswered && (
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <img src={q.mediaUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TriviaBoard;
