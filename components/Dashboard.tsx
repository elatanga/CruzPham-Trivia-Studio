
import React, { useEffect, useState } from 'react';
import { useGame } from './GameContext';
import { subscribeToTemplates, upsertTemplate, db } from '../firebase';
import { Template } from '../types';
import { createNewTemplate, exportTemplateToJSON, calculateGridMetrics } from '../utils/gameUtils';
import { validateTemplate } from '../utils/validators';
import { doc, deleteDoc } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { state, dispatch, logout, notify } = useGame();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [rowCount, setRowCount] = useState(5);

  const previewMetrics = calculateGridMetrics(rowCount);

  useEffect(() => {
    if (!state.user) return;
    const unsub = subscribeToTemplates(state.user.id, (data) => {
      setTemplates(data as Template[]);
      setLoading(false);
    });
    return () => unsub();
  }, [state.user]);

  const initiateCreate = () => {
    if (templates.length >= 40) {
      notify('error', 'Storage Limit Reached. Max 40 Productions.');
      return;
    }
    setNewProdName('');
    setRowCount(5);
    setIsModalOpen(true);
  };

  const confirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTpl = createNewTemplate(state.user!.id, newProdName || "Untitled Production", rowCount);
      await upsertTemplate(newTpl);
      dispatch({ type: 'LOAD_TEMPLATE', payload: newTpl });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      notify('error', 'Failed to initialize production.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (templates.length >= 40) {
      notify('error', 'Storage Limit Reached.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const valid = validateTemplate(json);
        const newTpl = {
          ...valid,
          id: `tpl-${Date.now()}`,
          ownerId: state.user!.id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await upsertTemplate(newTpl);
        notify('success', 'Production Imported Successfully');
      } catch (err) {
        notify('error', 'Invalid File Structure');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this production permanently?")) {
        if(db) {
            await deleteDoc(doc(db, 'templates', id));
            notify('info', 'Production Deleted');
        }
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto p-6 md:p-12 relative min-h-screen">
      {/* Cinematic Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 border-b border-white/5 pb-8 gap-6 animate-in slide-in-from-top-10 duration-700">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="h-px w-8 bg-[#d4af37]"></div>
             <span className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em] font-bold">Studio Command</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none">
            Production <span className="text-white/20">Deck</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end mr-4">
                 <p className="text-[9px] text-white/40 uppercase tracking-widest">Operator Identity</p>
                 <p className="text-xs text-white font-bold">{state.user?.username}</p>
             </div>
             
             <label className="group relative px-6 py-3 overflow-hidden rounded-full cursor-pointer transition-all">
                <div className="absolute inset-0 border border-white/20 rounded-full group-hover:border-[#d4af37]/50 transition-colors"></div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2 text-[10px] text-white/60 group-hover:text-white uppercase tracking-widest transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    Import JSON
                </div>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
             </label>

             <button onClick={logout} className="px-6 py-3 border border-red-500/20 bg-red-500/5 rounded-full text-[10px] text-red-400 hover:bg-red-500 hover:text-white uppercase tracking-widest transition-all">
               Disconnect
             </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32 space-y-6 animate-pulse">
             <div className="w-16 h-16 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
             <p className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em]">Decrypting Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
          
          {/* Create New Card - Hero Position */}
          <div 
            onClick={initiateCreate}
            className="group relative h-[320px] rounded-[2rem] border border-[#d4af37]/20 bg-[#d4af37]/5 flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-[#d4af37]/10 hover:shadow-[0_0_60px_rgba(212,175,55,0.15)] animate-in fade-in zoom-in-95 duration-500"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             
             <div className="w-24 h-24 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-500 shadow-2xl z-10">
                <span className="text-5xl font-light text-[#d4af37] group-hover:text-black transition-colors pb-2">+</span>
             </div>
             <div className="text-center z-10">
                 <h3 className="text-xl font-display font-bold text-white group-hover:text-[#d4af37] transition-colors">Initialize</h3>
                 <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-2 group-hover:text-white/60">New Production Sequence</p>
             </div>
          </div>
          
          {/* Template Cards */}
          {templates.map((tpl, index) => (
            <div 
                key={tpl.id}
                onClick={() => dispatch({ type: 'LOAD_TEMPLATE', payload: tpl })}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative h-[320px] glass-card p-8 rounded-[2rem] flex flex-col justify-between cursor-pointer transition-all duration-500 hover:border-[#d4af37]/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards opacity-0"
            >
               {/* Hover Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>

               {/* Delete Action */}
               <button 
                    onClick={(e) => handleDelete(tpl.id, e)}
                    className="absolute top-6 right-6 p-2 text-white/10 hover:text-red-500 bg-white/5 hover:bg-white/10 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    title="Delete Production"
               >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
               
               <div className="space-y-6 relative z-10">
                 <div className="flex items-start justify-between">
                     <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[#d4af37] font-black text-xs shadow-lg group-hover:border-[#d4af37]/50 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-500">
                        CP
                     </div>
                     <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] text-white/30 uppercase tracking-widest font-mono">
                         {new Date(tpl.updatedAt).toLocaleDateString()}
                     </span>
                 </div>

                 <div>
                    <h3 className="text-2xl font-display font-bold text-white leading-none mb-3 truncate group-hover:text-[#d4af37] transition-colors">{tpl.name}</h3>
                    <div className="flex flex-wrap gap-2">
                         <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-white/50 uppercase tracking-wider font-bold">
                             {tpl.categories.length} Cols
                         </div>
                         <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-white/50 uppercase tracking-wider font-bold">
                             {tpl.settings.maxPoints} Pts
                         </div>
                    </div>
                 </div>
               </div>

               <div className="relative z-10 pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">Status</span>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">Ready</span>
                     </div>
                  </div>
                  
                  {/* Slide Up Button */}
                  <div className="absolute inset-x-0 -bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); exportTemplateToJSON(tpl); }}
                        className="w-full py-3 bg-[#d4af37] text-black rounded-xl text-[9px] uppercase tracking-[0.2em] font-black hover:bg-white transition-all shadow-lg"
                      >
                        Export Data
                      </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="w-full max-w-lg glass-card p-10 rounded-[2.5rem] border border-[#d4af37]/30 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
                  {/* Decorative Glow */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[80px]"></div>

                  <div className="text-center mb-10 relative z-10">
                      <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight mb-2">Initialize Production</h2>
                      <p className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em]">Configure Grid Parameters</p>
                  </div>
                  
                  <form onSubmit={confirmCreate} className="space-y-8 relative z-10">
                      <div className="space-y-3 text-left">
                          <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold ml-4">Production Identity</label>
                          <input 
                              type="text"
                              value={newProdName}
                              onChange={e => setNewProdName(e.target.value)}
                              placeholder="ENTER TITLE..."
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-center text-lg text-white font-display font-bold placeholder:text-white/10 focus:border-[#d4af37] outline-none transition-all focus:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                              autoFocus
                          />
                      </div>

                      <div className="space-y-6">
                          <div className="flex justify-between items-end px-2">
                              <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Grid Density</label>
                              <span className="text-[#d4af37] font-mono text-2xl font-bold">{rowCount}</span>
                          </div>
                          <div className="relative h-2 bg-white/10 rounded-full">
                              <div className="absolute top-0 left-0 h-full bg-[#d4af37] rounded-full transition-all duration-300" style={{ width: `${(rowCount / 10) * 100}%` }}></div>
                              <input 
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={rowCount}
                                  onChange={e => setRowCount(parseInt(e.target.value))}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="absolute -top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-300" style={{ left: `calc(${(rowCount / 10) * 100}% - 8px)` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-white/20 uppercase tracking-wider px-1">
                              <span>Minimal</span>
                              <span>Maximum</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                            <span className="text-[8px] uppercase tracking-widest text-white/40">Max Score</span>
                            <span className="text-[#d4af37] font-mono font-bold text-lg">{previewMetrics.maxPoints}</span>
                         </div>
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                            <span className="text-[8px] uppercase tracking-widest text-white/40">Step Value</span>
                            <span className="text-[#d4af37] font-mono font-bold text-lg">{previewMetrics.step}</span>
                         </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold hover:bg-white/5 hover:text-white transition-all"
                          >
                              Abort
                          </button>
                          <button 
                              type="submit"
                              className="flex-1 py-4 bg-[#d4af37] text-black rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] shimmer"
                          >
                              Initialize
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
