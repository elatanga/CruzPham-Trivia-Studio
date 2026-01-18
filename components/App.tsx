
import React, { useState } from 'react';
import { GameProvider, useGame } from './GameContext';
import TriviaBoard from './TriviaBoard';
import QuestionView from './QuestionView';
import HostEditor from './HostEditor';
import Dashboard from './Dashboard';
import Scoreboard from './Scoreboard';
import Auth from './Auth';
import NotificationOverlay from './NotificationOverlay';

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
      {/* Animated Ambient Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d4af37]/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      
      <div className="relative z-10 text-center space-y-8 md:space-y-16 max-w-6xl w-full flex flex-col items-center justify-center">
         <div className="space-y-6 md:space-y-10 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="inline-block px-8 py-2 glass-panel rounded-full border border-[#d4af37]/20 mb-4 animate-pulse">
               <span className="text-[10px] md:text-xs text-[#d4af37] font-black tracking-[1em] uppercase text-center">CruzPham Studio Sequence v8.0</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-display font-black gold-gradient leading-[0.85] tracking-tighter drop-shadow-2xl text-center mix-blend-screen">
               CruzPham<br /><span className="text-white/90">Trivia.</span>
            </h1>
            <p className="text-base md:text-2xl text-white/30 max-w-2xl mx-auto font-light leading-relaxed tracking-tight font-display text-center">
               The definitive <span className="text-[#d4af37] font-bold">TikTok Live</span> engagement suite. <br />
               <span className="text-white/40 uppercase tracking-[0.3em] text-[10px] md:text-xs font-black text-center mt-4 block">Stage ready • Zero Latency</span>
            </p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 w-full animate-in slide-in-from-bottom-10 duration-1000 delay-200 fill-mode-forwards opacity-0">
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'auth' })} 
              className="group relative w-full sm:w-auto px-12 md:px-16 py-5 md:py-6 bg-[#d4af37] text-black font-black rounded-2xl md:rounded-3xl hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] uppercase tracking-[0.4em] text-xs md:text-sm transition-all transform duration-300 text-center overflow-hidden shimmer"
            >
              <span className="relative z-10">ENTER STUDIO</span>
            </button>
            <button 
              onClick={() => setShowProtocols(true)}
              className="w-full sm:w-auto px-12 md:px-16 py-5 md:py-6 border border-white/10 bg-white/5 text-white/50 font-black rounded-2xl md:rounded-3xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.3em] text-xs md:text-sm text-center backdrop-blur-sm"
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
                   <div key={i} className="space-y-3 text-center flex flex-col items-center p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#d4af37]/30 transition-colors">
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitClick = () => {
    if (state.saveStatus === 'unsaved') {
      setShowExitConfirm(true);
    } else {
      dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
    }
  };

  const handleConfirmExit = async (shouldSave: boolean) => {
    if (shouldSave) {
       await saveTemplate();
    }
    dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
    setShowExitConfirm(false);
  };

  const toggleMode = () => {
    // If we are currently in Live Mode, switch to Director (Edit: On, Live: Off)
    if (state.isLiveMode) {
      dispatch({ type: 'TOGGLE_LIVE_MODE' }); 
      if (!state.isEditing) dispatch({ type: 'TOGGLE_EDITING' });
    } else {
      // If we are currently in Director/Standard, switch to Live (Edit: Off, Live: On)
      if (state.isEditing) dispatch({ type: 'TOGGLE_EDITING' });
      dispatch({ type: 'TOGGLE_LIVE_MODE' });
    }
  };
  
  return (
    <div className="relative h-screen flex bg-[#010101] overflow-hidden text-center">
      {/* Container for the Main Stage and Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 z-20 shrink-0 glass-card text-center relative">
           {/* Header ambient glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full bg-[#d4af37]/5 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 md:gap-6 cursor-pointer group justify-center relative z-10" onClick={handleExitClick}>
            <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform text-[10px] shimmer overflow-hidden relative">
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </div>
            <div className="flex flex-col items-start text-left">
               <h1 className="text-lg md:text-2xl font-display font-bold gold-gradient tracking-tighter uppercase leading-none text-center">
                 {state.activeTemplate?.name || 'Untitled'}
               </h1>
               <span className="text-[6px] md:text-[9px] uppercase tracking-[0.4em] font-black text-white/20 text-center group-hover:text-white/40 transition-colors">Production Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center relative z-10">
            {/* Unified Mode Toggle */}
            <button 
                onClick={toggleMode}
                className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${!state.isLiveMode ? 'text-[#d4af37]' : 'text-white/20'}`}>Director</span>
                
                <div className={`w-10 h-5 rounded-full border border-white/10 p-0.5 relative transition-colors ${state.isLiveMode ? 'bg-red-900/20 border-red-500/50' : 'bg-[#d4af37]/10 border-[#d4af37]/50'}`}>
                    <div className={`w-4 h-4 rounded-full shadow-md transition-all duration-300 transform ${state.isLiveMode ? 'translate-x-5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'translate-x-0 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`}></div>
                </div>

                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${state.isLiveMode ? 'text-red-500 animate-pulse' : 'text-white/20'}`}>Live</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0 relative text-center">
          {/* Central Stage Area */}
          <div className={`flex-1 relative flex flex-col items-center justify-center min-w-0 text-center p-2 md:p-6 transition-all duration-700 ${state.isLiveMode ? 'bg-black' : ''}`}>
            <TriviaBoard />
          </div>
          
          {/* Simplified Scoreboard Area (Placeholder for now) */}
          <div className="hidden lg:block shrink-0 h-full w-[280px] bg-[#050505]">
             <Scoreboard />
          </div>
        </main>
      </div>

      {/* Director Control Sidebar */}
      {state.isEditing && (
        <div className="shrink-0 w-[350px] md:w-[400px] h-full z-50 shadow-[-40px_0_80px_rgba(0,0,0,0.8)] bg-[#0a0a0a]/90 backdrop-blur-3xl animate-in slide-in-from-right duration-500 border-l border-white/10">
           <HostEditor />
        </div>
      )}

      {/* Question Overlay */}
      {state.activeQuestionId && <QuestionView />}

      {/* Unsaved Changes Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md glass-card p-10 rounded-[2.5rem] border border-[#d4af37]/30 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-2">Unsaved Changes</h2>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mb-8">Production data has not been synced to the vault.</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => handleConfirmExit(true)}
                        className="w-full py-4 bg-[#d4af37] text-black rounded-xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-white transition-all shadow-lg shimmer overflow-hidden relative"
                    >
                        <span className="relative z-10">Sync & Exit</span>
                    </button>
                    <button 
                        onClick={() => handleConfirmExit(false)}
                        className="w-full py-4 border border-red-500/30 text-red-500 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-red-500/10 transition-all"
                    >
                        Discard Changes
                    </button>
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="w-full py-4 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { state } = useGame();

  if (state.loading) {
    return (
      <div className="h-screen w-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center space-y-6 animate-pulse">
           <div className="w-16 h-16 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] text-[#d4af37] uppercase tracking-[0.4em] font-black">Loading Sequence</p>
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
      {state.view === 'template/edit' && <TemplateEditor />}
      {(state.view === 'game/live' || state.view === 'game/question' || state.view === 'game/control') && <LiveGame />}
    </div>
  );
};

// Definitions for TemplateEditor and LiveGame were moved to be accessible by AppContent
const TemplateEditor: React.FC = () => {
  const { dispatch } = useGame();
  return (
    <div className="h-screen bg-[#010101] flex flex-col overflow-hidden text-center">
      <header className="h-20 md:h-24 px-6 md:px-12 flex items-center justify-between border-b border-white/5 shrink-0 glass-card text-center z-20">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })} className="text-white/30 hover:text-white transition-all">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-lg md:text-2xl font-display font-bold gold-gradient uppercase text-center tracking-tight">Editing Studio</h1>
        </div>
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
          className="px-6 md:px-8 py-2 md:py-3 bg-[#d4af37] text-black font-black rounded-xl md:rounded-2xl uppercase text-[8px] md:text-[10px] tracking-[0.2em] text-center"
        >
          Save Production
        </button>
      </header>
      <main className="flex-1 flex overflow-hidden relative text-center">
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center text-center p-4 md:p-10">
           <div className="w-full h-full opacity-40 scale-[0.85] md:scale-90 pointer-events-none flex items-center justify-center">
             <TriviaBoard />
           </div>
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center p-6">
             <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-[#d4af37]/40 text-center space-y-4 md:space-y-6 flex flex-col items-center max-w-lg">
                <p className="text-[#d4af37] font-black uppercase tracking-[0.5em] text-[10px] md:text-xs text-center">Direct Access Enabled</p>
                <h2 className="text-2xl md:text-4xl text-white font-display font-bold text-center leading-tight">Use the Sidebar to Modify Clues</h2>
                <p className="text-white/30 text-xs md:text-sm text-center">Real-time changes are auto-archived in the production vault.</p>
             </div>
           </div>
        </div>
        {/* Rendered as part of a flex layout if we wanted to push content, 
            but keeping the 'fixed' for consistency while ensuring App.tsx manages the space */}
        <div className="hidden lg:block shrink-0 w-[450px]">
           <HostEditor />
        </div>
      </main>
    </div>
  );
};

