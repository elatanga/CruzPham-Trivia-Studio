
export interface User {
  id: string;
  username: string;
  email: string;
}

export type QuestionStatus = 'available' | 'active' | 'completed' | 'void';

export interface Question {
  id: string;
  categoryId: string;
  points: number;
  prompt: string;
  answer: string;
  status: QuestionStatus;
  type?: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  isDailyDouble?: boolean; // New: Double or Nothing flag
}

export interface Category {
  id: string;
  title: string;
  fontSize?: number;
  questions: Question[];
}

export interface GameSettings {
  minPoints: number;
  maxPoints: number;
  step: number;
  currencySymbol: string;
  timerDuration: number; // New: default timer in seconds
}

export interface Template {
  id: string;
  ownerId: string;
  name: string;
  settings: GameSettings;
  categories: Category[];
  createdAt: number;
  updatedAt: number;
  updatedBy: string;
}

export type ViewState = 
  | 'landing' 
  | 'auth' 
  | 'dashboard' 
  | 'studio' 
  | 'marketing/landing'
  | 'template/edit'
  | 'game/live'
  | 'game/question'
  | 'game/control';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
}

export interface AppState {
  user: User | null;
  view: ViewState;
  notifications: Notification[];
  loading: boolean;
  
  // Active Game State
  activeTemplate: Template | null;
  activeQuestionId: string | null;
  isAnswerRevealed: boolean;
  
  // Gameplay Features
  players: Player[];
  activityLog: LogEntry[];
  timer: number;
  isTimerRunning: boolean;
  isSoundEnabled: boolean;
  
  // UI Flags
  isEditing: boolean;
  isLiveMode: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved'; // New: visible status
}

export type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'LOAD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE_SETTINGS'; payload: GameSettings }
  | { type: 'UPDATE_CATEGORY'; payload: { categoryIndex: number; field: keyof Category; value: any } }
  | { type: 'UPDATE_QUESTION'; payload: { categoryIndex: number; questionIndex: number; field: keyof Question; value: any } }
  | { type: 'SET_ACTIVE_QUESTION'; payload: string | null }
  | { type: 'REVEAL_ANSWER'; payload: boolean }
  | { type: 'MARK_QUESTION_STATUS'; payload: { categoryIndex: number; questionIndex: number; status: QuestionStatus } }
  | { type: 'TOGGLE_EDITING' }
  | { type: 'TOGGLE_LIVE_MODE' }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'SET_PLAYER_ACTIVE'; payload: string } 
  | { type: 'ADJUST_SCORE'; payload: { playerId: string; delta: number } }
  | { type: 'LOG_ACTIVITY'; payload: string }
  | { type: 'SET_TIMER'; payload: number }
  | { type: 'TOGGLE_TIMER'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_SAVE_STATUS'; payload: 'saved' | 'saving' | 'unsaved' }; // New Action
