
import React, { useState } from 'react';
import { GameProvider, useGame } from './components/GameContext';
import TriviaBoard from './components/TriviaBoard';
import QuestionView from './components/QuestionView';
import HostEditor from './components/HostEditor';
import Dashboard from './components/Dashboard';
import Scoreboard from './components/Scoreboard';
import Auth from './components/Auth';
import NotificationOverlay from './components/NotificationOverlay';

const Landing: React.FC = () => {
  const { dispatch } = useGame();
  const [showProtocols, setShowProtocols] = useState(false);

  const protocols = [
    { title: 'AI RECONSTRUCTION', desc: 'Harness Gemini 3.0 to generate thematic trivia boards in seconds.' },
    { title: 'LIVE BROADCAST', desc: 'Zero-latency UI optimized for TikTok Live vertical and horizontal formats.' },
    { title: 'DIRECTOR CONTROL', desc: 'Manage scores, timers, and game flow from a unified command center.' },
    { title: 'LUXURY ASSETS', desc: 'Cinematic visuals and high-fidelity audio cues for premium engagement.' }
  ];

  return (
    <div className="h-screen bg-[#030303] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden text-center">
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#d4af37]/10 rounded-full blur-[200px] translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      
      <div className="relative z-10 text-center space-y-8 md:space-y-16 max-w-6xl w-full flex flex-col items-center justify-center">
         <div className="space-y-6 md:space-y-10 text-center flex flex-col items-center">
            <div className="inline-block px-10 py-3 glass-card rounded-full border border-[#d4af37]/20 mb-4 animate-pulse">
               <span className="text-[10px] md:text-xs text-[#d4af37] font-black tracking-[1em] uppercase text-center">CruzPham Studio Sequence v8.0</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-display font-bold gold-gradient leading-[0.9] tracking-tighter drop-shadow-2xl text-center">
               CruzPham<br /><span className="text-white/90">Trivia.</span>
            </h1>
            <p className="text-base md:text-2xl text-white/20 max-w-2xl mx-auto font-light leading-relaxed tracking-tight font-display text-center">
               The definitive <span className="text-[#d4af37] font-bold">TikTok Live</span> engagement suite. <br />
               <span className="text-white/40 uppercase tracking-[0.3em] text-[10px] md:text-xs font-black text-center">Stage ready. Zero Latency</span>
            </p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 w-full">
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'auth' })} 
              className="w-full sm:w-auto px-12 md:px-16 py-5 md:py-6 bg-[#d4af37] text-black font-black rounded-2xl md:rounded-3xl hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)] uppercase tracking-[0.4em] text-xs md:text-sm transition-all transform duration-300 text-center"
            >
              ENTER STUDIO
            </button>
            <button 
              onClick={() => setShowProtocols(true)}
              className="w-full sm:w-auto px-12 md:px-16 py-5 md:py-6 border-2 border-white/5 text-white/30 font-black rounded-2xl md:rounded-3xl hover:bg-white/5 hover:text-white transition-all uppercase tracking-[0.3em] text-xs md:text-sm text-center"
            >
              Review Protocols
            </button>
         </div>
      </div>

      {showProtocols && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-500 text-center">
           <div className="max-w-4xl w-full glass-card p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-[#d4af37]/20 shadow-2xl relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowProtocols(false)}
                className="absolute top-6 right-6 md:top-10 md:right-10 text-white/20 hover:text-white transition-all"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              
              <div className="text-center mb-10 md:mb-16 space-y-4">
                 <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[1em] text-center">System Overview</p>
                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white text-center">Production Protocols</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 w-full text-center">
                 {protocols.map((p, i) => (
                   <div key={i} className="space-y-3 text-center flex flex-col items-center p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-4 justify-center">
                         <span className="text-[#d4af37] font-black text-lg md:text-xl font-display">0{i+1}</span>
                         <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em] text-center">{p.title}</h3>
                      </div>
                      <p className="text-white/40 text-xs md:text-sm leading-relaxed font-light text-center">{p.desc}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-12 md:mt-20 text-center w-full">
                 <button 
                   onClick={() => setShowProtocols(false)}
                   className="w-full md:w-auto px-12 py-4 md:py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.4em] hover:bg-white/10 transition-all text-center"
                 >
                   Acknowledge
                 </button>
              </div>
           </div>
        </div>
      )}

      <footer className="absolute bottom-8 left-0 right-0 text-center z-10 w-full px-4">
        <p className="text-[8px] md:text-[10px] text-white/10 uppercase tracking-[0.5em] font-black text-center leading-relaxed">
          Product of <span className="text-white/30">Cruzpham Creators Network</span> <br className="sm:hidden" /> — Designed by <span className="text-[#d4af37]/40">EL Cruzpham Alpha</span>
        </p>
      </footer>
    </div>
  );
};

