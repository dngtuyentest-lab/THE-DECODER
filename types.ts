
export interface Student {
  id: string;
  name: string;
  isLocked: boolean;
  row: number;
  table: number;
  seat: number;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
}

export enum GameType {
  RANDOM = 'RANDOM',
  THEMED = 'THEMED'
}

export interface GameConfig {
  type: GameType;
  mainKeyword?: string;
  questions: Question[];
  rewards: string[];
}

export enum GameStatus {
  SETUP_CLASS = 'SETUP_CLASS',
  SETUP_GAMEPLAY = 'SETUP_GAMEPLAY',
  PLAYING = 'PLAYING',
  ENDING = 'ENDING'
}

export interface PlayerProgress {
  studentId: string;
  isEliminated: boolean;
  hasGuessedMainKeyword: boolean;
}
