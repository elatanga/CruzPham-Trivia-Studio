
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { GameState, GameAction, GameTemplate, GameSession, Player, Clue } from '../types';
import { INITIAL_BOARD_DATA, SOUND_ASSETS } from '../constants';
import { db, upsertTemplate, upsertSession, subscribeToTemplates, subscribeToGameSession, auth, onAuthStateChanged, signOut } from '../firebase';

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playSound: (key: keyof typeof SOUND_ASSETS) => void;
  exportTemplate: (id: string) => void;
  handleLogout: () => Promise<void>;
} | undefined>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState = { ...state };

  switch (action.type) {
    case 'LOGIN':
      newState = { ...state, user: action.payload, view: state.view === 'auth' ? 'dashboard' : state.view };
      break;
    case 'LOGOUT':
      newState = { ...state, user: null, view: 'marketing/landing', templates: [], activeGameId: null, gameSession: null };
      break;
    case 'SET_VIEW':
      newState = { ...state, view: action.payload };
      break;
    case 'SYNC_TEMPLATES':
      newState = { ...state, templates: action.payload };
      break;
    case 'SYNC_GAME_SESSION':
      newState = { ...state, gameSession: action.payload };
      break;
    case 'CREATE_TEMPLATE':
      newState = { ...state, templates: [action.payload, ...state.templates] };
      upsertTemplate(action.payload);
      break;
    case 'IMPORT_TEMPLATE':
      try {
        const validated = action.payload as GameTemplate;
        newState = { ...state, templates: [validated, ...state.templates] };
        upsertTemplate(validated);
      } catch (err) {
        alert("Integrity Check Failed: Malformed template file.");
        return state;
      }
      break;
    case 'DELETE_TEMPLATE':
      newState = { ...state, templates: state.templates.filter(t => t.id !== action.payload) };
      break;
    case 'UPDATE_TEMPLATE':
      const updatedTemplates = state.templates.map(t => 
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      newState = { ...state, templates: updatedTemplates };
      const target = updatedTemplates.find(t => t.id === action.payload.id);
      if (target) upsertTemplate(target);
      break;
    case 'START_GAME':
      const newSession: GameSession = {
        id: action.payload.gameId,
        templateId: action.payload.templateId,
        activeQuestion: null,
        showAnswer: false,
        scoreboard: state.gameSession?.scoreboard || [],
        timer: null,
        timerRunning: false,
        defaultTimerDuration: 15,
        events: [{ id: 'init', timestamp: Date.now(), message: 'Stage Synchronized' }],
        status: 'live'
      };
      newState = { 
        ...state, 
        activeGameId: action.payload.gameId, 
        currentTemplateId: action.payload.templateId, 
        gameSession: newSession, 
        view: 'game/live' 
      };
      upsertSession(action.payload.gameId, newSession);
      break;
    case 'UPDATE_GAME_STATE':
      if (!state.gameSession) return state;
      const sessionData = { ...state.gameSession, ...action.payload };
      newState = { ...state, gameSession: sessionData };
      upsertSession(state.gameSession.id, sessionData);
      break;
    case 'SELECT_QUESTION':
      if (!state.gameSession) return state;
      const selectUpdate = { ...state.gameSession, activeQuestion: action.payload, showAnswer: false };
      newState = { ...state, gameSession: selectUpdate, view: action.payload ? 'game/question' : 'game/live' };
      upsertSession(state.gameSession.id, selectUpdate);
      break;
    case 'REVEAL_ANSWER':
      if (!state.gameSession) return state;
      const revealUpdate = { ...state.gameSession, showAnswer: true, timerRunning: false };
      newState = { ...state, gameSession: revealUpdate };
      upsertSession(state.gameSession.id, revealUpdate);
      break;
    case 'UPDATE_PLAYER':
      if (!state.gameSession) return state;
      const playerUpdate = {
        ...state.gameSession,
        scoreboard: state.gameSession.scoreboard.map(p => 
          p.id === action.payload.id ? { 
            ...p, 
            score: p.score + (action.payload.scoreDelta || 0), 
            name: action.payload.name || p.name,
            active: action.payload.active ?? p.active
          } : p
        )
      };
      newState = { ...state, gameSession: playerUpdate };
      upsertSession(state.gameSession.id, playerUpdate);
      break;
    case 'TICK_TIMER':
      if (!state.gameSession || state.gameSession.timer === null || !state.gameSession.timerRunning) return state;
      newState = {
        ...state,
        gameSession: { ...state.gameSession, timer: Math.max(0, state.gameSession.timer - 1) }
      };
      break;
    default:
      return state;
  }

  return newState;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    user: null,
    templates: [],
    currentTemplateId: null,
    activeGameId: null,
    gameSession: null,
    view: 'marketing/landing',
    isHostMode: false,
    isLiveMode: false,
    isEditing: false,
    soundEnabled: true,
    saveStatus: 'idle'
  });

  const playSound = useCallback((key: keyof typeof SOUND_ASSETS) => {
    if (!state.soundEnabled) return;
    new Audio(SOUND_ASSETS[key]).play().catch(() => {});
  }, [state.soundEnabled]);

  const exportTemplate = useCallback((id: string) => {
    const template = state.templates.find(t => t.id === id);
    if (!template) return;
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruzpham-production-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.templates]);

  const handleLogout = useCallback(async () => {
    if (!auth) {
      dispatch({ type: 'LOGOUT' });
      return;
    }
    await signOut(auth);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Sync Auth State
  useEffect(() => {
    if (!auth) {
      console.warn("Auth service unavailable.");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            email: firebaseUser.email || ''
          }
        });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Templates from Firestore
  useEffect(() => {
    if (state.user && db) {
      const unsub = subscribeToTemplates(state.user.id, (templates) => {
        dispatch({ type: 'SYNC_TEMPLATES', payload: templates });
      });
      return () => unsub();
    }
  }, [state.user]);

  // Sync Game Session from Firestore
  useEffect(() => {
    if (state.activeGameId && db) {
      const unsub = subscribeToGameSession(state.activeGameId, (session) => {
        dispatch({ type: 'SYNC_GAME_SESSION', payload: session });
      });
      return () => unsub();
    }
  }, [state.activeGameId]);

  // Timer Tick
  useEffect(() => {
    if (state.gameSession?.timerRunning && state.gameSession?.timer !== null && state.gameSession.timer > 0) {
      const interval = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.gameSession?.timerRunning, state.gameSession?.timer]);

  return (
    <GameContext.Provider value={{ state, dispatch, playSound, exportTemplate, handleLogout }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
