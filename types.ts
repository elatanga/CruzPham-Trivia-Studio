
export type QuestionStatus = 'available' | 'selected' | 'answered' | 'void';
export type SaveStatus = 'idle' | 'saving' | 'saved';

export interface Notification {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface Clue {
  id: string;
  categoryId: string;
  points: number;
  prompt: string;
  answer: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  status: QuestionStatus;
}

export interface Category {
  id: string;
  title: string;
  questions?: Clue[];
}

export interface GameTemplate {
  id: string;
  ownerId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  categories: Category[];
  clues: Clue[];
  pointsConfig: {
    min: number;
    max: number;
    step: number;
  };
}

export interface Player {
  id: string;
  name: string;
  score: number;
  active: boolean;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
}

export interface GameSession {
  id: string;
  ownerId: string;
  templateId: string;
  activeQuestion: { categoryId: string; clueId: string } | null;
  showAnswer: boolean;
  scoreboard: Player[];
  timer: number | null;
  timerRunning: boolean;
  defaultTimerDuration: number;
  events: GameEvent[];
  status: 'lobby' | 'live' | 'ended';
  editingBy?: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export type ViewState = 
  | 'marketing/landing' 
  | 'auth' 
  | 'dashboard' 
  | 'template/edit' 
  | 'game/live' 
  | 'game/question'
  | 'game/control';

export interface GameState {
  user: User | null;
  templates: GameTemplate[];
  currentTemplateId: string | null;
  activeGameId: string | null;
  gameSession: GameSession | null;
  view: ViewState;
  isHostMode: boolean;
  isLiveMode: boolean;
  isEditing: boolean;
  soundEnabled: boolean;
  saveStatus: SaveStatus;
  notifications: Notification[];
}

export type GameAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SYNC_TEMPLATES'; payload: GameTemplate[] }
  | { type: 'SYNC_GAME_SESSION'; payload: GameSession }
  | { type: 'CREATE_TEMPLATE'; payload: GameTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: Partial<GameTemplate> & { id: string } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'IMPORT_TEMPLATE'; payload: GameTemplate }
  | { type: 'START_GAME'; payload: { gameId: string; templateId: string } }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameSession> }
  | { type: 'UPDATE_CLUE'; payload: { templateId: string; clueId: string; data: Partial<Clue> } }
  | { type: 'TOGGLE_HOST_MODE' }
  | { type: 'TOGGLE_LIVE_MODE' }
  | { type: 'TOGGLE_EDITING' }
  | { type: 'SET_TIMER'; payload: number | null }
  | { type: 'TOGGLE_TIMER_RUNNING' }
  | { type: 'SET_DEFAULT_TIMER'; payload: number }
  | { type: 'TICK_TIMER' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; name?: string; scoreDelta?: number; active?: boolean } }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'ADD_EVENT'; payload: string }
  | { type: 'SET_QUESTION_STATUS'; payload: { clueId: string; status: QuestionStatus; categoryId?: string } }
  | { type: 'SELECT_QUESTION'; payload: { categoryId: string; clueId: string } | null }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };