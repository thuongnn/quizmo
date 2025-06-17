import type { Question } from './quiz';

export interface Course {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt: number;
} 