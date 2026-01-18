
import React from 'react';
import { useGame } from './GameContext';

const TriviaBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeTemplate } = state;

  if (!activeTemplate) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/30 uppercase tracking-widest animate-pulse font-mono text-xs">Waiting for Production Data...</div>
        </div>
    );
  }

  const colCount = activeTemplate.categories.length;
  // Calculate max rows based on the category with most questions to ensure grid integrity
  const rowCount = Math.max(...activeTemplate.categories.map(c => c.questions.length), 5);

  // Density flags for text sizing
  const isCompact = colCount > 6;
  const isUltraCompact = colCount > 9;

  return (
    // Outer container: fills parent, adds safe padding, handles centering
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden">
      
      {/* Board Frame: The actual game board container */}
      <div className="flex flex-col w-full h-full max-w-[1920px] mx-auto shadow-2xl bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 ring-1 ring-white/5">
        
        {/* Header Row (Categories) */}
        <div className="flex w-full divide-x divide-white/10 border-b-2 border-white/10 bg-white/[0.03]">
            {activeTemplate.categories.map((cat) => (
                <div 
                    key={cat.id} 
                    style={{ width: `${100 / colCount}%` }}
                    className="relative group h-16 md:h-24 lg:h-28 flex flex-col items-center justify-center p-1 md:p-2 transition-colors hover:bg-white/5"
                >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        <h3 className={`
                            font-black text-[#d4af37] text-center uppercase leading-tight drop-shadow-md break-words w-full line-clamp-3
                            ${isUltraCompact ? 'text-[8px] md:text-[10px]' : isCompact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm lg:text-base tracking-widest'}
                        `}>
                            {cat.title}
                        </h3>
                    </div>
                    {/* Active Accent Line */}
                    <div className="absolute bottom-0 w-4 h-0.5 bg-[#d4af37] rounded-full opacity-30 group-hover:w-1/2 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
                </div>
            ))}
        </div>

        {/* Questions Grid Area */}
        <div className="flex-1 w-full min-h-0 bg-[#050505]">
             <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                    gridTemplateRows: `repeat(${rowCount}, 1fr)`,
                    width: '100%',
                    height: '100%',
                }}
             >
                {/* Render Grid Cells: Row by Row */}
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        {activeTemplate.categories.map((cat, colIndex) => {
                            const q = cat.questions[rowIndex];
                            // Handle cases where a category has fewer questions than others
                            if (!q) {
                                return (
                                    <div key={`empty-${colIndex}-${rowIndex}`} className="border-r border-b border-white/5 bg-black/20" />
                                );
                            }

                            const isCompleted = q.status === 'completed';
                            const isVoid = q.status === 'void';
                            const isInactive = isCompleted || isVoid;
                            const isLastRow = rowIndex === rowCount - 1;
                            const isLastCol = colIndex === colCount - 1;

                            return (
                             <div 
                                key={q.id}
                                className={`
                                    relative w-full h-full p-1 md:p-2
                                    ${!isLastCol && 'border-r border-white/5'}
                                    ${!isLastRow && 'border-b border-white/5'}
                                `}
                             >
                                <button
                                    onClick={() => !isInactive && dispatch({ type: 'SET_ACTIVE_QUESTION', payload: q.id })}
                                    disabled={isInactive}
                                    className={`
                                        w-full h-full rounded-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden group
                                        ${isInactive 
                                            ? 'cursor-default' 
                                            : 'hover:bg-[#d4af37]/10 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:border-[#d4af37]/40 hover:-translate-y-0.5 border border-transparent cursor-pointer bg-gradient-to-br from-white/[0.02] to-transparent active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    {isVoid ? (
                                        <span className="text-white/10 font-mono text-[8px] md:text-[10px] uppercase tracking-widest -rotate-12 border-2 border-white/10 px-2 py-1 rounded opacity-50">VOID</span>
                                    ) : !isCompleted ? (
                                        <span className={`
                                            font-display font-bold tracking-tighter transition-all duration-500
                                            ${isInactive ? 'opacity-0' : 'gold-gradient drop-shadow-sm group-hover:scale-110 group-hover:brightness-125'}
                                            ${isUltraCompact ? 'text-sm md:text-xl' : isCompact ? 'text-lg md:text-3xl' : 'text-2xl md:text-5xl'}
                                        `}>
                                            {activeTemplate.settings.currencySymbol}{q.points}
                                        </span>
                                    ) : (
                                        // Completed State - Empty/Subtle
                                        <div className="w-full h-full flex items-center justify-center">
                                            {/* Optional: Add a subtle checkmark or logo if desired, for now keeping it clean/empty as per TV style */}
                                            <span className="text-[#d4af37]/5 text-4xl select-none">●</span>
                                        </div>
                                    )}
                                </button>
                             </div>
                            );
                        })}
                    </React.Fragment>
                ))}
             </div>
        </div>

        {/* Footer: Controls & Credits */}
        <div className="h-8 md:h-10 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4 text-[8px] md:text-[9px] text-white/30 font-mono uppercase tracking-wider">
               <span className="hidden sm:inline">SHORTCUTS:</span>
               <div className="flex gap-3">
                   <span title="Select Player">1-8 <span className="text-white/10">PLAYER</span></span>
                   <span title="Adjust Score">+/- <span className="text-white/10">SCORE</span></span>
                   <span title="Fullscreen">F <span className="text-white/10">FULL</span></span>
                   <span title="Reveal Answer" className="hidden lg:inline">SPACE <span className="text-white/10">REVEAL</span></span>
                   <span title="Close Question" className="hidden lg:inline">ESC <span className="text-white/10">CLOSE</span></span>
               </div>
            </div>
            <div className="text-[8px] md:text-[9px] text-[#d4af37]/40 uppercase tracking-[0.2em] font-black">
                Powered by CruzPham
            </div>
        </div>

      </div>
    </div>
  );
};

export default TriviaBoard;
