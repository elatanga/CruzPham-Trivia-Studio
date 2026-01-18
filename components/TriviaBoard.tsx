
import React, { useMemo } from 'react';
import { useGame } from './GameContext';

const TriviaBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeTemplate } = state;

  // Compute layout metrics
  const layout = useMemo(() => {
    if (!activeTemplate) return null;

    const colCount = activeTemplate.categories.length;
    const maxQuestions = Math.max(...activeTemplate.categories.map(c => c.questions.length), 0);
    const rowCount = Math.max(maxQuestions, 5);

    return { colCount, rowCount };
  }, [activeTemplate]);

  if (!activeTemplate || !layout) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
                <div className="text-[#d4af37] uppercase tracking-[0.3em] animate-pulse font-mono text-xs">Initializing Grid...</div>
            </div>
        </div>
    );
  }

  const { colCount, rowCount } = layout;

  // Dynamic Sizing Logic
  const isHighRowDensity = rowCount > 6;
  const isHighColDensity = colCount > 6;
  const isExtremeDensity = rowCount >= 9 || colCount >= 8;

  const headerHeightClass = isHighRowDensity 
    ? 'h-14 md:h-18 lg:h-20' 
    : 'h-16 md:h-24 lg:h-32';

  const getTileTextSize = () => {
    if (isExtremeDensity) return 'text-sm sm:text-base md:text-xl lg:text-2xl';
    if (isHighRowDensity || isHighColDensity) return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
    return 'text-xl sm:text-2xl md:text-4xl lg:text-5xl';
  };
  const tileTextSize = getTileTextSize();

  const getHeaderTitleSize = () => {
    if (colCount > 8) return 'text-[7px] sm:text-[9px] md:text-[10px]';
    if (colCount > 5) return 'text-[8px] sm:text-[10px] md:text-xs';
    return 'text-[10px] sm:text-xs md:text-sm lg:text-lg tracking-widest';
  };
  const headerTitleSize = getHeaderTitleSize();

  return (
    <div className={`w-full h-full flex items-center justify-center overflow-hidden transition-all duration-500 ${isExtremeDensity ? 'p-1 md:p-2' : 'p-2 md:p-6 lg:p-8'}`}>
      
      {/* Board Frame */}
      <div className="flex flex-col w-full h-full max-w-[1920px] mx-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-[#030303] rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/5 relative">
        
        {/* Ambient Glow behind board */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#d4af37]/5 blur-[50px] pointer-events-none"></div>

        {/* Header Row */}
        <div className={`flex w-full divide-x divide-white/5 border-b border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent shrink-0 backdrop-blur-sm z-10`}>
            {activeTemplate.categories.map((cat) => (
                <div 
                    key={cat.id} 
                    style={{ width: `${100 / colCount}%` }}
                    className={`relative group flex flex-col items-center justify-center p-2 transition-all duration-300 hover:bg-white/[0.02] ${headerHeightClass}`}
                >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden px-1">
                        <h3 
                            style={{ 
                                fontSize: cat.fontSize ? `${cat.fontSize}px` : undefined,
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}
                            className={`
                                font-display font-black text-[#e5e5e5] group-hover:text-[#d4af37] transition-colors duration-300 text-center uppercase leading-tight break-words w-full line-clamp-3
                                ${headerTitleSize}
                            `}
                        >
                            {cat.title}
                        </h3>
                    </div>
                    {/* Active Accent */}
                    <div className="absolute bottom-0 w-8 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30 group-hover:w-full group-hover:opacity-80 transition-all duration-500 ease-out"></div>
                </div>
            ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 w-full min-h-0 bg-[#050505] relative p-1 md:p-2">
             <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                    gridTemplateRows: `repeat(${rowCount}, 1fr)`,
                    width: '100%',
                    height: '100%',
                    gap: isExtremeDensity ? '2px' : '6px'
                }}
             >
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        {activeTemplate.categories.map((cat, colIndex) => {
                            const q = cat.questions[rowIndex];
                            if (!q) {
                                return <div key={`empty-${colIndex}-${rowIndex}`} className="bg-white/[0.01] rounded-lg" />;
                            }

                            const isCompleted = q.status === 'completed';
                            const isVoid = q.status === 'void';
                            const isInactive = isCompleted || isVoid;
                            
                            // Stagger animation for entry
                            const delay = (colIndex * 50) + (rowIndex * 50);

                            return (
                             <div 
                                key={q.id}
                                className="relative w-full h-full animate-in fade-in zoom-in-95 duration-700 fill-mode-forwards"
                                style={{ animationDelay: `${delay}ms` }}
                             >
                                <button
                                    onClick={() => !isInactive && dispatch({ type: 'SET_ACTIVE_QUESTION', payload: q.id })}
                                    disabled={isInactive}
                                    className={`
                                        w-full h-full rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group border
                                        ${isInactive 
                                            ? 'cursor-default border-transparent bg-black/40' 
                                            : 'cursor-pointer border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 hover:shadow-[inset_0_0_20px_rgba(212,175,55,0.1)] active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    {isVoid ? (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 rotate-[-15deg]">
                                            <span className="border-2 border-white text-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-black rounded">VOID</span>
                                        </div>
                                    ) : !isCompleted ? (
                                        <>
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 group-hover:via-[#d4af37]/10 transition-all duration-500"></div>
                                            
                                            <span className={`
                                                font-display font-bold tracking-tighter transition-all duration-300 text-center leading-none z-10
                                                ${isInactive ? 'opacity-0' : 'text-[#d4af37] group-hover:scale-110 group-hover:text-[#fceeb5] drop-shadow-lg'}
                                                ${tileTextSize}
                                            `}>
                                                {activeTemplate.settings.currencySymbol}{q.points}
                                            </span>
                                            
                                            {/* Shine effect on hover */}
                                            <div className="absolute -top-[100%] -left-[100%] w-[50%] h-[300%] bg-white/5 rotate-45 group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
                                        </>
                                    ) : (
                                        // Completed State - Machined Look
                                        <div className="w-full h-full flex items-center justify-center bg-black/60 shadow-inner">
                                            <div className="w-2 h-2 rounded-full bg-[#111] shadow-[0_1px_1px_rgba(255,255,255,0.1),inset_0_1px_3px_rgba(0,0,0,1)]"></div>
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

        {/* Footer */}
        <div className="h-6 md:h-10 bg-[#080808] border-t border-white/5 flex items-center justify-between px-4 shrink-0 relative z-20">
            <div className="flex items-center gap-4 text-[7px] md:text-[9px] text-white/20 font-mono uppercase tracking-widest">
               <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse"></div>
                   <span>System Active</span>
               </div>
               <span className="hidden sm:inline opacity-50">|</span>
               <span className="hidden sm:inline opacity-50">Res: 1920x1080</span>
            </div>
            <div className="text-[7px] md:text-[9px] text-[#d4af37]/30 uppercase tracking-[0.3em] font-black">
                CruzPham Studio
            </div>
        </div>

      </div>
    </div>
  );
};

export default TriviaBoard;
