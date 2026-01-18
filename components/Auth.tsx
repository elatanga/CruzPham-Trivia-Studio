
import React, { useState } from 'react';
import { useGame } from './GameContext';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  isCloudEnabled, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  syncUserRecord
} from '../firebase';

type AuthMode = 'login' | 'signup' | 'reset';

const Auth: React.FC = () => {
  const { dispatch } = useGame();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const validate = () => {
    if (!email.includes('@')) return "Valid email protocol required.";
    if (mode === 'signup' && !username.trim()) return "Identification string (username) required.";
    if (mode !== 'reset' && password.length < 8) return "Security key must be at least 8 characters.";
    return null;
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCloudEnabled || !auth) {
      setError("Cloud services restricted. Bypassing identity...");
      setTimeout(handleGuestLogin, 1500);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: username });
        const userPayload = { id: result.user.uid, username: username, email: result.user.email || '' };
        await syncUserRecord(userPayload);
        dispatch({ type: 'LOGIN', payload: userPayload });
      } else if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userPayload = { 
          id: result.user.uid, 
          username: result.user.displayName || result.user.email?.split('@')[0] || 'Member', 
          email: result.user.email || '' 
        };
        await syncUserRecord(userPayload);
        dispatch({ type: 'LOGIN', payload: userPayload });
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Recovery protocol initiated. Check your inbox.");
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') setError("Identity already exists in vault.");
      else if (code === 'auth/wrong-password' || code === 'auth/user-not-found') setError("Invalid credential signature.");
      else if (code === 'auth/invalid-email') setError("Email protocol malformed.");
      else if (code === 'auth/network-request-failed') setError("Network Connection Lost.");
      else if (code === 'auth/too-many-requests') setError("Access Rate Limit Exceeded.");
      else setError("Handshake failed. Protocol error.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isCloudEnabled || !auth) {
      setError("Cloud Protocol offline. Redirecting to Guest Access...");
      setTimeout(handleGuestLogin, 1500);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userPayload = { 
        id: result.user.uid, 
        username: result.user.displayName || result.user.email?.split('@')[0] || 'Creator', 
        email: result.user.email || '' 
      };
      await syncUserRecord(userPayload);
      dispatch({ type: 'LOGIN', payload: userPayload });
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Authorization cancelled by user.");
      } else {
        setError("Google identity access denied.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    dispatch({ 
      type: 'LOGIN', 
      payload: { 
        id: 'guest', 
        username: 'Studio Guest', 
        email: 'guest@cruzpham.local' 
      } 
    });
  };

  return (
    <div className="h-screen w-screen bg-[#030303] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] animate-pulse"></div>
      
      <div className="w-full max-w-md glass-card rounded-[3rem] p-8 md:p-12 border border-[#d4af37]/20 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-black/40 border border-[#d4af37]/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-2xl font-black gold-gradient">CP</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold gold-gradient uppercase tracking-tighter text-center">
            {mode === 'login' ? 'Establish Identity' : mode === 'signup' ? 'Create Vault' : 'Recovery Sequence'}
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black text-center">
            CruzPham Production Vault
          </p>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <input 
                type="text" 
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest focus:border-[#d4af37] outline-none transition-all text-center uppercase"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest focus:border-[#d4af37] outline-none transition-all text-center uppercase"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <input 
                type="password" 
                placeholder="SECURITY KEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs tracking-widest focus:border-[#d4af37] outline-none transition-all text-center uppercase"
                required
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#d4af37] text-black font-black rounded-2xl uppercase text-[10px] tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50 mt-4 overflow-hidden relative"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            ) : (
              mode === 'login' ? 'AUTHORIZE ACCESS' : mode === 'signup' ? 'INITIALIZE VAULT' : 'SEND RECOVERY'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          {mode === 'login' && (
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 border border-white/10 text-white/50 hover:text-white transition-all rounded-2xl flex items-center justify-center gap-3 text-[9px] uppercase tracking-widest font-black"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              GOOGLE PROTOCOL
            </button>
          )}

          <div className="flex justify-center gap-4 text-[8px] uppercase font-black tracking-widest text-white/30">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('signup')} className="hover:text-[#d4af37] transition-colors">Sign Up</button>
                <span>•</span>
                <button onClick={() => setMode('reset')} className="hover:text-[#d4af37] transition-colors">Forgot Key</button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="hover:text-[#d4af37] transition-colors">Return to Login</button>
            )}
          </div>

          <button onClick={handleGuestLogin} className="mt-2 text-white/10 hover:text-white/30 text-[7px] uppercase tracking-[0.5em] font-black transition-colors">
            Bypass & Enter as Guest
          </button>
        </div>

        {(error || success) && (
          <div className={`mt-6 p-4 rounded-2xl border ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'} animate-shake`}>
            <p className="text-[9px] uppercase tracking-widest font-black text-center leading-relaxed">
              {error || success}
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 opacity-30 text-center space-y-1">
        <p className="text-[9px] text-white uppercase tracking-[0.6em] font-black">
          PROPERTY OF CRUZPHAM CREATORS NETWORK
        </p>
        <p className="text-[9px] text-[#d4af37] uppercase tracking-[0.6em] font-black">
          DESIGNED BY EL CRUZPHAM ALPHA
        </p>
      </div>
    </div>
  );
};

export default Auth;
