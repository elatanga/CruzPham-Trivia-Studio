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
      
      <div className="relative z-10 text-center space-y-10 max-w-4xl w-full flex flex-col items-center justify-center">
         <div className="space-y-6 text-center flex flex-col items-center">
            <div className="inline-block px-6 py-2 border border-[#d4af37]/30 rounded-full mb-4">
               <span className="text-[10px] text-[#d4af37] font-bold tracking-[0.5em] uppercase">CruzPham Studio Sequence v8.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-none tracking-tighter">
               CruzPham<br /><span className="text-white/20">Trivia.</span>
            </h1>
            <p className="text-lg text-white/30 max-w-lg mx-auto font-light">
               The definitive <span className="text-[#d4af37] font-bold">TikTok Live</span> engagement suite.
            </p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'auth' })} 
              className="w-full sm:w-auto px-12 py-5 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-all uppercase tracking-widest text-xs"
            >
              Enter Studio
            </button>
            <button 
              onClick={() => setShowProtocols(true)}
              className="w-full sm:w-auto px-12 py-5 border border-white/10 text-white/50 font-bold rounded-lg hover:text-white hover:border-white/30 transition-all uppercase tracking-widest text-xs"
            >
              Protocols
            </button>
         </div>
      </div>

      {showProtocols && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 text-center">
           <div className="max-w-4xl w-full bg-[#0a0a0a] p-10 rounded-2xl border border-white/10 relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowProtocols(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-all"
              >
                ✕
              </button>
              
              <div className="text-center mb-10 space-y-2">
                 <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest">System Overview</p>
                 <h2 className="text-3xl font-display font-bold text-white">Production Protocols</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-center">
                 {protocols.map((p, i) => (
                   <div key={i} className="space-y-2 text-center flex flex-col items-center p-6 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3 justify-center">
                         <span className="text-[#d4af37] font-bold">0{i+1}</span>
                         <h3 className="text-xs font-bold text-white uppercase tracking-widest">{p.title}</h3>
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-10 text-center w-full">
                 <button 
                   onClick={() => setShowProtocols(false)}
                   className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                 >
                   Acknowledge
                 </button>
              </div>
           </div>
        </div>
      )}

      <footer className="absolute bottom-8 left-0 right-0 text-center z-10 w-full px-4">
        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Product of Cruzpham Creators Network
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
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 z-20 shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { saveTemplate(); dispatch({ type: 'SET_VIEW', payload: 'dashboard' }); }}>
            <div className="w-8 h-8 bg-[#d4af37] rounded flex items-center justify-center font-bold text-black text-xs">CP</div>
            <div className="flex flex-col items-start text-left">
               <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                 {state.activeTemplate?.name || 'Untitled'}
               </h1>
               <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">Production Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
               <button 
                  onClick={() => dispatch({ type: 'TOGGLE_EDITING' })}
                  className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${state.isEditing ? 'bg-[#d4af37] text-black' : 'text-white/30 hover:text-white'}`}
               >
                  Director
               </button>
               <button 
                  onClick={() => dispatch({ type: 'TOGGLE_LIVE_MODE' })}
                  className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${state.isLiveMode ? 'bg-red-600 text-white' : 'text-white/30 hover:text-white'}`}
               >
                  Live Feed
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0 relative text-center">
          {/* Central Stage Area */}
          <div className={`flex-1 relative flex flex-col items-center justify-center min-w-0 text-center p-4 transition-colors ${state.isLiveMode ? 'bg-black' : ''}`}>
            <TriviaBoard />
          </div>
          
          {/* Simplified Scoreboard Area */}
          <div className="hidden lg:block shrink-0 h-full w-[250px] border-l border-white/5 bg-[#050505]">
             <Scoreboard />
          </div>
        </main>
      </div>

      {/* Director Control Sidebar */}
      {state.isEditing && (
        <div className="shrink-0 w-[400px] h-full z-50 border-l border-white/10 bg-[#0a0a0a] shadow-xl">
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
        <div className="text-center space-y-4">
           <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Loading Sequence</p>
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
      {/* TemplateEditor is removed from main view switch for brevity, handled by Studio/Dashboard logic if needed or reused */}
      {(state.view === 'game/live' || state.view === 'game/question' || state.view === 'game/control') && <Studio />} 
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