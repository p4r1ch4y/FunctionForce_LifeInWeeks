export interface User {
  id: string;
  email: string;
  birthdate: string;
}

export interface PersonalEvent {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description: string;
  category: 'Career' | 'Education' | 'Personal' | 'Travel';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface HistoricalEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineWeek {
  weekNumber: number;
  date: string;
  personalEvents: PersonalEvent[];
  historicalEvents: HistoricalEvent[];
  narrative?: string;
}

export interface LifeChapter {
  name: string;
  startAge: number;
  endAge: number;
  events: PersonalEvent[];
  artPrompt?: string;
  generatedArt?: string;
  color?: string;
}