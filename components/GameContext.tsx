
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { GameState, GameAction, GameTemplate, GameSession, Player, Clue, TemplateSchema } from '../types';
import { INITIAL_BOARD_DATA, SOUND_ASSETS } from '../constants';
import { db, saveTemplate, updateGameSession } from '../firebase';

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playSound: (key: keyof typeof SOUND_ASSETS) => void;
  exportTemplate: (id: string) => void;
} | undefined>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, view: 'dashboard' };
    case 'LOGOUT':
      return { ...state, user: null, view: 'marketing/landing' };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'CREATE_TEMPLATE':
      return { ...state, templates: [action.payload, ...state.templates] };
    case 'IMPORT_TEMPLATE':
      try {
        const validated = TemplateSchema.parse(action.payload);
        return { ...state, templates: [validated, ...state.templates] };
      } catch {
        alert("Integrity Error: Imported template is malformed.");
        return state;
      }
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
        events: [],
        status: 'live'
      };
      return { ...state, activeGameId: action.payload.gameId, currentTemplateId: action.payload.templateId, gameSession: newSession, view: 'game/live' };
    case 'UPDATE_GAME_STATE':
      return { ...state, gameSession: state.gameSession ? { ...state.gameSession, ...action.payload } : null };
    case 'TOGGLE_HOST_MODE':
      return { ...state, isHostMode: !state.isHostMode };
    case 'TOGGLE_LIVE_MODE':
      return { ...state, isLiveMode: !state.isLiveMode };
    case 'UPDATE_PLAYER':
      if (!state.gameSession) return state;
      return {
        ...state,
        gameSession: {
          ...state.gameSession,
          scoreboard: state.gameSession.scoreboard.map(p => 
            p.id === action.payload.id ? { ...p, score: p.score + (action.payload.scoreDelta || 0), name: action.payload.name || p.name } : p
          )
        }
      };
    case 'SELECT_QUESTION':
      if (!state.gameSession) return state;
      return {
        ...state,
        gameSession: { ...state.gameSession, activeQuestion: action.payload },
        view: action.payload ? 'game/question' : 'game/live'
      };
    case 'REVEAL_ANSWER':
      return state.gameSession ? { ...state, gameSession: { ...state.gameSession, showAnswer: true } } : state;
    case 'SET_QUESTION_STATUS':
      if (!state.gameSession || !state.currentTemplateId) return state;
      return {
        ...state,
        templates: state.templates.map(t => t.id === state.currentTemplateId ? {
          ...t,
          clues: t.clues.map(c => c.id === action.payload.clueId ? { ...c, status: action.payload.status } : c)
        } : t),
        view: 'game/live',
        gameSession: { ...state.gameSession, activeQuestion: null, showAnswer: false }
      };
    default:
      return state;
  }
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
    const blob = new Blob([JSON.stringify(template)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruzpham-${id}.json`;
    a.click();
  }, [state.templates]);

  // Real-time synchronization with Firestore (Simulated for this demo using localStorage + BroadcastChannel)
  useEffect(() => {
    const bc = new BroadcastChannel('cruzpham_sync');
    bc.onmessage = (e) => {
      // In production, this would be a Firestore listener
      if (e.data.type === 'REMOTE_UPDATE') {
        dispatch({ type: 'SYNC_GAME_SESSION', payload: e.data.payload } as any);
      }
    };
    return () => bc.close();
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, playSound, exportTemplate }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
