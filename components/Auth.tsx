import React, { useState } from 'react';
import { useGame } from './GameContext';

const Auth: React.FC = () => {
  const { dispatch } = useGame();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    dispatch({ 
      type: 'LOGIN', 
      payload: { id: `user-${Date.now()}`, username, email: `${username}@cruzpham.it` } 
    });
  };

  return (
    <div className="h-screen w-screen bg-[#030303] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>
      
      <div className="w-full max-w-md glass-card rounded-[3rem] p-8 md:p-12 border border-[#d4af37]/20 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient uppercase tracking-tighter text-center">
            {isLogin ? 'Access Studio' : 'Establish Node'}
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black text-center">
            Secure Production Protocol
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-center">
          <div className="space-y-2 text-center">
            <label className="text-[10px] uppercase font-black text-[#d4af37] tracking-[0.4em] block">Identity Token</label>
            <input 
              autoFocus
              required
              placeholder="Username"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white focus:border-[#d4af37] outline-none text-xl font-bold transition-all placeholder:text-white/5 text-center"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-6 bg-[#d4af37] text-black font-black rounded-2xl uppercase text-xs tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.2)] text-center"
          >
            {isLogin ? 'LOGIN' : 'Register'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors text-center"
          >
            {isLogin ? "NEED AN ACCOUNT? SIGN UP" : "ALREADY ESTABLISHED? LOG IN"}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center z-10 space-y-2 opacity-30">
        <p className="text-[9px] text-white uppercase tracking-[0.6em] font-black text-center">
          PROPERTY OF CRUZPHAM CREATORS NETWORK
        </p>
        <p className="text-[9px] text-[#d4af37] uppercase tracking-[0.6em] font-black text-center">
          DESIGNED BY EL CRUZPHAM ALPHA
        </p>
      </div>
    </div>
  );
};

export default Auth;