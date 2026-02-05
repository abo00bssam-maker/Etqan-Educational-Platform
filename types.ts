export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  feedback: string;
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  iconType: 'chart' | 'brain' | 'lamp';
  questions: Question[];
}

export enum AppState {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  CERTIFICATE = 'CERTIFICATE', // New state for final comprehensive result
}

export interface QuizStats {
  correct: number;
  incorrect: number;
  skipped: number;
  totalTime: number; // in seconds
}

// Track status of individual questions for the map
export type QuestionStatus = 'pending' | 'current' | 'correct' | 'incorrect' | 'skipped';

// Track overall session progress
export interface SessionProgress {
  completedModuleIds: string[];
  globalStats: Record<string, QuizStats>; // moduleId -> Stats
}