const LiveGame: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const toggleMode = () => {
    if (state.isLiveMode) {
      dispatch({ type: 'TOGGLE_LIVE_MODE' }); 
      if (!state.isEditing) dispatch({ type: 'TOGGLE_EDITING' });
    } else {
      if (state.isEditing) dispatch({ type: 'TOGGLE_EDITING' });
      dispatch({ type: 'TOGGLE_LIVE_MODE' });
    }
  };

  return (
    <div className="relative h-screen flex bg-[#010101] overflow-hidden text-center">
      {/* Container for the Main Stage and Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-20 md:h-28 px-4 md:px-12 flex items-center justify-between border-b border-white/5 z-20 shrink-0 glass-card text-center">
          <div className="flex items-center gap-3 md:gap-8 cursor-pointer group justify-center" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[#d4af37] rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shadow-2xl group-hover:scale-110 transition-transform text-[10px] md:text-base">CP</div>
            <div className="flex flex-col items-start text-left">
               <h1 className="text-xl md:text-4xl font-display font-bold gold-gradient tracking-tighter uppercase leading-none text-center">Live Studio</h1>
               <span className="text-[6px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/20 text-center">Frequency Locked</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-10 justify-center">
             {/* Unified Toggle for LiveGame */}
             <button 
                onClick={toggleMode}
                className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${!state.isLiveMode ? 'text-[#d4af37]' : 'text-white/20'}`}>Director</span>
                
                <div className={`w-10 h-5 rounded-full border border-white/10 p-0.5 relative transition-colors ${state.isLiveMode ? 'bg-red-900/20 border-red-500/50' : 'bg-[#d4af37]/10 border-[#d4af37]/50'}`}>
                    <div className={`w-4 h-4 rounded-full shadow-md transition-all duration-300 transform ${state.isLiveMode ? 'translate-x-5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'translate-x-0 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`}></div>
                </div>

                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${state.isLiveMode ? 'text-red-500 animate-pulse' : 'text-white/20'}`}>Live</span>
            </button>
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_EDITING' })}
              className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 text-center shrink-0 ${state.isEditing ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37] scale-105 shadow-2xl' : 'border-white/5 text-white/20 hover:text-white'}`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0 relative text-center">
          {/* Central Stage Area: Flexible centering */}
          <div className="flex-1 relative flex flex-col items-center justify-center min-w-0 text-center p-2 md:p-6 lg:p-12 overflow-hidden">
            <TriviaBoard />
          </div>
          
          {/* Responsive Scoreboard: Sits on the right of the board */}
          <div className="hidden sm:block shrink-0 h-full w-[280px]">
             <Scoreboard />
          </div>
        </main>
      </div>

      {/* Director Control Sidebar: Flexibly pushed to the right when active */}
      {state.isEditing && (
        <div className="shrink-0 w-[350px] md:w-[450px] h-full z-50 border-l border-white/5 shadow-[-40px_0_80px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-2xl">
           <HostEditor />
        </div>
      )}

      {/* Floating Scoreboard for mobile if needed, or keeping standard. 
          The current layout handles Scoreboard as a right-side element in main. */}

      {(state.view === 'game/question' || state.activeQuestionId) && <QuestionView />}
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
