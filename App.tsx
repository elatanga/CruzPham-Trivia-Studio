
import React from 'react';
import { GameProvider, useGame } from './components/GameContext';
import TriviaBoard from './components/TriviaBoard';
import QuestionView from './components/QuestionView';
import HostEditor from './components/HostEditor';
import Dashboard from './components/Dashboard';
import Scoreboard from './components/Scoreboard';
import Auth from './components/Auth';

const Landing: React.FC = () => {
  const { dispatch } = useGame();
  return (
    <div className="h-screen bg-[#030303] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#d4af37]/10 rounded-full blur-[200px] translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      
      <div className="relative z-10 text-center space-y-12 md:space-y-20 max-w-6xl">
         <div className="space-y-6 md:space-y-10">
            <div className="inline-block px-10 py-4 glass-card rounded-full border border-[#d4af37]/20 mb-4 animate-pulse">
               <span className="text-xs text-[#d4af37] font-black tracking-[1em] uppercase">CruzPham Studio Sequence v8.0</span>
            </div>
            <h1 className="text-5xl md:text-[10rem] font-display font-bold gold-gradient leading-[0.9] tracking-tighter drop-shadow-2xl">
               Cruzpham Trivia<br /><span className="text-white/90">Live Studio.</span>
            </h1>
            <p className="text-lg md:text-3xl text-white/20 max-w-3xl mx-auto font-light leading-relaxed tracking-tight font-display">
               The definitive <span className="text-[#d4af37] font-bold">TikTok Live</span> engagement suite. <br />
               <span className="text-white/40 uppercase tracking-[0.3em] text-xs font-black">Stage ready. Zero Latency. AI Driven.</span>
            </p>
         </div>

         <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'auth' })} className="px-16 md:px-20 py-6 md:py-8 bg-[#d4af37] text-black font-black rounded-3xl hover:scale-110 active:scale-95 shadow-[0_40px_80px_rgba(212,175,55,0.4)] uppercase tracking-[0.4em] text-sm transition-all transform duration-500">Initialize Module</button>
            <button className="px-16 md:px-20 py-6 md:py-8 border-2 border-white/5 text-white/30 font-black rounded-3xl hover:bg-white/5 hover:text-white transition-all uppercase tracking-[0.3em] text-sm">Review Protocols</button>
         </div>
      </div>

      <footer className="absolute bottom-10 left-0 right-0 text-center z-10">
        <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
          Product of <span className="text-white/30">Cruzpham Creators Network</span> — Designed by <span className="text-[#d4af37]/40">EL Cruzpham Alpha</span>
        </p>
      </footer>
    </div>
  );
};

const TemplateEditor: React.FC = () => {
  const { state, dispatch } = useGame();
  return (
    <div className="h-screen bg-[#010101] flex flex-col overflow-hidden">
      <header className="h-24 px-12 flex items-center justify-between border-b border-white/5 shrink-0 glass-card">
        <div className="flex items-center gap-6">
          <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })} className="text-white/30 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-display font-bold gold-gradient uppercase">Editing Studio</h1>
        </div>
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
          className="px-8 py-3 bg-[#d4af37] text-black font-black rounded-2xl uppercase text-[10px] tracking-[0.2em]"
        >
          Save Production
        </button>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
           <div className="opacity-50 scale-90 pointer-events-none">
             <TriviaBoard />
           </div>
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="glass-card p-12 rounded-[3rem] border border-[#d4af37]/40 text-center space-y-6">
                <p className="text-[#d4af37] font-black uppercase tracking-[0.5em] text-xs">Direct Access Enabled</p>
                <h2 className="text-4xl text-white font-display font-bold">Use the Sidebar to Modify Clues</h2>
                <p className="text-white/30 text-sm">Real-time changes are auto-archived.</p>
             </div>
           </div>
        </div>
        <HostEditor />
      </main>
    </div>
  );
};

const LiveGame: React.FC = () => {
  const { state, dispatch } = useGame();
  return (
    <div className={`relative h-screen flex flex-col transition-all duration-1000 bg-[#010101] overflow-hidden ${state.isHostMode ? 'pr-[450px]' : ''}`}>
      <header className="h-24 md:h-28 px-6 md:px-12 flex items-center justify-between border-b border-white/5 z-20 shrink-0 glass-card">
        <div className="flex items-center gap-4 md:gap-8 cursor-pointer group" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}>
          <div className="w-10 h-10 md:w-14 md:h-14 bg-[#d4af37] rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shadow-2xl group-hover:scale-110 transition-transform text-xs md:text-base">CP</div>
          <div className="flex flex-col">
             <h1 className="text-xl md:text-3xl font-display font-bold gold-gradient tracking-tighter uppercase leading-none">Cruzpham Trivia</h1>
             <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-black text-white/40">Live Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex bg-white/[0.03] p-1.5 rounded-3xl border border-white/10">
             <button 
                onClick={() => dispatch({ type: 'TOGGLE_EDITING' })}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${state.isEditing ? 'bg-[#d4af37] text-black shadow-2xl' : 'text-white/30 hover:text-white'}`}
             >
                Director
             </button>
             <button 
                onClick={() => dispatch({ type: 'TOGGLE_LIVE_MODE' })}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${state.isLiveMode ? 'bg-red-600 text-white shadow-2xl animate-pulse' : 'text-white/30 hover:text-white'}`}
             >
                Live Feed
             </button>
          </div>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_HOST_MODE' })}
            className={`p-4 rounded-2xl border-2 transition-all duration-500 ${state.isHostMode ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37] scale-110 shadow-2xl' : 'border-white/5 text-white/20 hover:text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 relative flex flex-col min-w-0">
          <TriviaBoard />
        </div>
        <Scoreboard />
      </main>

      {state.view === 'game/question' && <QuestionView />}
      <HostEditor />
    </div>
  );
};

const GameContainer: React.FC = () => {
  const { state } = useGame();

  switch(state.view) {
    case 'marketing/landing': return <Landing />;
    case 'auth': return <Auth />;
    case 'dashboard': return <Dashboard />;
    case 'template/edit': return <TemplateEditor />;
    case 'game/live':
    case 'game/question':
    case 'game/control':
      return <LiveGame />;
    default: return <Landing />;
  }
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
};

export default App;