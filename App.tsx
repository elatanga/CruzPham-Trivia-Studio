
import React from 'react';
import { GameProvider, useGame } from './components/GameContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import NotificationOverlay from './components/NotificationOverlay';

const AppContent: React.FC = () => {
  const { state, dispatch } = useGame();

  if (state.loading) {
    return (
      <div className="h-screen w-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
           <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-[9px] text-[#d4af37] uppercase tracking-[0.4em] font-black">System Initializing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#e5e5e5] flex flex-col font-sans overflow-x-hidden relative">
      <NotificationOverlay />
      
      {state.view === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="space-y-8 z-10">
            <div className="inline-block px-6 py-2 border border-[#d4af37]/30 rounded-full bg-[#d4af37]/5">
              <span className="text-[10px] text-[#d4af37] font-black tracking-[0.5em] uppercase">Production Build v1.0</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#d4af37] via-[#f9f295] to-[#b8860b] drop-shadow-2xl">
              CruzPham<br/><span className="text-white">Trivia</span>
            </h1>

            <p className="text-sm md:text-lg text-white/30 max-w-xl mx-auto font-light leading-relaxed">
              The foundational layer for high-performance live trivia broadcasts. <br/>
              <span className="font-bold text-[#d4af37]">Ready for sequence injection.</span>
            </p>

            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'auth' })}
              className="px-10 py-4 bg-[#d4af37] text-black font-black rounded-xl hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(212,175,55,0.2)] uppercase tracking-[0.3em] text-xs"
            >
              Enter Studio
            </button>
          </div>

          <footer className="absolute bottom-8 text-center opacity-30">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black">Cruzpham Creators Network</p>
          </footer>
        </div>
      )}

      {state.view === 'auth' && <Auth />}
      {state.view === 'dashboard' && <Dashboard />}
      
      {/* Placeholder for Studio View */}
      {state.view === 'studio' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
             <h2 className="text-2xl font-display font-bold text-white">Studio Module</h2>
             <p className="text-xs text-white/30 uppercase tracking-widest">Awaiting Implementation</p>
             <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })} className="text-[10px] text-[#d4af37] underline underline-offset-4">Return to Dashboard</button>
          </div>
        </div>
      )}
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