const Studio: React.FC = () => {
  const { state, dispatch, saveTemplate } = useGame();
  
  return (
    <div className="relative h-screen flex bg-[#010101] overflow-hidden text-center">
      {/* Container for the Main Stage and Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 z-20 shrink-0 glass-card text-center">
          <div className="flex items-center gap-3 md:gap-6 cursor-pointer group justify-center" onClick={() => { saveTemplate(); dispatch({ type: 'SET_VIEW', payload: 'dashboard' }); }}>
            <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center font-black text-black shadow-2xl group-hover:scale-110 transition-transform text-[10px]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </div>
            <div className="flex flex-col items-start text-left">
               <h1 className="text-lg md:text-2xl font-display font-bold gold-gradient tracking-tighter uppercase leading-none text-center">
                 {state.activeTemplate?.name || 'Untitled'}
               </h1>
               <span className="text-[6px] md:text-[9px] uppercase tracking-[0.4em] font-black text-white/20 text-center">Production Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/10 shrink-0">
               <button 
                  onClick={() => dispatch({ type: 'TOGGLE_EDITING' })}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-center ${state.isEditing ? 'bg-[#d4af37] text-black shadow-2xl' : 'text-white/30 hover:text-white'}`}
               >
                  Director
               </button>
               <button 
                  onClick={() => dispatch({ type: 'TOGGLE_LIVE_MODE' })}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-center ${state.isLiveMode ? 'bg-red-600 text-white shadow-2xl animate-pulse' : 'text-white/30 hover:text-white'}`}
               >
                  Live Feed
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0 relative text-center">
          {/* Central Stage Area */}
          <div className={`flex-1 relative flex flex-col items-center justify-center min-w-0 text-center p-2 md:p-6 transition-all duration-500 ${state.isLiveMode ? 'bg-black' : ''}`}>
            <TriviaBoard />
          </div>
          
          {/* Simplified Scoreboard Area (Placeholder for now) */}
          <div className="hidden lg:block shrink-0 h-full w-[250px] border-l border-white/5 bg-black/20">
             <Scoreboard />
          </div>
        </main>
      </div>

      {/* Director Control Sidebar */}
      {state.isEditing && (
        <div className="shrink-0 w-[350px] md:w-[400px] h-full z-50 shadow-[-40px_0_80px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-2xl animate-in slide-in-from-right duration-300">
           <HostEditor />
        </div>
      )}

      {/* Question Overlay */}
      {state.activeQuestionId && <QuestionView />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { state } = useGame();

  if (state.loading) {
    return (
      <div className="h-screen w-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
           <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-[9px] text-[#d4af37] uppercase tracking-[0.4em] font-black">Loading Sequence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#e5e5e5] flex flex-col font-sans overflow-x-hidden relative">
      <NotificationOverlay />
      {state.view === 'landing' && <Landing />}
      {state.view === 'auth' && <Auth />}
      {state.view === 'dashboard' && <Dashboard />}
      {state.view === 'studio' && <Studio />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
