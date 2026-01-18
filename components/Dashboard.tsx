
import React from 'react';
import { useGame } from './GameContext';

const Dashboard: React.FC = () => {
  const { state, dispatch, logout } = useGame();

  return (
    <div className="w-full max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Studio Dashboard</h1>
          <p className="text-[10px] text-[#d4af37] uppercase tracking-[0.3em] font-black">Welcome, {state.user?.username}</p>
        </div>
        <button onClick={logout} className="px-6 py-2 border border-white/10 rounded-full text-[10px] text-white/50 hover:text-white uppercase tracking-widest transition-all">
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="glass-card p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 opacity-50 hover:opacity-100 transition-all cursor-pointer group" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'studio' })}>
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
              <span className="text-2xl text-white group-hover:text-black font-bold">+</span>
           </div>
           <p className="text-xs uppercase tracking-[0.2em] font-bold text-white">New Production</p>
        </div>
        
        <div className="glass-card p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 opacity-30">
           <p className="text-[10px] uppercase tracking-widest text-white/50">No Active Sessions</p>
        </div>
        
        <div className="glass-card p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 opacity-30">
           <p className="text-[10px] uppercase tracking-widest text-white/50">Analytics Offline</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
