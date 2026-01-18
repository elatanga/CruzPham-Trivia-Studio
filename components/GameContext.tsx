import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, User, Notification } from '../types';
import { auth, onAuthStateChanged, signOut, syncUserRecord } from '../firebase';

const initialState: AppState = {
  user: null,
  view: 'landing',
  notifications: [],
  loading: true,
  isEditing: false,
  isLiveMode: false,
  isHostMode: false
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'TOGGLE_EDITING':
      return { ...state, isEditing: !state.isEditing };
    case 'TOGGLE_LIVE_MODE':
      return { ...state, isLiveMode: !state.isLiveMode };
    case 'TOGGLE_HOST_MODE':
      return { ...state, isHostMode: !state.isHostMode };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  notify: (type: Notification['type'], message: string) => void;
  logout: () => void;
} | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const notify = (type: Notification['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id, type, message } });
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 5000);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'SET_VIEW', payload: 'landing' });
      notify('info', 'Session Terminated');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || 'Creator'
        };
        await syncUserRecord(user);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });
    return () => unsub();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, notify, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};