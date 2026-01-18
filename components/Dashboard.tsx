import React, { useState, useRef } from 'react';
import { useGame } from './GameContext';
import { GameTemplate, Clue } from '../types';

const Dashboard: React.FC = () => {
  const { state, dispatch, exportTemplate } = useGame();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardName, setWizardName] = useState('');
  const [catCount, setCatCount] = useState(5);
  const [rowCount, setRowCount] = useState(5);
  const [maxPoints, setMaxPoints] = useState(1000);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    if (!wizardName.trim()) return;
    
    const id = `tmpl-${Date.now()}`;
    const safeRowCount = Math.max(1, Math.min(rowCount, 10));
    const safeCatCount = Math.max(1, Math.min(catCount, 10));
    const pointStep = Math.round(maxPoints / safeRowCount);

    const newTemplate: GameTemplate = {
      id,
      ownerId: state.user?.id || 'anonymous',
      name: wizardName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '2.0',
      categories: Array.from({ length: safeCatCount }).map((_, i) => ({
        id: `cat-${id}-${i}`,
        title: `Category ${i + 1}`
      })),
      clues: [],
      pointsConfig: { min: pointStep, max: maxPoints, step: pointStep }
    };
    
    newTemplate.categories.forEach(cat => {
      for (let i = 1; i <= safeRowCount; i++) {
        const p = pointStep * i;
        newTemplate.clues.push({
          id: `q-${cat.id}-${i}`,
          categoryId: cat.id,
          points: Math.round(p),
          prompt: '',
          answer: '',
          status: 'available'
        });
      }
    });

    dispatch({ type: 'CREATE_TEMPLATE', payload: newTemplate });
    
    // Reset and Close
    setWizardName('');
    setCatCount(5);
    setRowCount(5);
    setShowWizard(false);
    
    dispatch({ type: 'ADD_EVENT', payload: `New Template Created: ${wizardName}` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const imported: GameTemplate = {
          ...json,
          id: `tmpl-import-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        dispatch({ type: 'IMPORT_TEMPLATE', payload: imported });
      } catch (err) {
        alert('Malformed Template JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-between p-4 md:p-8 lg:p-12 overflow-hidden animate-in fade-in duration-1000 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none"></div>

      <header className="w-full max-w-6xl flex flex-col items-center text-center gap-4 z-10 shrink-0">
        <div className="space-y-2 text-center">
          <div className="inline-block px-4 py-1.5 glass-card rounded-full border border-[#d4af37]/20 mb-2">
            <span className="text-[9px] text-[#d4af37] font-black tracking-[0.8em] uppercase text-center">Cruzpham Trivia Studio</span>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-bold gold-gradient tracking-tighter leading-none text-center">The Vault</h1>
          <p className="text-white/20 uppercase tracking-[0.4em] text-[9px] font-black text-center">Production Inventory Master</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
           <input type="file" className="hidden" ref={fileInputRef} accept=".json" onChange={handleImport} />
           <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-[9px] text-center">Import Archive</button>
           <button onClick={() => setShowWizard(true)} className="px-8 py-3 bg-[#d4af37] text-black font-black rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-xl uppercase tracking-widest text-[9px] text-center">New Production</button>
           <button onClick={() => dispatch({ type: 'LOGOUT' })} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-center">Log Out</button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl flex items-center justify-center p-4 overflow-hidden z-10 text-center">
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto pr-2 max-h-full scrollbar-hide scroll-smooth text-center">
            {state.templates.map((template) => (
              <div key={template.id} className="glass-card rounded-[2.5rem] p-8 group hover:border-[#d4af37]/40 transition-all duration-500 relative overflow-hidden flex flex-col h-[320px] md:h-[350px] shadow-2xl shrink-0 text-center items-center">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2 z-20">
                   <button onClick={() => exportTemplate(template.id)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-[#d4af37] transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                   </button>
                   <button onClick={() => dispatch({ type: 'DELETE_TEMPLATE', payload: template.id })} className="p-2.5 bg-white/5 rounded-xl text-red-500/30 hover:text-red-500 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                </div>
                
                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-[#d4af37]/20 transition-all text-center">
                  <span className="text-2xl font-black gold-gradient text-center">{template.categories.length}</span>
                </div>
                
                <div className="flex-1 text-center">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-1 group-hover:gold-gradient transition-all truncate text-center">{template.name}</h3>
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black text-center">Production ID: {template.id.slice(0,8)}</p>
                </div>
                
                <div className="flex flex-col gap-2 mt-4 w-full">
                  <button 
                    onClick={() => dispatch({ type: 'START_GAME', payload: { gameId: `game-${Date.now()}`, templateId: template.id } })}
                    className="w-full py-4 bg-[#d4af37] text-black font-black rounded-2xl hover:bg-white transition-all text-[10px] uppercase tracking-[0.4em] shadow-lg active:scale-95 text-center"
                  >
                    Launch Stage
                  </button>
                  <button 
                    onClick={() => {
                      dispatch({ type: 'UPDATE_GAME_STATE', payload: { templateId: template.id } });
                      dispatch({ type: 'SET_VIEW', payload: 'template/edit' });
                    }}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black text-[9px] uppercase tracking-[0.2em] text-white/40 active:scale-95 text-center"
                  >
                    Enter Editor
                  </button>
                </div>
              </div>
            ))}

            {state.templates.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                <p className="text-2xl font-display italic text-white/50 text-center">Inventory Static</p>
                <p className="text-[9px] uppercase tracking-[0.6em] font-black text-center">Create New Template to Initialize</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full max-w-6xl mt-8 pt-8 border-t border-white/5 text-center flex flex-col items-center gap-3 shrink-0 z-10">
        <div className="flex items-center gap-6 opacity-40 justify-center">
           <span className="w-1 h-1 bg-[#d4af37] rounded-full animate-pulse"></span>
           <p className="text-[10px] text-white/60 uppercase tracking-[0.6em] font-black text-center">
             Cruzpham Trivia Studio
           </p>
           <span className="w-1 h-1 bg-[#d4af37] rounded-full animate-pulse"></span>
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-black text-center">
            Product of <span className="text-white/20">Cruzpham Creators Network</span>
          </p>
          <p className="text-[9px] text-[#d4af37]/20 uppercase tracking-[0.5em] font-black text-center">
            Designed by <span className="text-[#d4af37]/40">EL Cruzpham Alpha</span>
          </p>
        </div>
      </footer>

      {showWizard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500 p-4 text-center">
           <div className="max-w-xl w-full glass-card p-10 rounded-[3.5rem] border border-[#d4af37]/20 shadow-[0_0_100px_rgba(212,175,55,0.1)] text-center">
              <div className="text-center mb-10 space-y-3">
                <p className="text-[9px] uppercase font-black text-[#d4af37] tracking-[1em] text-center">Sequence Start</p>
                <h2 className="text-4xl font-display font-bold gold-gradient text-center">Create a new TRIVIA TEMPLATE</h2>
              </div>
              <div className="space-y-6 text-center">
                 <div className="space-y-2 text-center">
                   <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em] text-center">TRIVIA GAME TITLE</p>
                   <input 
                    autoFocus 
                    placeholder="E.g. Sunday Super Show" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-[#d4af37] outline-none text-lg font-bold transition-all placeholder:text-white/10 text-center" 
                    value={wizardName} 
                    onChange={(e) => setWizardName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-6 text-center">
                   <div className="space-y-2 text-center">
                     <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em] text-center">Cols (Max 10)</p>
                     <input type="number" min="1" max="10" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-[#d4af37] outline-none text-lg font-bold text-center" value={catCount} onChange={(e) => setCatCount(parseInt(e.target.value) || 1)} />
                   </div>
                   <div className="space-y-2 text-center">
                     <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em] text-center">Rows (Max 10)</p>
                     <input type="number" min="1" max="10" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-[#d4af37] outline-none text-lg font-bold text-center" value={rowCount} onChange={(e) => setRowCount(parseInt(e.target.value) || 1)} />
                   </div>
                 </div>

                 <div className="flex gap-4 pt-6 justify-center">
                    <button 
                      onClick={handleCreateNew} 
                      className="flex-1 py-5 bg-[#d4af37] text-black font-black rounded-2xl uppercase text-[10px] tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-xl text-center"
                    >
                      CREATE TEMPLATE
                    </button>
                    <button 
                      onClick={() => setShowWizard(false)} 
                      className="flex-1 py-5 bg-white/5 text-white/30 font-bold rounded-2xl uppercase text-[9px] tracking-[0.4em] transition-all hover:text-white border border-white/10 text-center"
                    >
                      Abort
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;