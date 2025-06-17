import type { QuizState } from '../types/quiz';

const getQuizStateKey = (courseId: string) => `quiz_state_${courseId}`;

export const saveQuizState = (courseId: string, state: QuizState): void => {
  localStorage.setItem(getQuizStateKey(courseId), JSON.stringify(state));
};

export const getQuizState = (courseId: string): QuizState | null => {
  const state = localStorage.getItem(getQuizStateKey(courseId));
  return state ? JSON.parse(state) : null;
};

export const resetQuizState = (courseId: string): void => {
  localStorage.removeItem(getQuizStateKey(courseId));
}; 