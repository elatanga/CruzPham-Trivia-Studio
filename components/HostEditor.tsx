
import React, { useState } from 'react';
import { useGame } from './GameContext';
import { generateTriviaBoard, generateClueVisual } from '../services/geminiService';
import { Clue, Category } from '../types';

const HostEditor: React.FC = () => {
  const { state, dispatch, playSound } = useGame();
  const [loading, setLoading] = useState(false);
  const [genImgId, setGenImgId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');

  const template = state.templates.find(t => t.id === state.currentTemplateId);
  const session = state.gameSession;
  
  if (!state.isHostMode || !template) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const generated = await generateTriviaBoard(topic);
      const categories: Category[] = generated.map(c => ({ id: c.id, title: c.title }));
      const clues: Clue[] = generated.flatMap(c => (c.questions || []).map(q => ({
        id: q.id,
        categoryId: c.id,
        points: q.points,
        prompt: q.prompt,
        answer: q.answer,
        status: 'available'
      })));
      
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { id: template.id, categories, clues } });
      dispatch({ type: 'ADD_EVENT', payload: `AI Set Reconstruction: ${topic}` });
    } catch (err) { alert("Generation Error"); } finally { setLoading(false); }
  };

  const handleGenImage = async (clue: Clue) => {
    setGenImgId(clue.id);
    try {
      const url = await generateClueVisual(clue.prompt);
      dispatch({ type: 'UPDATE_CLUE', payload: { templateId: template.id, clueId: clue.id, data: { mediaUrl: url, mediaType: 'image' } } });
      dispatch({ type: 'ADD_EVENT', payload: `Asset Generated for ${clue.points}` });
    } catch (err) { alert("Visual Gen Error"); } finally { setGenImgId(null); }
  };

  return (
    <div className="w-full h-full p-6 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-500 text-center">
      <div className="flex items-center justify-between mb-8 text-center shrink-0">
        <h2 className="text-xl md:text-2xl font-bold gold-gradient font-display uppercase tracking-tighter text-center flex-1">Director Control</h2>
        <div className="flex items-center gap-3">
           <span className="text-[8px] font-black text-[#d4af37] animate-pulse">STAGE ACTIVE</span>
           <button onClick={() => dispatch({ type: 'TOGGLE_HOST_MODE' })} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>
      </div>

      <div className="space-y-6 pb-20 text-center">
        {/* Master Timer Control Panel */}
        <div className="p-5 md:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 text-center shadow-xl">
           <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-[10px] uppercase font-black text-[#d4af37] tracking-[0.3em] text-center">Master Time Protocol</p>
              {session?.timer !== null && (
                <span className={`text-4xl md:text-5xl font-display font-black ${session.timer <= 5 ? 'text-red-500' : 'text-[#d4af37]'} animate-pulse text-center leading-none`}>
                  {session.timer}s
                </span>
              )}
           </div>

           <div className="space-y-3 text-center">
              <div className="flex flex-col items-center gap-2">
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Default Duration</p>
                 <input 
                   type="number" 
                   min="5" 
                   max="60" 
                   className="w-20 bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#d4af37] outline-none text-center font-bold"
                   value={session?.defaultTimerDuration || 15}
                   onChange={(e) => dispatch({ type: 'SET_DEFAULT_TIMER', payload: parseInt(e.target.value) || 15 })}
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                 <button 
                   onClick={() => {
                     if (session?.timerRunning) {
                       dispatch({ type: 'TOGGLE_TIMER_RUNNING' });
                     } else {
                       if (session?.timer === null || session?.timer === 0) {
                          dispatch({ type: 'SET_TIMER', payload: session?.defaultTimerDuration || 15 });
                          playSound('timer');
                       } else {
                          dispatch({ type: 'TOGGLE_TIMER_RUNNING' });
                       }
                     }
                   }}
                   className={`py-3 md:py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 text-center ${session?.timerRunning ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-green-600 text-white hover:bg-green-500'}`}
                 >
                   {session?.timerRunning ? 'Pause Engine' : 'Engage Clock'}
                 </button>
                 <button 
                   onClick={() => { dispatch({ type: 'SET_TIMER', payload: session?.defaultTimerDuration || 15 }); playSound('timer'); }}
                   className="py-3 md:py-4 bg-[#d4af37] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 text-center"
                 >
                   Reset Default
                 </button>
              </div>
              <button 
                 onClick={() => { dispatch({ type: 'SET_TIMER', payload: null }); }}
                 className="w-full py-2.5 bg-white/5 border border-white/20 text-white/50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95 text-center"
              >
                 Abort & Hide Protocol
              </button>
           </div>
        </div>

        {/* Player Management Panel */}
        {session && (
          <div className="p-5 md:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 text-center shadow-xl">
            <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em] text-center">Scoreboard Management</p>
            <div className="space-y-3 text-center">
              {session.scoreboard.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-[10px] text-white focus:border-[#d4af37] outline-none text-center"
                    value={p.name}
                    onChange={(e) => dispatch({ type: 'UPDATE_PLAYER', payload: { id: p.id, name: e.target.value } })}
                    placeholder="Player Name"
                  />
                  <div className="flex items-center gap-3 justify-center w-full">
                    <div className="flex flex-1 items-center bg-white/5 rounded-xl overflow-hidden border border-white/10 text-center">
                      <button 
                        onClick={() => { dispatch({ type: 'UPDATE_PLAYER', payload: { id: p.id, scoreDelta: -100 } }); playSound('wrong'); }}
                        className="px-3 py-1.5 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="flex-1 text-[10px] font-black gold-gradient min-w-[50px] text-center border-x border-white/10 py-1.5">
                        {p.score}
                      </span>
                      <button 
                        onClick={() => { dispatch({ type: 'UPDATE_PLAYER', payload: { id: p.id, scoreDelta: 100 } }); playSound('correct'); }}
                        className="px-3 py-1.5 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => dispatch({ type: 'REMOVE_PLAYER', payload: p.id })}
                      className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-center shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {session.scoreboard.length < 10 && (
                <button 
                  onClick={() => dispatch({ type: 'ADD_PLAYER', payload: '' })}
                  className="w-full py-2.5 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all text-center"
                >
                  + Add Player Node
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Content Injection */}
        <div className="p-5 md:p-6 rounded-3xl bg-[#d4af37]/5 border border-[#d4af37]/20 space-y-4 text-center shadow-xl">
          <p className="text-[10px] uppercase font-black text-[#d4af37] tracking-[0.3em] text-center">AI Content Module</p>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic: e.g. High Fashion" className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs focus:border-[#d4af37] outline-none transition-all text-white text-center" />
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#d4af37] text-black font-black py-4 rounded-2xl hover:bg-white disabled:opacity-50 transition-all text-[10px] uppercase tracking-[0.2em] shadow-lg text-center">
            {loading ? 'Consulting Gemini...' : 'Deploy Reconstruction'}
          </button>
        </div>

        {/* Production Grid Editor */}
        <div className="space-y-4 text-center">
          <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em] text-center">Board Management</p>
          {template.categories.map(cat => (
            <details key={cat.id} className="group glass-card border border-white/5 rounded-2xl overflow-hidden text-center transition-all">
              <summary className="p-4 cursor-pointer hover:bg-white/5 flex items-center justify-center gap-4 transition-colors">
                <span className="font-bold text-white text-[10px] uppercase tracking-widest text-center">{cat.title}</span>
                <svg className="w-4 h-4 text-white/20 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div className="p-4 space-y-6 bg-black/40 border-t border-white/5 text-center">
                {template.clues.filter(c => c.categoryId === cat.id).sort((a,b)=>a.points-b.points).map(q => (
                  <div key={q.id} className="space-y-2 pt-3 border-t border-white/5 first:border-0 first:pt-0 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 mb-2">
                       <p className="text-[9px] font-black text-[#d4af37] tracking-widest text-center">{q.points} PTS</p>
                       <button onClick={() => handleGenImage(q)} disabled={genImgId === q.id} className="text-[8px] text-white/20 hover:text-[#d4af37] transition-all uppercase tracking-widest font-black text-center">
                         {genImgId === q.id ? 'Loading...' : 'Update Visual'}
                       </button>
                    </div>
                    <textarea value={q.prompt} rows={2} onChange={(e) => dispatch({ type: 'UPDATE_CLUE', payload: { templateId: template.id, clueId: q.id, data: { prompt: e.target.value } } })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white/80 focus:border-[#d4af37] outline-none resize-none text-center" />
                    <input value={q.answer} onChange={(e) => dispatch({ type: 'UPDATE_CLUE', payload: { templateId: template.id, clueId: q.id, data: { answer: e.target.value } } })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-[#d4af37] font-bold focus:border-[#d4af37] outline-none text-center" />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostEditor;
