export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Question {
  id: string;
  categoryId: string;
  points: number;
  prompt: string;
  answer: string;
  status: string;
}

export interface Category {
  id: string;
  title: string;
  questions: Question[];
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

export interface AppState {
  user: User | null;
  view: ViewState;
  notifications: Notification[];
  loading: boolean;
  isEditing: boolean;
  isLiveMode: boolean;
  isHostMode: boolean;
}

export type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_EDITING' }
  | { type: 'TOGGLE_LIVE_MODE' }
  | { type: 'TOGGLE_HOST_MODE' };