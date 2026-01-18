
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { GameState, GameAction, GameTemplate, GameSession, Player, Clue, ViewState, TemplateSchema } from '../types';
import { INITIAL_BOARD_DATA, SOUND_ASSETS } from '../constants';

const REALTIME_CHANNEL = 'cruzpham_firestore_v8';
const MAX_TEMPLATES = 40;
const MAX_PLAYERS = 10;

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playSound: (key: keyof typeof SOUND_ASSETS) => void;
  exportTemplate: (id: string) => void;
} | undefined>(undefined);

const playAudio = (key: keyof typeof SOUND_ASSETS, enabled: boolean) => {
  if (!enabled) return;
  const audio = new Audio(SOUND_ASSETS[key]);
  audio.volume = 0.25;
  audio.play().catch(() => {});
};

const INITIAL_PLAYERS: Player[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `p${i + 1}`,
  name: `Player ${i + 1}`,
  score: 0,
  active: true
}));

const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState = { ...state };

  switch (action.type) {
    case 'LOGIN':
      newState = { ...state, user: action.payload, view: 'dashboard' };
      break;
    case 'LOGOUT':
      newState = { ...state, user: null, view: 'marketing/landing' };
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
      if (state.templates.length >= MAX_TEMPLATES) {
        alert(`Maximum template limit of ${MAX_TEMPLATES} reached.`);
        return state;
      }
      newState = { ...state, templates: [action.payload, ...state.templates] };
      break;
    case 'IMPORT_TEMPLATE':
      try {
        const validated = TemplateSchema.parse(action.payload);
        if (state.templates.length >= MAX_TEMPLATES) {
          alert(`Maximum template limit reached.`);
          return state;
        }
        newState = { ...state, templates: [validated, ...state.templates] };
      } catch (err) {
        alert("Template validation failed: Integrity error.");
        return state;
      }
      break;
    case 'DELETE_TEMPLATE':
      newState = { ...state, templates: state.templates.filter(t => t.id !== action.payload) };
      break;
    case 'UPDATE_TEMPLATE':
      newState = {
        ...state,
        templates: state.templates.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t)
      };
      break;
    case 'START_GAME':
      const initialGame: GameSession = {
        id: action.payload.gameId,
        templateId: action.payload.templateId,
        activeQuestion: null,
        showAnswer: false,
        scoreboard: INITIAL_PLAYERS,
        timer: null,
        timerRunning: false,
        defaultTimerDuration: 15,
        events: [{ id: 'e1', timestamp: Date.now(), message: 'Production Module Synced' }],
        status: 'live'
      };
      newState = { 
        ...state, 
        activeGameId: action.payload.gameId, 
        currentTemplateId: action.payload.templateId,
        gameSession: initialGame,
        view: 'game/live',
        isLiveMode: true 
      };
      break;
    case 'UPDATE_GAME_STATE':
      if (!state.gameSession) return state;
      newState = { 
        ...state, 
        gameSession: { ...state.gameSession, ...action.payload } 
      };
      break;
    case 'UPDATE_CLUE':
      newState = {
        ...state,
        templates: state.templates.map(t => {
          if (t.id !== action.payload.templateId) return t;
          return {
            ...t,
            clues: t.clues.map(c => c.id === action.payload.clueId ? { ...c, ...action.payload.data } : c),
            updatedAt: Date.now()
          };
        })
      };
      break;
    case 'TOGGLE_HOST_MODE':
      newState = { ...state, isHostMode: !state.isHostMode };
      break;
    case 'TOGGLE_LIVE_MODE':
      newState = { ...state, isLiveMode: !state.isLiveMode, isEditing: false };
      break;
    case 'TOGGLE_EDITING':
      newState = { ...state, isEditing: !state.isEditing };
      break;
    case 'TOGGLE_SOUND':
      newState = { ...state, soundEnabled: !state.soundEnabled };
      break;
    case 'SET_TIMER':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: { 
          ...state.gameSession, 
          timer: action.payload,
          timerRunning: action.payload !== null && action.payload > 0
        }
      };
      break;
    case 'TOGGLE_TIMER_RUNNING':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: { 
          ...state.gameSession, 
          timerRunning: !state.gameSession.timerRunning 
        }
      };
      break;
    case 'SET_DEFAULT_TIMER':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: { 
          ...state.gameSession, 
          defaultTimerDuration: action.payload 
        }
      };
      break;
    case 'TICK_TIMER':
      if (!state.gameSession || state.gameSession.timer === null || !state.gameSession.timerRunning) return state;
      const nextTimer = Math.max(0, state.gameSession.timer - 1);
      newState = {
        ...state,
        gameSession: { 
          ...state.gameSession, 
          timer: nextTimer,
          timerRunning: nextTimer > 0
        }
      };
      break;
    case 'SET_SAVE_STATUS':
      newState = { ...state, saveStatus: action.payload };
      break;
    case 'UPDATE_PLAYER':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: {
          ...state.gameSession,
          scoreboard: state.gameSession.scoreboard.map(p => 
            p.id === action.payload.id ? { 
              ...p, 
              name: action.payload.name ?? p.name,
              score: p.score + (action.payload.scoreDelta ?? 0),
              active: action.payload.active ?? p.active
            } : p
          )
        }
      };
      break;
    case 'ADD_PLAYER':
      if (!state.gameSession || state.gameSession.scoreboard.length >= MAX_PLAYERS) return state;
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: action.payload || `Player ${state.gameSession.scoreboard.length + 1}`,
        score: 0,
        active: true
      };
      newState = {
        ...state,
        gameSession: {
          ...state.gameSession,
          scoreboard: [...state.gameSession.scoreboard, newPlayer]
        }
      };
      break;
    case 'REMOVE_PLAYER':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: {
          ...state.gameSession,
          scoreboard: state.gameSession.scoreboard.filter(p => p.id !== action.payload)
        }
      };
      break;
    case 'REVEAL_ANSWER':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: { ...state.gameSession, showAnswer: true, timerRunning: false }
      };
      break;
    case 'ADD_EVENT':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: {
          ...state.gameSession,
          events: [{ id: Date.now().toString(), timestamp: Date.now(), message: action.payload }, ...state.gameSession.events]
        }
      };
      break;
    case 'SET_QUESTION_STATUS':
      if (!state.gameSession || !state.currentTemplateId) return state;
      newState = {
        ...state,
        templates: state.templates.map(t => t.id === state.currentTemplateId ? {
          ...t,
          clues: t.clues.map(c => c.id === action.payload.clueId ? { ...c, status: action.payload.status } : c),
          updatedAt: Date.now()
        } : t),
        gameSession: { ...state.gameSession, activeQuestion: null, showAnswer: false, timer: null, timerRunning: false },
        view: 'game/live'
      };
      break;
    case 'SELECT_QUESTION':
      if (!state.gameSession) return state;
      newState = {
        ...state,
        gameSession: { ...state.gameSession, activeQuestion: action.payload, showAnswer: false, timer: null, timerRunning: false },
        view: action.payload ? 'game/question' : 'game/live'
      };
      break;
    default:
      return state;
  }

  if (typeof window !== 'undefined' && action.type !== 'TICK_TIMER' && !action.type.startsWith('SYNC')) {
    const bc = new BroadcastChannel(REALTIME_CHANNEL);
    bc.postMessage({ type: 'FIRESTORE_UPDATE', payload: newState });
    bc.close();
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
    playAudio(key, state.soundEnabled);
  }, [state.soundEnabled]);

  const exportTemplate = useCallback((id: string) => {
    const template = state.templates.find(t => t.id === id);
    if (!template) return;
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruzpham-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.templates]);

  useEffect(() => {
    if (state.gameSession?.timerRunning && state.gameSession?.timer !== null && state.gameSession.timer > 0) {
      const interval = window.setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.gameSession?.timerRunning, state.gameSession?.timer]);

  useEffect(() => {
    if (state.gameSession?.timer === 0 && state.gameSession?.timerRunning === false) {
      playSound('wrong');
    }
  }, [state.gameSession?.timer, state.gameSession?.timerRunning, playSound]);

  useEffect(() => {
    const bc = new BroadcastChannel(REALTIME_CHANNEL);
    bc.onmessage = (event) => {
      if (event.data.type === 'FIRESTORE_UPDATE') {
        const remoteState = event.data.payload;
        dispatch({ type: 'SYNC_TEMPLATES', payload: remoteState.templates });
        if (remoteState.activeGameId === state.activeGameId && remoteState.gameSession) {
          dispatch({ type: 'SYNC_GAME_SESSION', payload: remoteState.gameSession });
        }
      }
    };
    return () => bc.close();
  }, [state.activeGameId]);

  useEffect(() => {
    const saved = localStorage.getItem('cruzpham_production_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.templates) dispatch({ type: 'SYNC_TEMPLATES', payload: parsed.templates });
        if (parsed.user) dispatch({ type: 'LOGIN', payload: parsed.user });
      } catch (e) {
        console.error("Local storage recovery failed");
      }
    } else {
      const initialClues: Clue[] = INITIAL_BOARD_DATA.flatMap(cat => 
        (cat.questions || []).map(q => ({ ...q, categoryId: cat.id }))
      );
      const initialTemplate: GameTemplate = {
        id: 'default',
        ownerId: 'system',
        name: 'Alpha Premiere Set',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '2.0',
        categories: INITIAL_BOARD_DATA.map(c => ({ id: c.id, title: c.title })),
        clues: initialClues,
        pointsConfig: { min: 200, max: 1000, step: 200 }
      };
      dispatch({ type: 'CREATE_TEMPLATE', payload: initialTemplate });
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('cruzpham_production_v8', JSON.stringify({
        templates: state.templates,
        user: state.user
      }));
    }
  }, [state.templates, state.user]);

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
