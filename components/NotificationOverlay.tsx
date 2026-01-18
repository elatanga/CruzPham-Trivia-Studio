
import React, { useEffect } from 'react';
import { useGame } from './GameContext';

const NotificationOverlay: React.FC = () => {
  const { state, dispatch } = useGame();

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 w-full max-w-md pointer-events-none px-4">
      {state.notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onClose={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id })} />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: any; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, notification.duration || 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const bgColor = {
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    info: 'bg-[#d4af37]/20 border-[#d4af37]/50 text-[#d4af37]',
    warning: 'bg-orange-500/20 border-orange-500/50 text-orange-400'
  }[notification.type];

  return (
    <div className={`w-full glass-card p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 pointer-events-auto shadow-2xl ${bgColor}`}>
      <div className="flex-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
        {notification.message}
      </div>
      <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  );
};

export default NotificationOverlay;
