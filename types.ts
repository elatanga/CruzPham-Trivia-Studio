
import { z } from 'zod';

export type QuestionStatus = 'available' | 'selected' | 'answered' | 'void';
export type SaveStatus = 'idle' | 'saving' | 'saved';

// Zod Schemas for Validation
export const ClueSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  points: z.number().min(0),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(['image', 'audio']).optional(),
  status: z.enum(['available', 'selected', 'answered', 'void']).default('available'),
});

export const CategorySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Category title required"),
});

export const TemplateSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(1, "Template name required"),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.string().default('2.0'),
  categories: z.array(CategorySchema).min(1),
  clues: z.array(ClueSchema),
  pointsConfig: z.object({
    min: z.number(),
    max: z.number(),
    step: z.number(),
  }),
});

export type Clue = z.infer<typeof ClueSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type GameTemplate = z.infer<typeof TemplateSchema>;

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
  | { type: 'SELECT_QUESTION'; payload: { categoryId: string; clueId: string } | null };
